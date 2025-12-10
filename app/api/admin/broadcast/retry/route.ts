import { NextRequest, NextResponse } from 'next/server';
import { retryFailed } from '@/lib/broadcast-queue';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { broadcastId } = await request.json();

        if (!broadcastId) {
            return NextResponse.json(
                { error: 'Missing broadcastId' },
                { status: 400 }
            );
        }

        const retriedCount = await retryFailed(broadcastId);

        return NextResponse.json({
            success: true,
            retriedCount
        });

    } catch (error: any) {
        console.error('Error retrying failed:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
