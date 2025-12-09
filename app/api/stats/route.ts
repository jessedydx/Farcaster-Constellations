import { NextRequest, NextResponse } from 'next/server';
import { getGlobalStats } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const stats = await getGlobalStats();

        return NextResponse.json({
            success: true,
            ...stats
        });
    } catch (error: any) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
