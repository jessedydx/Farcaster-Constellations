import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function POST(request: NextRequest) {
    try {
        const redis = new Redis(process.env.REDIS_URL!);

        // Delete all test data (FID 999999)
        const testKeys = await redis.keys('constellation:999999:*');

        if (testKeys.length > 0) {
            await redis.del(...testKeys);

            // Also clean from timeline
            for (const key of testKeys) {
                await redis.zrem('constellations:timeline', key);
            }
        }

        await redis.quit();

        return NextResponse.json({
            success: true,
            message: `Deleted ${testKeys.length} test records`,
            deletedKeys: testKeys
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
