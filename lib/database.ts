import Redis from 'ioredis';

// Singleton Redis connection
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
    if (!redisClient) {
        const REDIS_URL = process.env.REDIS_URL || '';

        if (!REDIS_URL) {
            throw new Error('REDIS_URL environment variable is required');
        }
        redisClient = new Redis(REDIS_URL);
        console.log('🔗 Redis connection initialized');
    }
    return redisClient;
}

export const redis = getRedisClient();

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
    followerCount?: number;
    powerBadge?: boolean;
    neynarScore?: number;
    topInteractions?: string[]; // Username list of top 5 interactions
}

export async function trackConstellation(data: {
    fid: number;
    username: string;
    ipfsHash: string;
    imageUrl: string;
    followerCount?: number;
    powerBadge?: boolean;
    neynarScore?: number;
    topInteractions?: string[];
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

    // Store topInteractions as JSON string in Redis
    const redisRecord = {
        ...record,
        topInteractions: data.topInteractions ? JSON.stringify(data.topInteractions) : undefined
    };

    await redis.hset(key, redisRecord as any);
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
                followerCount: record.followerCount ? parseInt(record.followerCount) : undefined,
                powerBadge: record.powerBadge === 'true',
                neynarScore: record.neynarScore ? parseFloat(record.neynarScore) : undefined,
                topInteractions: record.topInteractions ? JSON.parse(record.topInteractions) : undefined
            });
        }
    }

    return records;
}

export async function getUserMintedConstellations(fid: number, limit: number = 10): Promise<ConstellationRecord[]> {
    const keys = await redis.keys(`constellation:${fid}:*`);
    const records: ConstellationRecord[] = [];

    for (const key of keys) {
        const record = await redis.hgetall(key);
        if (record && record.fid && record.minted === 'true') {
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
                topInteractions: record.topInteractions ? JSON.parse(record.topInteractions) : undefined
            });
        }
    }

    // Sort by mintedAt (newest first) and limit
    return records
        .sort((a, b) => (b.mintedAt || 0) - (a.mintedAt || 0))
        .slice(0, limit);
}


export async function getGlobalStats() {
    const allKeys = await redis.keys("constellation:*");
    const userTagCounts: Record<string, number> = {};
    let totalConstellations = 0;
    let totalMinted = 0;

    for (const key of allKeys) {
        const record = await redis.hgetall(key);
        if (record && record.fid) {
            totalConstellations++;
            if (record.minted === "true") {
                totalMinted++;
            }

            if (record.topInteractions) {
                try {
                    const interactions: string[] = JSON.parse(record.topInteractions);
                    interactions.forEach(username => {
                        userTagCounts[username] = (userTagCounts[username] || 0) + 1;
                    });
                } catch (e) {
                }
            }
        }
    }

    const topTaggedUsers = Object.entries(userTagCounts)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        totalConstellations,
        totalMinted,
        topInteractions: topTaggedUsers.map(u => u.username)
    };
}

// Get all unique FIDs from constellations
export async function getAllUniqueFIDs(): Promise<number[]> {
    const keys = await redis.keys('constellation:*');
    const fids = new Set<number>();

    for (const key of keys) {
        const record = await redis.hgetall(key); // Corrected to hgetall
        if (record && record.fid) {
            fids.add(parseInt(record.fid)); // Parse fid to number
        }
    }

    return Array.from(fids);
}
