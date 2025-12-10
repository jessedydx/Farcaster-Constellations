import { NextRequest, NextResponse } from 'next/server';
import { trackNotificationClick } from '@/lib/broadcast-analytics';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { notifId, fid } = body;

        if (!notifId || !fid) {
            return NextResponse.json(
                { error: 'Missing parameters' },
                { status: 400 }
            );
        }

        // Parse notification ID (format: broadcastId_fid)
        const parts = notifId.split('_');
        if (parts.length < 2) {
            return NextResponse.json(
                { error: 'Invalid notification ID format' },
                { status: 400 }
            );
        }

        const broadcastId = parts[0];

        // Track the click
        await trackNotificationClick(broadcastId, parseInt(fid));

        return NextResponse.json({
            success: true,
            broadcastId,
            fid
        });

    } catch (error: any) {
        console.error('Error tracking notification click:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
