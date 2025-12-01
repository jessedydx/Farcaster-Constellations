import axios from 'axios';

const NEYNAR_API_BASE = 'https://api.neynar.com/v2';
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;

export interface FarcasterUser {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
}

export interface Interaction {
    targetFid: number;
    score: number;
    replyCount: number;
    mentionCount: number;
    recastCount: number;
    likeCount: number;
}

// Kullanıcı bilgisini al
export async function getUserInfo(fid: number): Promise<FarcasterUser> {
    try {
        const response = await axios.get(`${NEYNAR_API_BASE}/farcaster/user/bulk`, {
            headers: { 'api_key': NEYNAR_API_KEY },
            params: { fids: fid.toString() }
        });

        const user = response.data.users[0];
        return {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name || user.username,
            pfpUrl: user.pfp_url
        };
    } catch (error) {
        console.error('getUserInfo error:', error);
        throw new Error(`Failed to get user info for fid ${fid}`);
    }
}

// Kullanıcının son 30 gündeki tüm etkileşimlerini analiz et
export async function analyzeInteractions(fid: number): Promise<Interaction[]> {
    try {
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

        // Kullanıcının castlerini al
        const castsResponse = await axios.get(`${NEYNAR_API_BASE}/farcaster/feed/user/casts`, {
            headers: { 'api_key': NEYNAR_API_KEY },
            params: { fid: fid, limit: 150 }
        });

        const interactions = new Map<number, Interaction>();

        // Her cast'i analiz et
        for (const cast of castsResponse.data.casts || []) {
            // Reply ise
            if (cast.parent_author?.fid) {
                const targetFid = cast.parent_author.fid;
                if (!interactions.has(targetFid)) {
                    interactions.set(targetFid, {
                        targetFid,
                        score: 0,
                        replyCount: 0,
                        mentionCount: 0,
                        recastCount: 0,
                        likeCount: 0
                    });
                }
                const interaction = interactions.get(targetFid)!;
                interaction.replyCount++;
                interaction.score += 3;
            }

            // Mention kontrolü
            if (cast.text) {
                const mentions = cast.text.match(/@\w+/g) || [];
                for (const mention of mentions) {
                    // Bu basitleştirilmiş bir örnek
                    // Gerçek uygulamada mention'ları FID'lere çevirmemiz gerekir
                }
            }

            // Recast'lerde
            if (cast.reactions?.recasts) {
                for (const recast of cast.reactions.recasts) {
                    if (recast.fid) {
                        const targetFid = recast.fid;
                        if (!interactions.has(targetFid)) {
                            interactions.set(targetFid, {
                                targetFid,
                                score: 0,
                                replyCount: 0,
                                mentionCount: 0,
                                recastCount: 0,
                                likeCount: 0
                            });
                        }
                        const interaction = interactions.get(targetFid)!;
                        interaction.recastCount++;
                        interaction.score += 1.5;
                    }
                }
            }

            // Like'lar
            if (cast.reactions?.likes) {
                for (const like of cast.reactions.likes) {
                    if (like.fid) {
                        const targetFid = like.fid;
                        if (!interactions.has(targetFid)) {
                            interactions.set(targetFid, {
                                targetFid,
                                score: 0,
                                replyCount: 0,
                                mentionCount: 0,
                                recastCount: 0,
                                likeCount: 0
                            });
                        }
                        const interaction = interactions.get(targetFid)!;
                        interaction.likeCount++;
                        interaction.score += 0.2;
                    }
                }
            }
        }

        // En yüksek skorlu 20 kişiyi al
        const sortedInteractions = Array.from(interactions.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

        return sortedInteractions;
    } catch (error) {
        console.error('analyzeInteractions error:', error);
        throw new Error(`Failed to analyze interactions for fid ${fid}`);
    }
}

// Birden fazla kullanıcının bilgisini toplu al
export async function getBulkUserInfo(fids: number[]): Promise<FarcasterUser[]> {
    try {
        const response = await axios.get(`${NEYNAR_API_BASE}/farcaster/user/bulk`, {
            headers: { 'api_key': NEYNAR_API_KEY },
            params: { fids: fids.join(',') }
        });

        return response.data.users.map((user: any) => ({
            fid: user.fid,
            username: user.username,
            displayName: user.display_name || user.username,
            pfpUrl: user.pfp_url
        }));
    } catch (error) {
        console.error('getBulkUserInfo error:', error);
        throw new Error('Failed to get bulk user info');
    }
}

// Kullanıcının doğrulanmış cüzdan adresini al (ETH Mainnet/Base)
export async function getVerifiedAddress(fid: number): Promise<string | null> {
    try {
        const response = await axios.get(`${NEYNAR_API_BASE}/farcaster/user/bulk`, {
            headers: { 'api_key': NEYNAR_API_KEY },
            params: { fids: fid.toString() }
        });

        const user = response.data.users[0];

        // İlk doğrulanmış adresi döndür (genellikle en güvenilir olan)
        if (user.verified_addresses?.eth_addresses?.length > 0) {
            return user.verified_addresses.eth_addresses[0];
        }

        // Yoksa custody address'i döndür (ama bu genellikle smart contract wallet olabilir)
        return user.custody_address || null;
    } catch (error) {
        console.error('getVerifiedAddress error:', error);
        return null;
    }
}
