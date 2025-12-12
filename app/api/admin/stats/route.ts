import { NextRequest, NextResponse } from 'next/server';
import { getCachedStats, getRecentActivity, ConstellationRecord } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30; // 30 seconds for admin stats

export async function GET(request: NextRequest) {
    try {
        console.log('Admin stats endpoint called');
        console.log('REDIS_URL exists:', !!process.env.REDIS_URL);

        const stats = await getCachedStats(); // ✨ NEW: Use cached stats
        const activity = await getRecentActivity(100); // Reduced to 100 to prevent timeout

        // Filter out test data (FID 999999)
        const filteredActivity = activity.filter(item => item.fid !== 999999);

        // Enrich with live user data removed for performance.
        // We now persist this data in Redis and have a manual 'Sync' button.

        return NextResponse.json({
            success: true,
            stats,
            activity: filteredActivity
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        console.error('Error stack:', error.stack);

        return NextResponse.json({
            error: error.message,
            details: error.stack,
            redisUrl: process.env.REDIS_URL ? 'SET' : 'MISSING'
        }, { status: 500 });
    }
}
