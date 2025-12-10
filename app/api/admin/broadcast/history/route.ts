import { NextRequest, NextResponse } from 'next/server';
import { getBroadcastHistory, getBroadcastStatus } from '@/lib/broadcast-queue';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const broadcastIds = await getBroadcastHistory(limit);

        // Get stats for each broadcast
        const broadcasts = await Promise.all(
            broadcastIds.map(async (id) => {
                const stats = await getBroadcastStatus(id);
                return {
                    id,
                    stats,
                    date: new Date(parseInt(id)).toISOString()
                };
            })
        );

        return NextResponse.json({
            broadcasts
        });

    } catch (error: any) {
        console.error('Error getting broadcast history:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
