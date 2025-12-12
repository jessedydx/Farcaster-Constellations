import Redis from 'ioredis';

// Singleton Redis connection
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
    if (!redisClient) {
        const REDIS_URL = process.env.REDIS_URL || '';

        if (!REDIS_URL) {
            throw new Error('REDIS_URL environment variable is required');
        }
        redisClient = new Redis(REDIS_URL);
        console.log('🔗 Redis connection initialized');
    }
    return redisClient;
}

export const redis = getRedisClient();

export interface ConstellationRecord {
    fid: number;
    username: string;
    ipfsHash: string;
    imageUrl: string;
    createdAt: number;
    minted: boolean;
    tokenId: number | null;
    txHash: string | null;
    mintedAt: number | null;
    followerCount?: number;
    powerBadge?: boolean;
    neynarScore?: number;
    topInteractions?: string[]; // Username list of top 5 interactions
}

export async function trackConstellation(data: {
    fid: number;
    username: string;
    ipfsHash: string;
    imageUrl: string;
    followerCount?: number;
    powerBadge?: boolean;
    neynarScore?: number;
    topInteractions?: string[];
}): Promise<void> {
    const key = `constellation:${data.fid}:${Date.now()}`;

    const record: ConstellationRecord = {
        ...data,
        createdAt: Date.now(),
        minted: false,
        tokenId: null,
        txHash: null,
        mintedAt: null,
    };

    // Store topInteractions as JSON string in Redis
    const redisRecord = {
        ...record,
        topInteractions: data.topInteractions ? JSON.stringify(data.topInteractions) : undefined
    };

    await redis.hset(key, redisRecord as any);
    await redis.zadd('constellations:timeline', Date.now(), key);

    // ✨ NEW: Increment cached stats
    await incrementCreateStats();

    console.log(`✅ Tracked constellation: FID ${data.fid}`);
}

export async function markAsMinted(fid: number, txHash: string, tokenId?: number): Promise<void> {
    const keys = await redis.keys(`constellation:${fid}:*`);

    console.log(`🔍 Looking for constellations for FID ${fid}, found ${keys.length} keys`);

    if (keys.length === 0) {
        console.log(`⚠️ No constellation found for FID ${fid}, creating placeholder record`);

        // Create a placeholder constellation record for this mint
        const timestamp = Date.now();
        const key = `constellation:${fid}:${timestamp}`;

        const placeholderRecord = {
            fid: fid.toString(),
            username: `user_${fid}`, // Placeholder username
            ipfsHash: '',
            imageUrl: '',
            createdAt: timestamp.toString(),
            minted: 'true',
            tokenId: tokenId?.toString() || '',
            txHash,
            mintedAt: timestamp.toString(),
            placeholder: 'true' // Mark as placeholder
        };

        await redis.hset(key, placeholderRecord as any);
        await redis.zadd('constellations:timeline', timestamp, key);

        console.log(`✅ Created placeholder record and marked as minted: FID ${fid}`);
        return;
    }

    for (const key of keys.reverse()) {
        const record = await redis.hgetall(key);
        console.log(`Checking key: ${key}, minted: ${record.minted}`);

        if (record && record.minted !== 'true') {
            // Update individual fields
            await redis.hset(key, 'minted', 'true');
            await redis.hset(key, 'txHash', txHash);
            await redis.hset(key, 'mintedAt', Date.now().toString());
            if (tokenId) {
                await redis.hset(key, 'tokenId', tokenId.toString());
            }

            // ✨ NEW: Increment cached stats
            await incrementMintStats();

            console.log(`✅ Marked as minted: FID ${fid}, key: ${key}`);
            return;
        }
    }

    console.log(`⚠️ All constellations for FID ${fid} already minted`);
}

export async function getStats() {
    const keys = await redis.keys('constellation:*');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let totalCreates = 0, totalMints = 0, thisWeekCreates = 0, thisWeekMints = 0;

    for (const key of keys) {
        const record = await redis.hgetall(key);
        if (!record || !record.fid) continue;

        totalCreates++;
        if (record.minted === 'true') totalMints++;
        if (parseInt(record.createdAt) > oneWeekAgo) {
            thisWeekCreates++;
            if (record.minted === 'true') thisWeekMints++;
        }
    }

    return {
        totalCreates,
        totalMints,
        conversionRate: totalCreates > 0 ? Math.round((totalMints / totalCreates) * 100) : 0,
        thisWeekCreates,
        thisWeekMints,
    };
}

// ✨ NEW: Cached Stats Functions for instant dashboard loading

// Get stats from cache (instant!)
export async function getCachedStats() {
    const cached = await redis.hgetall('stats:global');

    if (!cached || !cached.totalCreates) {
        // First time - calculate and cache
        console.log('📊 First time loading stats, calculating...');
        return await recalculateStats();
    }

    return {
        totalCreates: parseInt(cached.totalCreates),
        totalMints: parseInt(cached.totalMints),
        conversionRate: parseInt(cached.conversionRate),
        thisWeekCreates: parseInt(cached.thisWeekCreates),
        thisWeekMints: parseInt(cached.thisWeekMints),
    };
}

// Increment stats on constellation create
export async function incrementCreateStats() {
    await redis.hincrby('stats:global', 'totalCreates', 1);
    await redis.hincrby('stats:global', 'thisWeekCreates', 1);
    await updateConversionRate();
    console.log('📈 Stats incremented: create');
}

