import { NextRequest, NextResponse } from 'next/server';
import { getStats, trackConstellation } from '@/lib/database';
import { getBulkUserInfo } from '@/lib/farcaster';
import Redis from 'ioredis';

export const dynamic = 'force-dynamic';

function getRedisClient() {
    if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL environment variable is not set');
    }
    return new Redis(process.env.REDIS_URL);
}

const redis = getRedisClient();

export async function GET(request: NextRequest) {
    try {
        // Authenticate request (basic security)
        const authHeader = request.headers.get('authorization');
        // In a real scenario, use a secure secret. Using a simple query param for now or allowing admin if admin cookie presence (hard to check in API route without shared logic).
        // For simplicity during this migration, we'll allow it but log heavily. Pushing a secret via query param is easier for manual triggering.
        // Or checking if the request comes from Admin Dashboard (client-side only, not secure).
        // Let's use a temporary "admin-secret" query param.

        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== process.env.NEYNAR_API_KEY) { // Re-using API Key as temporary secret for this admin action
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔄 Starting Score Backfill...');

        // 1. Get all constellation keys
        const keys = await redis.keys('constellation:*');

        const fidsToUpdate = new Set<number>();

        // Filter keys that are actual records (not timeline)
        for (const key of keys) {
            const parts = key.split(':');
            if (parts.length >= 3 && parts[0] === 'constellation' && parts[1] !== 'timeline') {
                const fid = parseInt(parts[1]);
                if (!isNaN(fid)) {
                    fidsToUpdate.add(fid);
                }
            }
        }

        const fids = Array.from(fidsToUpdate);
        console.log(`Found ${fids.length} unique FIDs to update.`);

        let updatedCount = 0;
        const chunkSize = 50; // Neynar limit usually 100

        for (let i = 0; i < fids.length; i += chunkSize) {
            const chunk = fids.slice(i, i + chunkSize);
            console.log(`Processing chunk ${i} to ${i + chunk.length}...`);

            try {
                const users = await getBulkUserInfo(chunk);
                const userMap = new Map(users.map(u => [u.fid, u]));

                for (const fid of chunk) {
                    const user = userMap.get(fid);
                    if (user) {
                        // Find all keys for this FID
                        const userKeys = await redis.keys(`constellation:${fid}:*`);
                        for (const key of userKeys) {
                            // Update fields
                            await redis.hset(key, 'powerBadge', String(user.powerBadge));
                            await redis.hset(key, 'neynarScore', String(user.neynarScore));

                            // Also update follower count if missing or old
                            if (user.followerCount) {
                                await redis.hset(key, 'followerCount', String(user.followerCount));
                            }
                        }
                        updatedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error processing chunk:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            totalFids: fids.length,
            updatedCount: updatedCount,
            message: 'Backfill completed successfully'
        });

    } catch (error: any) {
        console.error('Backfill error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
