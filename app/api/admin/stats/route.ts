import { NextRequest, NextResponse } from 'next/server';
import { getStats, getRecentActivity, ConstellationRecord } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        console.log('Admin stats endpoint called');
        console.log('REDIS_URL exists:', !!process.env.REDIS_URL);

        const stats = await getStats();
        const activity = await getRecentActivity(500); // Increased from 50 to 500

        // Filter out test data (FID 999999)
        const filteredActivity = activity.filter(item => item.fid !== 999999);

        // Enrich with live user data (Follower Count, Neynar Score, Power Badge)
        // This ensures historical records also show up-to-date info
        let enrichedActivity = [...filteredActivity];

        try {
            const fids = filteredActivity.map(a => a.fid);
            if (fids.length > 0) {
                // Fetch in chunks of 100 to avoid URL length limits
                const chunkSize = 100;

                for (let i = 0; i < fids.length; i += chunkSize) {
                    const chunk = fids.slice(i, i + chunkSize);
                    // Import getBulkUserInfo dynamically or use axios directly to avoid circular deps if any
                    // But we can import from lib/farcaster
                    const { getBulkUserInfo } = await import('@/lib/farcaster');
                    const users = await getBulkUserInfo(chunk);

                    const userMap = new Map(users.map(u => [u.fid, u]));

                    // Update enrichedActivity in place
                    for (const item of enrichedActivity) {
                        const user = userMap.get(item.fid);
                        // Cast to any to avoid build errors with potentially cached type definitions
                        const enrichedItem = item as any;
                        const anyUser = user as any;
                        enrichedItem.followerCount = anyUser.followerCount;
                        enrichedItem.powerBadge = anyUser.powerBadge;
                        enrichedItem.neynarScore = anyUser.neynarScore;
                    }
                }
            }

            return NextResponse.json({
                success: true,
                stats,
                activity: enrichedActivity
            });
        } catch (enrichError) {
            console.error('Failed to enrich activity with live data:', enrichError);
            // Fallback to existing activity data if enrichment fails
            // The original filteredActivity will be used if this block is reached and no explicit return happens
        }

        return NextResponse.json({
            success: true,
            stats,
            activity: filteredActivity // This will be returned if enrichment failed or fids.length was 0
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        console.error('Error stack:', error.stack);

        return NextResponse.json({
            error: error.message,
            details: error.stack,
            redisUrl: process.env.REDIS_URL ? 'SET' : 'MISSING'
        }, { status: 500 });
    }
}
