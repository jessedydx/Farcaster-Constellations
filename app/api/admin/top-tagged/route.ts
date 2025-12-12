import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds

export async function GET(request: NextRequest) {
    try {
        console.log('📊 Analyzing top tagged users...');

        // Get all constellation keys
        const allKeys = await redis.keys("constellation:*");
        const userTagCounts: Record<string, number> = {};
        let totalConstellations = 0;

        console.log(`Found ${allKeys.length} constellation records`);

        // Use pipeline for faster processing
        const pipeline = redis.pipeline();
        allKeys.forEach(key => {
            pipeline.hget(key, 'topInteractions');
        });

        const results = await pipeline.exec();

        results?.forEach(([err, topInteractionsStr]: any) => {
            if (err || !topInteractionsStr) return;

            totalConstellations++;
            try {
                const interactions: string[] = JSON.parse(topInteractionsStr as string);
                interactions.forEach(username => {
                    userTagCounts[username] = (userTagCounts[username] || 0) + 1;
                });
            } catch (e) {
                // Skip invalid JSON
            }
        });

        // Sort by count and get top 30
        const topTagged = Object.entries(userTagCounts)
            .map(([username, count]) => ({ username, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30);

        console.log(`✅ Analysis complete: ${topTagged.length} top users from ${totalConstellations} constellations`);

        return NextResponse.json({
            success: true,
            totalConstellations,
            totalTaggedUsers: Object.keys(userTagCounts).length,
            topTagged
        });
    } catch (error: any) {
        console.error('Top tagged analysis error:', error);

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
