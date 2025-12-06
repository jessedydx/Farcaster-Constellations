import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

// This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
// Example: Once per month, send reminders to all users who added the mini app

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Get list of users who added the mini app
        // For now, this is a placeholder
        // You would need to maintain a database of users who added the app

        const users: number[] = []; // Array of FIDs

        console.log(`📅 Sending monthly reminders to ${users.length} users...`);

        let successCount = 0;
        for (const fid of users) {
            const success = await sendNotification({
                fid,
                title: 'Your New Constellation is Ready! 🌌',
                body: 'Create your updated social galaxy map and mint a new NFT!',
                targetUrl: 'https://farcaster-constellations-w425.vercel.app'
            });
            if (success) successCount++;
        }

        console.log(`✅ Sent ${successCount}/${users.length} monthly reminders`);

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
