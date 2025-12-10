import { NextRequest, NextResponse } from 'next/server';
import {
    getNextFID,
    removeFromProcessing,
    markSuccess,
    markFailed,
    getBroadcastMessage,
    getBroadcastStatus,
    completeBroadcast,
    isBroadcastActive
} from '@/lib/broadcast-queue';
import { sendNotificationWithRetry, getAdaptiveDelay } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
    try {
        const { broadcastId } = await request.json();

        if (!broadcastId) {
            return NextResponse.json(
                { error: 'Missing broadcastId' },
                { status: 400 }
            );
        }

        // Check if broadcast is active
        const isActive = await isBroadcastActive(broadcastId);
        if (!isActive) {
            return NextResponse.json(
                { error: 'Broadcast not active' },
                { status: 400 }
            );
        }

        // Get message
        const message = await getBroadcastMessage(broadcastId);
        if (!message) {
            return NextResponse.json(
                { error: 'Broadcast message not found' },
                { status: 404 }
            );
        }

        console.log(`⚙️ Worker started for broadcast ${broadcastId}`);

        let consecutiveErrors = 0;
        let processedCount = 0;

        // Process queue
        while (true) {
            const fid = await getNextFID(broadcastId);
            if (!fid) {
                // Queue is empty
                break;
            }

            processedCount++;

            try {
                // Add broadcast ID to target URL for tracking
                const targetUrl = `${message.targetUrl}${message.targetUrl.includes('?') ? '&' : '?'}notif=${broadcastId}_${fid}`;

                // Send with retry
                const result = await sendNotificationWithRetry({
                    fid,
                    title: message.title,
                    body: message.body,
                    targetUrl
                });

                // Remove from processing
                await removeFromProcessing(broadcastId, fid);

                if (result.success) {
                    await markSuccess(broadcastId, fid);
                    consecutiveErrors = 0; // Reset error counter
                } else {
                    await markFailed(broadcastId, fid, result.error || 'Unknown error');
                    consecutiveErrors++;
                }

                // Adaptive rate limiting
                const delay = getAdaptiveDelay(consecutiveErrors);
                await new Promise(resolve => setTimeout(resolve, delay));

                // Log progress every 10 FIDs
                if (processedCount % 10 === 0) {
                    const status = await getBroadcastStatus(broadcastId);
                    console.log(`Progress: ${status?.sent}/${status?.total} sent, ${status?.failed} failed`);
                }

            } catch (error: any) {
                console.error(`Error processing FID ${fid}:`, error);
                await removeFromProcessing(broadcastId, fid);
                await markFailed(broadcastId, fid, error.message);
                consecutiveErrors++;
            }
        }

        // Complete broadcast
        await completeBroadcast(broadcastId);

        const finalStatus = await getBroadcastStatus(broadcastId);

        console.log(`✅ Worker completed for broadcast ${broadcastId}`);
        console.log(`Final: ${finalStatus?.sent} sent, ${finalStatus?.failed} failed`);

        return NextResponse.json({
            success: true,
            stats: finalStatus
        });

    } catch (error: any) {
        console.error('Worker error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
