// Test notification endpoint
// Visit: http://localhost:3000/api/test-notification

import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
    // Endpoint disabled - was being abused
    return NextResponse.json({
        error: 'This test endpoint has been disabled'
    }, { status: 410 }); // 410 Gone
}
