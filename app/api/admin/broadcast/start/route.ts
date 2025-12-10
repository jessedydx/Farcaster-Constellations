import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/database';
import {
    enqueueBroadcast,
    type BroadcastMessage
} from '@/lib/broadcast-queue';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute for enqueueing

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, testFids } = body as {
            message?: BroadcastMessage;
            testFids?: number[]; // Optional: untuk test mode
        };

        if (!message || !message.title || !message.body || !message.targetUrl) {
            return NextResponse.json(
                { error: 'Missing required message fields' },
                { status: 400 }
            );
        }

        let uniqueFids: number[];

        // TEST MODE: Eğer testFids varsa sadece onları kullan
        if (testFids && testFids.length > 0) {
            uniqueFids = testFids;
            console.log(`🧪 TEST MODE: Broadcasting to ${testFids.length} specific FIDs`);
        } else {
            // NORMAL MODE: Use optimized helper
            const { getAllUniqueFIDs } = await import('@/lib/database');
            uniqueFids = await getAllUniqueFIDs();
            console.log(`📢 BROADCAST MODE: Broadcasting to all ${uniqueFids.length} users`);
        }

        if (uniqueFids.length === 0) {
            return NextResponse.json(
                { error: 'No users found' },
                { status: 400 }
            );
        }

        // Enqueue broadcast
        const broadcastId = await enqueueBroadcast(uniqueFids, message);

        console.log(`📢 Broadcast ${broadcastId} started with ${uniqueFids.length} FIDs`);

        return NextResponse.json({
            success: true,
            broadcastId,
            totalUsers: uniqueFids.length
        });

    } catch (error: any) {
        console.error('Error starting broadcast:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