// Increment stats on mint
export async function incrementMintStats() {
    await redis.hincrby('stats:global', 'totalMints', 1);
    await redis.hincrby('stats:global', 'thisWeekMints', 1);
    await updateConversionRate();
    console.log('📈 Stats incremented: mint');
}

// Update conversion rate
async function updateConversionRate() {
    const stats = await redis.hgetall('stats:global');
    const totalCreates = parseInt(stats.totalCreates || '0');
    const totalMints = parseInt(stats.totalMints || '0');
    const rate = totalCreates > 0 ? Math.round((totalMints / totalCreates) * 100) : 0;
    await redis.hset('stats:global', 'conversionRate', rate);
}

// Manual recalculate (for admin "Sync" button or first-time init)
export async function recalculateStats() {
    console.log('🔄 Recalculating all stats from scratch...');
    const stats = await getStats(); // Use existing function

    // Save to cache
    await redis.hset('stats:global', {
        totalCreates: stats.totalCreates.toString(),
        totalMints: stats.totalMints.toString(),
        conversionRate: stats.conversionRate.toString(),
        thisWeekCreates: stats.thisWeekCreates.toString(),
        thisWeekMints: stats.thisWeekMints.toString(),
    });

    console.log('✅ Stats recalculated and cached');
    return stats;
}


export async function getRecentActivity(limit: number = 50): Promise<ConstellationRecord[]> {
    const keys = await redis.zrevrange('constellations:timeline', 0, limit - 1);
    const records: ConstellationRecord[] = [];

    for (const key of keys) {
        const record = await redis.hgetall(key);
        if (record && record.fid) {
            records.push({
                fid: parseInt(record.fid),
                username: record.username,
                ipfsHash: record.ipfsHash,
                imageUrl: record.imageUrl,
                createdAt: parseInt(record.createdAt),
                minted: record.minted === 'true',
                tokenId: record.tokenId ? parseInt(record.tokenId) : null,
                txHash: record.txHash || null,
                mintedAt: record.mintedAt ? parseInt(record.mintedAt) : null,
                followerCount: record.followerCount ? parseInt(record.followerCount) : undefined,
                powerBadge: record.powerBadge === 'true',
                neynarScore: record.neynarScore ? parseFloat(record.neynarScore) : undefined,
                topInteractions: record.topInteractions ? JSON.parse(record.topInteractions) : undefined
            });
        }
    }

    return records;
}

export async function getUserMintedConstellations(fid: number, limit: number = 10): Promise<ConstellationRecord[]> {
    const keys = await redis.keys(`constellation:${fid}:*`);
    const records: ConstellationRecord[] = [];

    for (const key of keys) {
        const record = await redis.hgetall(key);
        if (record && record.fid && record.minted === 'true') {
            records.push({
                fid: parseInt(record.fid),
                username: record.username,
                ipfsHash: record.ipfsHash,
                imageUrl: record.imageUrl,
                createdAt: parseInt(record.createdAt),
                minted: record.minted === 'true',
                tokenId: record.tokenId ? parseInt(record.tokenId) : null,
                txHash: record.txHash || null,
                mintedAt: record.mintedAt ? parseInt(record.mintedAt) : null,
                followerCount: record.followerCount ? parseInt(record.followerCount) : undefined,
                powerBadge: record.powerBadge === 'true',
                neynarScore: record.neynarScore ? parseFloat(record.neynarScore) : undefined,
                topInteractions: record.topInteractions ? JSON.parse(record.topInteractions) : undefined
            });
        }
    }

    // Sort by mintedAt (newest first) and limit
    return records
        .sort((a, b) => (b.mintedAt || 0) - (a.mintedAt || 0))
        .slice(0, limit);
}


export async function getGlobalStats() {
    const allKeys = await redis.keys("constellation:*");
    const userTagCounts: Record<string, number> = {};
    let totalConstellations = 0;
    let totalMinted = 0;

    for (const key of allKeys) {
        const record = await redis.hgetall(key);
        if (record && record.fid) {
            totalConstellations++;
            if (record.minted === "true") {
                totalMinted++;
            }

            if (record.topInteractions) {
                try {
                    const interactions: string[] = JSON.parse(record.topInteractions);
                    interactions.forEach(username => {
                        userTagCounts[username] = (userTagCounts[username] || 0) + 1;
                    });
                } catch (e) {
                }
            }
        }
    }

    const topTaggedUsers = Object.entries(userTagCounts)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        totalConstellations,
        totalMinted,
        topInteractions: topTaggedUsers.map(u => u.username)
    };
}

// Get all unique FIDs from constellations
export async function getAllUniqueFIDs(): Promise<number[]> {
    // Get all keys matching pattern
    const keys = await redis.keys('constellation:*');

    if (keys.length === 0) {
        return [];
    }

    // Use pipeline for batch operations (10x faster)
    const pipeline = redis.pipeline();
    keys.forEach(key => {
        pipeline.hget(key, 'fid');
    });

    const results = await pipeline.exec();
    const fids = new Set<number>();

    results?.forEach(([err, fid]) => {
        if (!err && fid) {
            fids.add(parseInt(fid as string));
        }
    });

    console.log(`📊 Collected ${fids.size} unique FIDs from ${keys.length} keys`);
    return Array.from(fids);
}
