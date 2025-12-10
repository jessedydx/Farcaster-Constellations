import { NextRequest, NextResponse } from 'next/server';
import { getBroadcastStatus } from '@/lib/broadcast-queue';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const broadcastId = searchParams.get('id');

        if (!broadcastId) {
            return NextResponse.json(
                { error: 'Missing broadcast ID' },
                { status: 400 }
            );
        }

        const status = await getBroadcastStatus(broadcastId);

        if (!status) {
            return NextResponse.json(
                { error: 'Broadcast not found' },
                { status: 404 }
            );
        }

        // Calculate progress percentage
        const progress = status.total > 0
            ? ((status.sent + status.failed) / status.total) * 100
            : 0;

        // Calculate ETA (if in progress)
        let eta = 0;
        if (status.sent > 0 && status.pending > 0) {
            const elapsed = Date.now() - status.startTime;
            const avgTimePerFID = elapsed / (status.sent + status.failed);
            eta = Math.ceil(avgTimePerFID * status.pending / 1000); // seconds
        }

        const isComplete = status.pending === 0 && status.processing === 0;

        return NextResponse.json({
            broadcastId,
            stats: status,
            progress: Math.round(progress * 10) / 10,
            eta,
            isComplete
        });

    } catch (error: any) {
        console.error('Error getting broadcast status:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
