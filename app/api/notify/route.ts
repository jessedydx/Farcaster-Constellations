import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
    try {
        const { fid, type } = await request.json();

        if (!fid) {
            return NextResponse.json({ error: 'FID required' }, { status: 400 });
        }

        let title = '';
        let body = '';
        const targetUrl = 'https://farcaster-constellations-w425.vercel.app';

        if (type === 'mint_success') {
            title = 'Congratulations! 🎉';
            body = 'Your constellation NFT minted successfully! 💎';
        } else if (type === 'monthly_reminder') {
            title = 'Your New Constellation is Ready! 🌌';
            body = 'Create your updated social galaxy map and mint a new NFT!';
        }

        const success = await sendNotification({
            fid,
            title,
            body,
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
