// Test notification endpoint
// Visit: http://localhost:3000/api/test-notification

import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
    const fid = 328997; // Your FID

    try {
        const success = await sendNotification({
            fid,
            title: 'Test Notification 🧪',
            body: 'This is a test from Farcaster Constellation!',
            targetUrl: 'https://farcaster-constellations-w425.vercel.app'
        });

        return NextResponse.json({
            success,
            message: success ? 'Notification sent!' : 'Failed to send',
            fid
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
