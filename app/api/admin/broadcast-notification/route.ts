import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';
import { redis } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for long-running broadcasts

export async function POST(request: NextRequest) {
    try {
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
        const totalUsers = uniqueFids.length;

        console.log(`📢 Starting broadcast to ${totalUsers} unique users...`);

        let successCount = 0;
        let failCount = 0;

        // Send notifications with rate limiting
        for (let i = 0; i < uniqueFids.length; i++) {
            const fid = uniqueFids[i];

            try {
                const success = await sendNotification({
                    fid,
                    title: '🌟 Galaxy Update',
                    body: 'New stars have entered your galaxy. One of them is rising fast.',
                    targetUrl: `${request.nextUrl.origin}`
                });

                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }

                // Rate limiting: 100ms delay between each notification
                if (i < uniqueFids.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Log progress every 10 users
                if ((i + 1) % 10 === 0) {
                    console.log(`Progress: ${i + 1}/${totalUsers} users notified`);
                }
            } catch (error: any) {
                console.error(`Failed to send to FID ${fid}:`, error.message);
                failCount++;
            }
        }

        console.log(`✅ Broadcast complete: ${successCount} sent, ${failCount} failed`);

        return NextResponse.json({
            success: true,
            totalUsers,
            successCount,
            failCount,
            message: `Broadcast sent to ${successCount}/${totalUsers} users`
        });

    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
