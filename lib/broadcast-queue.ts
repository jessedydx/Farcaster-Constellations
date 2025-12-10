import { redis } from './database';

export interface BroadcastMessage {
    title: string;
    body: string;
    targetUrl: string;
}

export interface BroadcastStats {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    processing: number;
    clicks: number;
    startTime: number;
    endTime?: number;
    duration?: number;
}

/**
 * Initialize a new broadcast and enqueue all FIDs
 */
export async function enqueueBroadcast(
    fids: number[],
    message: BroadcastMessage
): Promise<string> {
    const broadcastId = Date.now().toString();

    try {
        // Store message
        await redis.setex(
            `broadcast:${broadcastId}:message`,
            180 * 24 * 60 * 60, // 180 days TTL
            JSON.stringify(message)
        );

        // Enqueue all FIDs
        if (fids.length > 0) {
            await redis.lpush(`broadcast:${broadcastId}:pending`, ...fids.map(String));
        }

        // Initialize stats
        await redis.hset(`broadcast:${broadcastId}:stats`, {
            total: fids.length,
            sent: 0,
            failed: 0,
            pending: fids.length,
            processing: 0,
            clicks: 0,
            startTime: Date.now()
        });

        // Add to active broadcasts and history
        await redis.sadd('broadcast:active', broadcastId);
        await redis.lpush('broadcast:history', broadcastId);

        console.log(`📢 Broadcast ${broadcastId} enqueued with ${fids.length} FIDs`);

        return broadcastId;
    } catch (error) {
        console.error('Error enqueueing broadcast:', error);
        throw error;
    }
}

/**
 * Get current status of a broadcast
 */
export async function getBroadcastStatus(broadcastId: string): Promise<BroadcastStats | null> {
    try {
        const stats = await redis.hgetall(`broadcast:${broadcastId}:stats`);

        if (!stats || Object.keys(stats).length === 0) {
            return null;
        }

        return {
            total: parseInt(stats.total || '0'),
            sent: parseInt(stats.sent || '0'),
            failed: parseInt(stats.failed || '0'),
            pending: parseInt(stats.pending || '0'),
            processing: parseInt(stats.processing || '0'),
            clicks: parseInt(stats.clicks || '0'),
            startTime: parseInt(stats.startTime || '0'),
            endTime: stats.endTime ? parseInt(stats.endTime) : undefined,
            duration: stats.duration ? parseInt(stats.duration) : undefined
        };
    } catch (error) {
        console.error('Error getting broadcast status:', error);
        return null;
    }
}

/**
 * Mark a FID as succeeded
 */
export async function markSuccess(broadcastId: string, fid: number): Promise<void> {
    await redis.sadd(`broadcast:${broadcastId}:succeeded`, fid);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'sent', 1);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'pending', -1);
}

/**
 * Mark a FID as failed with error message
 */
export async function markFailed(
    broadcastId: string,
    fid: number,
    error: string
): Promise<void> {
    await redis.hset(`broadcast:${broadcastId}:failed`, fid, error);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'failed', 1);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'pending', -1);
}

/**
 * Get next FID from queue
 */
export async function getNextFID(broadcastId: string): Promise<number | null> {
    const fid = await redis.rpop(`broadcast:${broadcastId}:pending`);
    if (!fid) return null;

    // Add to processing set
    await redis.sadd(`broadcast:${broadcastId}:processing`, fid);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'processing', 1);

    return parseInt(fid);
}

/**
 * Remove from processing set
 */
export async function removeFromProcessing(broadcastId: string, fid: number): Promise<void> {
    await redis.srem(`broadcast:${broadcastId}:processing`, fid);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'processing', -1);
}

/**
 * Complete broadcast
 */
export async function completeBroadcast(broadcastId: string): Promise<void> {
    const stats = await getBroadcastStatus(broadcastId);
    if (!stats) return;

    const endTime = Date.now();
    const duration = endTime - stats.startTime;

    await redis.hset(`broadcast:${broadcastId}:stats`, {
        endTime,
        duration
    });

    // Remove from active
    await redis.srem('broadcast:active', broadcastId);

    console.log(`✅ Broadcast ${broadcastId} completed in ${duration}ms`);
}

/**
 * Get failed FIDs for retry
 */
export async function getFailedFIDs(broadcastId: string): Promise<Array<{ fid: number, error: string }>> {
    const failed = await redis.hgetall(`broadcast:${broadcastId}:failed`);

    return Object.entries(failed).map(([fid, error]) => ({
        fid: parseInt(fid),
        error
    }));
}

/**
 * Re-enqueue failed FIDs for retry
 */
export async function retryFailed(broadcastId: string): Promise<number> {
    const failedEntries = await getFailedFIDs(broadcastId);

    if (failedEntries.length === 0) {
        return 0;
    }

    // Clear failed hash
    await redis.del(`broadcast:${broadcastId}:failed`);

    // Re-enqueue
    const fids = failedEntries.map(e => e.fid);
    await redis.lpush(`broadcast:${broadcastId}:pending`, ...fids.map(String));

    // Update stats
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'pending', fids.length);
    await redis.hincrby(`broadcast:${broadcastId}:stats`, 'failed', -fids.length);

    // Re-add to active if needed
    await redis.sadd('broadcast:active', broadcastId);

    console.log(`🔄 Re-enqueued ${fids.length} failed FIDs for broadcast ${broadcastId}`);

    return fids.length;
}

/**
 * Get broadcast message
 */
export async function getBroadcastMessage(broadcastId: string): Promise<BroadcastMessage | null> {
    const message = await redis.get(`broadcast:${broadcastId}:message`);
    if (!message) return null;

    return JSON.parse(message);
}

/**
 * Get all broadcast IDs from history
 */
export async function getBroadcastHistory(limit: number = 50): Promise<string[]> {
    return await redis.lrange('broadcast:history', 0, limit - 1);
}

/**
 * Check if broadcast is active
 */
export async function isBroadcastActive(broadcastId: string): Promise<boolean> {
    return await redis.sismember('broadcast:active', broadcastId) === 1;
}
