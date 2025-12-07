import { NextRequest, NextResponse } from 'next/server';
import { getStats, getRecentActivity } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const stats = await getStats();
        const activity = await getRecentActivity(50);

        return NextResponse.json({
            success: true,
            stats,
            activity
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
