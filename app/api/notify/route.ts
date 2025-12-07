```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fid, type, txHash } = body;

        if (!fid) {
            return NextResponse.json({ error: 'FID is required' }, { status: 400 });
        }

        // If this is a mint success notification, also track it in database
        if (type === 'mint_success' && txHash) {
            console.log('Tracking mint for FID', fid, 'TX:', txHash);
            try {
                const { markAsMinted } = await import('@/lib/database');
                await markAsMinted(fid, txHash);
                console.log('Mint tracked via notify endpoint: FID', fid);
            } catch (trackError) {
                console.error('Failed to track mint:', trackError);
                // Don't fail notification if tracking fails
            }
        }

        let title = 'Farcaster Constellation';
        let notifBody = 'You have a new notification!';
        let targetUrl = 'https://farcaster-constellations-w425.vercel.app';

        if (type === 'mint_success') {
            title = 'Constellation Minted! 🎉';
            notifBody = 'Your constellation NFT has been successfully minted on Base!';
        } else if (type === 'monthly_reminder') {
            title = 'Monthly Reminder 📅';
            notifBody = 'Mint your new Farcaster constellation this month!';
        }

        const success = await sendNotification({
            fid,
            title,
            body: notifBody,
            targetUrl
        });

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Notify API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
