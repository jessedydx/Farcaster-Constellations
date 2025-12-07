import { NextRequest, NextResponse } from 'next/server';
import { getStats, getRecentActivity } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        console.log('Admin stats endpoint called');
        console.log('REDIS_URL exists:', !!process.env.REDIS_URL);

        const stats = await getStats();
        const activity = await getRecentActivity(50);

        return NextResponse.json({
            success: true,
            stats,
            activity
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
