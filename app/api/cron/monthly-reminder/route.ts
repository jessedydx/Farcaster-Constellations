import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

// This endpoint is called by Vercel Cron once per month
// Sends reminders to users who have minted NFTs

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`📅 Starting monthly reminder cron job...`);

        // Note: Neynar doesn't have a direct "get frame users" endpoint
        // You would need to track users when they mint NFTs
        // For now, this is a placeholder with an empty array

        const users: number[] = []; // TODO: Track FIDs when users mint NFTs

        if (users.length === 0) {
            console.log('⚠️ No users to send reminders to.');
            return NextResponse.json({
                success: true,
                sent: 0,
                total: 0,
                message: 'No users tracked yet. Users will be added when they mint NFTs.'
            });
        }

        console.log(`📤 Sending monthly reminders to ${users.length} users...`);

        let successCount = 0;
        for (const fid of users) {
            try {
                const success = await sendNotification({
                    fid,
                    title: 'Your New Constellation is Ready! 🌌',
                    body: 'Create your updated social galaxy map and mint a new NFT!',
                    targetUrl: 'https://farcaster-constellations-w425.vercel.app'
                });
                if (success) successCount++;

                // Rate limit: wait 100ms between notifications
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Failed to send to FID ${fid}:`, error);
            }
        }

        console.log(`✅ Sent ${success Count}/${users.length} monthly reminders`);

    return NextResponse.json({
        success: true,
        sent: successCount,
        total: users.length
    });
} catch (error: any) {
    console.error('Monthly reminder cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
}
}
