import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Call the actual cron endpoint with server-side CRON_SECRET
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cron/weekly-score-refresh`, {
            method: 'POST',
            headers: {
                'x-cron-secret': process.env.CRON_SECRET || ''
            }
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });

    } catch (error: any) {
        console.error('Admin refresh scores error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
