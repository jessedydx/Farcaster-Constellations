import Redis from 'ioredis';

// Singleton Redis connection
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
    if (!redisClient) {
        if (!process.env.REDIS_URL) {
            throw new Error('REDIS_URL environment variable is not set');
        }
        redisClient = new Redis(process.env.REDIS_URL);
        console.log('🔗 Redis connection initialized');
    }
    return redisClient;
}

const redis = getRedisClient();

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

    console.log(`🔍 Looking for constellations for FID ${fid}, found ${keys.length} keys`);

    if (keys.length === 0) {
        console.log(`⚠️ No constellation found for FID ${fid}, creating placeholder record`);

        // Create a placeholder constellation record for this mint
        const timestamp = Date.now();
        const key = `constellation:${fid}:${timestamp}`;

        const placeholderRecord = {
            fid: fid.toString(),
            username: `user_${fid}`, // Placeholder username
            ipfsHash: '',
            imageUrl: '',
            createdAt: timestamp.toString(),
            minted: 'true',
            tokenId: tokenId?.toString() || '',
            txHash,
            mintedAt: timestamp.toString(),
            placeholder: 'true' // Mark as placeholder
        };

        await redis.hset(key, placeholderRecord as any);
        await redis.zadd('constellations:timeline', timestamp, key);

        console.log(`✅ Created placeholder record and marked as minted: FID ${fid}`);
        return;
    }

    for (const key of keys.reverse()) {
        const record = await redis.hgetall(key);
        console.log(`Checking key: ${key}, minted: ${record.minted}`);

        if (record && record.minted !== 'true') {
            // Update individual fields
            await redis.hset(key, 'minted', 'true');
            await redis.hset(key, 'txHash', txHash);
            await redis.hset(key, 'mintedAt', Date.now().toString());
            if (tokenId) {
                await redis.hset(key, 'tokenId', tokenId.toString());
            }

            console.log(`✅ Marked as minted: FID ${fid}, key: ${key}`);
            return;
        }
    }

    console.log(`⚠️ All constellations for FID ${fid} already minted`);
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
