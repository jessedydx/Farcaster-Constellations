import { redis } from './database';

export interface ClickData {
    fid: number;
    broadcastId: string;
    timestamp: number;
    timeToClick: number; // milliseconds from send to click
}

export interface EngagementFunnel {
    sent: number;
    delivered: number;
    opened: number; // From Neynar (if available)
    clicked: number;
    deliveryRate: number;
    clickRate: number;
    ctr: number; // Click-through rate
}

export interface BroadcastAnalytics {
    broadcastId: string;
    stats: {
        total: number;
        sent: number;
        failed: number;
        clicks: number;
        startTime: number;
        endTime?: number;
        duration?: number;
    };
    funnel: EngagementFunnel;
    errorBreakdown: Record<string, number>;
    clickTiming: {
        avgTimeToClick: number;
        under1Min: number;
        between1And5Min: number;
        between5And30Min: number;
        over30Min: number;
    };
}

/**
 * Track notification click
 */
export async function trackNotificationClick(
    broadcastId: string,
    fid: number
): Promise<void> {
    try {
        const timestamp = Date.now();

        // Save click with timestamp
        await redis.hset(`broadcast:${broadcastId}:clicks`, fid, timestamp);

        // Increment click count
        await redis.hincrby(`broadcast:${broadcastId}:stats`, 'clicks', 1);

        console.log(`📊 Tracked click for FID ${fid} on broadcast ${broadcastId}`);
    } catch (error) {
        console.error('Error tracking click:', error);
    }
}

/**
 * Get engagement funnel for broadcast
 */
export async function getEngagementFunnel(broadcastId: string): Promise<EngagementFunnel> {
    const stats = await redis.hgetall(`broadcast:${broadcastId}:stats`);

    const total = parseInt(stats.total || '0');
    const sent = parseInt(stats.sent || '0');
    const failed = parseInt(stats.failed || '0');
    const clicks = parseInt(stats.clicks || '0');

    const delivered = sent;
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
    const clickRate = delivered > 0 ? (clicks / delivered) * 100 : 0;
    const ctr = total > 0 ? (clicks / total) * 100 : 0;

    return {
        sent: total,
        delivered,
        opened: 0, // Would need Neynar analytics API
        clicked: clicks,
        deliveryRate,
        clickRate,
        ctr
    };
}

/**
 * Get error breakdown
 */
export async function getErrorBreakdown(broadcastId: string): Promise<Record<string, number>> {
    const failed = await redis.hgetall(`broadcast:${broadcastId}:failed`);
    const breakdown: Record<string, number> = {};

    Object.values(failed).forEach(error => {
        // Categorize errors
        let category = 'Other';

        if (error.includes('429') || error.includes('rate limit')) {
            category = 'Rate Limit';
        } else if (error.includes('timeout') || error.includes('TIMEOUT')) {
            category = 'Timeout';
        } else if (error.includes('400') || error.includes('invalid')) {
            category = 'Invalid FID';
        } else if (error.includes('403') || error.includes('blocked')) {
            category = 'User Blocked';
        } else if (error.includes('500') || error.includes('502') || error.includes('503')) {
            category = 'Server Error';
        }

        breakdown[category] = (breakdown[category] || 0) + 1;
    });

    return breakdown;
}

/**
 * Get click timing distribution
 */
export async function getClickTiming(broadcastId: string) {
    const stats = await redis.hgetall(`broadcast:${broadcastId}:stats`);
    const clicks = await redis.hgetall(`broadcast:${broadcastId}:clicks`);
    const startTime = parseInt(stats.startTime || '0');

    let totalTime = 0;
    let count = 0;
    let under1Min = 0;
    let between1And5Min = 0;
    let between5And30Min = 0;
    let over30Min = 0;

    Object.values(clicks).forEach(timestampStr => {
        const clickTime = parseInt(timestampStr);
        const diff = clickTime - startTime;
        const diffMinutes = diff / 1000 / 60;

        totalTime += diff;
        count++;

        if (diffMinutes < 1) {
            under1Min++;
        } else if (diffMinutes < 5) {
            between1And5Min++;
        } else if (diffMinutes < 30) {
            between5And30Min++;
        } else {
            over30Min++;
        }
    });

    return {
        avgTimeToClick: count > 0 ? totalTime / count : 0,
        under1Min,
        between1And5Min,
        between5And30Min,
        over30Min
    };
}

/**
 * Get comprehensive broadcast analytics
 */
export async function getBroadcastAnalytics(broadcastId: string): Promise<BroadcastAnalytics> {
    const stats = await redis.hgetall(`broadcast:${broadcastId}:stats`);
    const funnel = await getEngagementFunnel(broadcastId);
    const errorBreakdown = await getErrorBreakdown(broadcastId);
    const clickTiming = await getClickTiming(broadcastId);

    return {
        broadcastId,
        stats: {
            total: parseInt(stats.total || '0'),
            sent: parseInt(stats.sent || '0'),
            failed: parseInt(stats.failed || '0'),
            clicks: parseInt(stats.clicks || '0'),
            startTime: parseInt(stats.startTime || '0'),
            endTime: stats.endTime ? parseInt(stats.endTime) : undefined,
            duration: stats.duration ? parseInt(stats.duration) : undefined
        },
        funnel,
        errorBreakdown,
        clickTiming
    };
}

/**
 * Export broadcast data to CSV format
 */
export async function exportBroadcastData(
    broadcastId: string,
    type: 'success' | 'failed' | 'clicks'
): Promise<string> {
    let csv = '';

    if (type === 'success') {
        const succeeded = await redis.smembers(`broadcast:${broadcastId}:succeeded`);
        csv = 'FID,Status\n';
        succeeded.forEach(fid => {
            csv += `${fid},Success\n`;
        });
    } else if (type === 'failed') {
        const failed = await redis.hgetall(`broadcast:${broadcastId}:failed`);
        csv = 'FID,Error\n';
        Object.entries(failed).forEach(([fid, error]) => {
            csv += `${fid},"${error}"\n`;
        });
    } else if (type === 'clicks') {
        const clicks = await redis.hgetall(`broadcast:${broadcastId}:clicks`);
        const stats = await redis.hgetall(`broadcast:${broadcastId}:stats`);
        const startTime = parseInt(stats.startTime || '0');

        csv = 'FID,Clicked At,Time to Click (seconds)\n';
        Object.entries(clicks).forEach(([fid, timestampStr]) => {
            const clickTime = parseInt(timestampStr);
            const timeToClick = Math.floor((clickTime - startTime) / 1000);
            const clickDate = new Date(clickTime).toISOString();
            csv += `${fid},${clickDate},${timeToClick}\n`;
        });
    }

    return csv;
}
