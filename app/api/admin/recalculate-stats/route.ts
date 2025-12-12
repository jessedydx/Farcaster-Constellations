import { NextRequest, NextResponse } from 'next/server';
import { recalculateStats } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds for recalculation

export async function GET(request: NextRequest) {
    try {
        console.log('📊 Recalculating stats...');

        const stats = await recalculateStats();

        console.log('✅ Stats recalculated successfully');

        return NextResponse.json({
            success: true,
            message: 'Stats recalculated and cached successfully',
            stats
        });
    } catch (error: any) {
        console.error('Stats recalculation error:', error);

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
