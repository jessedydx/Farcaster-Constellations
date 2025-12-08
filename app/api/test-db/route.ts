import { NextResponse } from 'next/server';
import { trackConstellation, getRecentActivity, getStats } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // Test 1: Write data
        await trackConstellation({
            fid: 999999,
            username: 'test-user',
            ipfsHash: 'QmTestHash123',
            imageUrl: 'https://test.com/image.png'
        });

        // Test 2: Read stats
        const stats = await getStats();

        // Test 3: Read recent activity
        const activity = await getRecentActivity(5);

        return NextResponse.json({
            success: true,
            message: 'Database connection works! ✅',
            stats,
            recentActivity: activity,
            test: 'Wrote test data and read it back successfully'
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            details: 'Database connection failed'
        }, { status: 500 });
    }
}
