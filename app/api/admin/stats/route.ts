import { NextRequest, NextResponse } from 'next/server';
import { getCachedStats, redis } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30; // 30 seconds for admin stats

export async function GET(request: NextRequest) {
    try {
        console.log('Admin stats endpoint called');
        console.log('REDIS_URL exists:', !!process.env.REDIS_URL);

        // Get pagination parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = (page - 1) * limit;

        const stats = await getCachedStats(); // ✨ Cached stats (instant)

        // Get total count for pagination
        const totalKeys = await redis.zcard('constellations:timeline');
        const totalPages = Math.ceil(totalKeys / limit);

        // Get paginated activity
        const keys = await redis.zrevrange('constellations:timeline', offset, offset + limit - 1);
        const records: any[] = [];

        for (const key of keys) {
            const record = await redis.hgetall(key);
            if (record && record.fid) {
                records.push({
                    fid: parseInt(record.fid),
                    username: record.username,
                    ipfsHash: record.ipfsHash,
                    imageUrl: record.imageUrl,
                    createdAt: parseInt(record.createdAt),
                    minted: record.minted === 'true',
                    tokenId: record.tokenId ? parseInt(record.tokenId) : null,
                    txHash: record.txHash || null,
                    mintedAt: record.mintedAt ? parseInt(record.mintedAt) : null,
                    followerCount: record.followerCount ? parseInt(record.followerCount) : undefined,
                    powerBadge: record.powerBadge === 'true',
                    neynarScore: record.neynarScore ? parseFloat(record.neynarScore) : undefined,
                });
            }
        }

        // Filter out test data (FID 999999)
        const filteredActivity = records.filter(item => item.fid !== 999999);

        return NextResponse.json({
            success: true,
            stats,
            activity: filteredActivity,
            pagination: {
                page,
                limit,
                total: totalKeys,
                totalPages
            }
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
