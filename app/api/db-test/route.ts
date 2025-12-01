import { NextRequest, NextResponse } from 'next/server';
import {
    saveNotificationToken,
    getNotificationToken,
    getAllNotificationTokens,
    removeNotificationToken,
    canSendNotification
} from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, fid, token, url } = body;

        switch (action) {
            case 'save':
                if (!fid || !token || !url) {
                    return NextResponse.json(
                        { error: 'Missing required fields: fid, token, url' },
                        { status: 400 }
                    );
                }
                await saveNotificationToken(fid, token, url);
                return NextResponse.json({ success: true, message: 'Token saved' });

            case 'get':
                if (!fid) {
                    return NextResponse.json(
                        { error: 'Missing fid' },
                        { status: 400 }
                    );
                }
                const data = await getNotificationToken(fid);
                return NextResponse.json({ success: true, data });

            case 'getAll':
                const allTokens = await getAllNotificationTokens();
                return NextResponse.json({ success: true, count: allTokens.length, tokens: allTokens });

            case 'remove':
                if (!fid) {
                    return NextResponse.json(
                        { error: 'Missing fid' },
                        { status: 400 }
                    );
                }
                await removeNotificationToken(fid);
                return NextResponse.json({ success: true, message: 'Token removed' });

            case 'canSend':
                if (!fid) {
                    return NextResponse.json(
                        { error: 'Missing fid' },
                        { status: 400 }
                    );
                }
                const can = await canSendNotification(fid);
                return NextResponse.json({ success: true, canSend: can });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: save, get, getAll, remove, canSend' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('❌ Database test error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Database test endpoint',
        usage: {
            save: 'POST { "action": "save", "fid": 123, "token": "abc", "url": "https://..." }',
            get: 'POST { "action": "get", "fid": 123 }',
            getAll: 'POST { "action": "getAll" }',
            remove: 'POST { "action": "remove", "fid": 123 }',
            canSend: 'POST { "action": "canSend", "fid": 123 }'
        }
    });
}
