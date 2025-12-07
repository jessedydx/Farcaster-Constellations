import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export interface ConstellationRecord {
    fid: number;
    username: string;
    ipfsHash: string;
    imageUrl: string;
    createdAt: number;
    minted: boolean;
    tokenId: number | null;
    txHash: string | null;
    mintedAt: number | null;
}

export async function trackConstellation(data: {
    fid: number;
    username: string;
    ipfsHash: string;
    imageUrl: string;
}): Promise<void> {
    const key = `constellation:${data.fid}:${Date.now()}`;

    const record: ConstellationRecord = {
        ...data,
        createdAt: Date.now(),
        minted: false,
        tokenId: null,
        txHash: null,
        mintedAt: null,
    };

    await redis.hset(key, record as any);
    await redis.zadd('constellations:timeline', Date.now(), key);

    console.log(`✅ Tracked constellation: FID ${data.fid}`);
}

export async function markAsMinted(fid: number, txHash: string, tokenId?: number): Promise<void> {
    const keys = await redis.keys(`constellation:${fid}:*`);
    if (keys.length === 0) return;

    for (const key of keys.reverse()) {
        const record = await redis.hgetall(key);
        if (record && !record.minted) {
            await redis.hset(key, {
                ...record,
                minted: 'true',
                tokenId: tokenId?.toString() || '',
                txHash,
                mintedAt: Date.now().toString(),
            });
            console.log(`✅ Marked as minted: FID ${fid}`);
            return;
        }
    }
}

export async function getStats() {
    const keys = await redis.keys('constellation:*');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let totalCreates = 0, totalMints = 0, thisWeekCreates = 0, thisWeekMints = 0;

    for (const key of keys) {
        const record = await redis.hgetall(key);
        if (!record || !record.fid) continue;

        totalCreates++;
        if (record.minted === 'true') totalMints++;
        if (parseInt(record.createdAt) > oneWeekAgo) {
            thisWeekCreates++;
            if (record.minted === 'true') thisWeekMints++;
        }
    }

    return {
        totalCreates,
        totalMints,
        conversionRate: totalCreates > 0 ? Math.round((totalMints / totalCreates) * 100) : 0,
        thisWeekCreates,
        thisWeekMints,
    };
}

export async function getRecentActivity(limit: number = 50): Promise<ConstellationRecord[]> {
    const keys = await redis.zrevrange('constellations:timeline', 0, limit - 1);
    const records: ConstellationRecord[] = [];

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
            });
        }
    }

    return records;
}
