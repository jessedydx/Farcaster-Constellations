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
        const { message } = body as { message?: BroadcastMessage };

        if (!message || !message.title || !message.body || !message.targetUrl) {
            return NextResponse.json(
                { error: 'Missing required message fields' },
                { status: 400 }
            );
        }

        // Get all constellation keys
        const keys = await redis.keys('constellation:*');

        // Extract unique FIDs
        const fidSet = new Set<number>();
        for (const key of keys) {
            const record = await redis.hgetall(key);
            if (record && record.fid) {
                fidSet.add(parseInt(record.fid));
            }
        }

        const uniqueFids = Array.from(fidSet);

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
