import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fid } = body;

        if (!fid) {
            return NextResponse.json({ error: 'FID is required' }, { status: 400 });
        }

        const success = await sendNotification({
            fid,
            title: '🌟 Galaxy Update',
            body: 'New stars have entered your galaxy. One of them is rising fast.',
            targetUrl: `${request.nextUrl.origin}`
        });

        if (success) {
            return NextResponse.json({ success: true, message: 'Test notification sent!' });
        } else {
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Test notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
