import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/database';
import { getBroadcastStatus, getFailedFIDs } from '@/lib/broadcast-queue';
import { getBroadcastAnalytics, exportBroadcastData } from '@/lib/broadcast-analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const broadcastId = searchParams.get('id');
        const action = searchParams.get('action'); // 'success', 'failed', 'clicks', 'export'
        const exportType = searchParams.get('export'); // 'success', 'failed', 'clicks'

        if (!broadcastId) {
            return NextResponse.json(
                { error: 'Missing broadcast ID' },
                { status: 400 }
            );
        }

        // Handle export
        if (action === 'export' && exportType) {
            const csv = await exportBroadcastData(broadcastId, exportType as any);

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="broadcast_${broadcastId}_${exportType}.csv"`
                }
            });
        }

        // Get comprehensive details
        const status = await getBroadcastStatus(broadcastId);

        if (!status) {
            return NextResponse.json(
                { error: 'Broadcast not found' },
                { status: 404 }
            );
        }

        const analytics = await getBroadcastAnalytics(broadcastId);

        // Get success list
        const succeeded = await redis.smembers(`broadcast:${broadcastId}:succeeded`);

        // Get failed list
        const failed = await getFailedFIDs(broadcastId);

        // Get clicks
        const clicks = await redis.hgetall(`broadcast:${broadcastId}:clicks`);
        const clickData = Object.entries(clicks).map(([fid, timestamp]) => ({
            fid: parseInt(fid),
            timestamp: parseInt(timestamp),
            date: new Date(parseInt(timestamp)).toISOString()
        }));

        return NextResponse.json({
            broadcastId,
            status,
            analytics,
            succeeded: succeeded.map(Number),
            failed,
            clicks: clickData
        });

    } catch (error: any) {
        console.error('Error getting broadcast details:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
