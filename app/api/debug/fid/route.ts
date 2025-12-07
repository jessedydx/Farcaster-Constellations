import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function GET(request: NextRequest) {
    try {
        const redis = new Redis(process.env.REDIS_URL!);

        const searchParams = request.nextUrl.searchParams;
        const fid = searchParams.get('fid');

        if (!fid) {
            return NextResponse.json({ error: 'FID required' }, { status: 400 });
        }

        // Search for this FID's constellations
        const keys = await redis.keys(`constellation:${fid}:*`);

        const records = [];
        for (const key of keys) {
            const data = await redis.hgetall(key);
            records.push({ key, data });
        }

        await redis.quit();

        return NextResponse.json({
            fid,
            found: records.length,
            records
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
