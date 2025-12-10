import { NextResponse } from 'next/server';
import { redis } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const keys = await redis.keys('constellation:*');
        const fids = new Set<number>();

        const pipeline = redis.pipeline();
        keys.forEach(key => {
            pipeline.hget(key, 'fid');
        });

        const results = await pipeline.exec();
        results?.forEach(([err, fid]) => {
            if (!err && fid) {
                fids.add(parseInt(fid as string));
            }
        });

        const sortedFids = Array.from(fids).sort((a, b) => a - b);

        return NextResponse.json({
            total: sortedFids.length,
            fids: sortedFids
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
