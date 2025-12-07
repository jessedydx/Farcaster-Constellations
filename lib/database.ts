import { kv } from '@vercel/kv';

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
        fid: data.fid,
        username: data.username,
        ipfsHash: data.ipfsHash,
        imageUrl: data.imageUrl,
        createdAt: Date.now(),
        minted: false,
        tokenId: null,
        txHash: null,
        mintedAt: null,
    };

    await kv.hset(key, record);
    await kv.zadd('constellations:timeline', { score: Date.now(), member: key });

    console.log(`✅ Tracked constellation: FID ${data.fid}`);
}

export async function markAsMinted(fid: number, txHash: string, tokenId?: number): Promise<void> {
    const keys = await kv.keys(`constellation:${fid}:*`);
    if (keys.length === 0) return;

    for (const key of keys.reverse()) {
        const record = await kv.hgetall(key) as ConstellationRecord | null;
        if (record && !record.minted) {
            await kv.hset(key, { ...record, minted: true, tokenId: tokenId || null, txHash, mintedAt: Date.now() });
            console.log(`✅ Marked as minted: FID ${fid}`);
            return;
        }
    }
}

export async function getStats() {
    const keys = await kv.keys('constellation:*');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let totalCreates = 0, totalMints = 0, thisWeekCreates = 0, thisWeekMints = 0;

    for (const key of keys) {
        const record = await kv.hgetall(key) as ConstellationRecord | null;
        if (!record) continue;

        totalCreates++;
        if (record.minted) totalMints++;
        if (record.createdAt > oneWeekAgo) {
            thisWeekCreates++;
            if (record.minted) thisWeekMints++;
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
    const keys = await kv.zrange('constellations:timeline', -limit, -1, { rev: true });
    const records: ConstellationRecord[] = [];

    for (const key of keys) {
        const record = await kv.hgetall(key as string) as ConstellationRecord | null;
        if (record) records.push(record);
    }

    return records;
}
