'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useRouter } from 'next/navigation';

interface Constellation {
    fid: number;
    username: string;
    ipfsHash: string;
    imageUrl: string;
    createdAt: number;
    minted: boolean;
    tokenId: number | null;
    txHash: string | null;
    mintedAt: number | null;
    topInteractions?: string[];
}

export default function OldMapsPage() {
    const router = useRouter();
    const [context, setContext] = useState<any>();
    const [constellations, setConstellations] = useState<Constellation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { composeCast } = useComposeCast();

    useEffect(() => {
        const load = async () => {
            const ctx = await sdk.context;
            setContext(ctx);
            sdk.actions.ready();

            if (ctx?.user?.fid) {
                fetchConstellations(ctx.user.fid);
            } else {
                setError('Please open this in Farcaster');
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const fetchConstellations = async (fid: number) => {
        try {
            const response = await fetch(`/api/user-maps?fid=${fid}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load maps');
            }

            setConstellations(data.constellations);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const shareConstellation = (constellation: Constellation) => {
        // Build mention text if topInteractions available
        const topUsers = constellation.topInteractions
            ? constellation.topInteractions.map((u: string) => `@${u}`).join(' ')
            : '';

        const text = `Just minted my Farcaster Constellation! 🌌\n\nCheck out my social galaxy map! ✨\n\n${topUsers}`;
        const imageUrl = constellation.imageUrl;
        const miniAppUrl = "https://farcaster.xyz/miniapps/1QWOndscTLyV/farcaster-constellation-nft";

        // Use OnchainKit's native composeCast for BaseApp compatibility
        composeCast({
            text,
            embeds: [imageUrl, miniAppUrl]
        });
    };

    return (
        <main style={styles.main}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <button onClick={() => router.back()} style={styles.backButton}>
                        ← Back
                    </button>
                    <h1 style={{ ...styles.title, paddingTop: '40px' }}>Your Constellation Gallery</h1>
                    <p style={styles.subtitle}>
                        Your social galaxy snapshots through time
                    </p>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div style={styles.loadingBox}>
                        <p>Loading your maps... ✨</p>
                    </div>
                ) : error ? (
                    <div style={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                ) : constellations.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>No Maps Yet</h2>
                        <p style={{ color: '#9ca3af' }}>You haven't minted any constellations yet.</p>
                        <button onClick={() => router.back()} style={styles.createButton}>
                            Create Your First Map
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {constellations.map((constellation, index) => (
                            <div key={constellation.txHash || index} style={styles.card}>
                                <div style={styles.imageWrapper}>
                                    <img
                                        src={constellation.imageUrl}
                                        alt={`Constellation from ${new Date(constellation.mintedAt || 0).toLocaleDateString()}`}
                                        style={styles.image}
                                    />
                                </div>
                                <div style={styles.cardInfo}>
                                    <p style={styles.dateText}>
                                        Minted on {new Date(constellation.mintedAt || 0).toLocaleDateString()}
                                    </p>
                                    {constellation.txHash && (
                                        <a
                                            href={`https://basescan.org/tx/${constellation.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={styles.txLink}
                                        >
                                            View on BaseScan →
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => shareConstellation(constellation)}
                                    style={styles.shareButton}
                                >
                                    Share Your Galaxy
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

const styles = {
    main: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0f0a1e 100%)',
        color: 'white',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '48px',
        position: 'relative' as const,
    },
    backButton: {
        position: 'absolute' as const,
        left: '0',
        top: '0',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    title: {
        fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
        fontWeight: 'bold',
        marginBottom: '12px',
        background: 'linear-gradient(to right, #00ffff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: 'clamp(0.875rem, 3vw, 1rem)',
        color: '#9ca3af',
    },
    loadingBox: {
        textAlign: 'center' as const,
        padding: '48px',
        fontSize: '1.125rem',
        color: '#9ca3af',
    },
    errorBox: {
        background: 'rgba(255, 0, 0, 0.2)',
        border: '1px solid #ff0000',
        color: '#ffcccc',
        padding: '16px',
        borderRadius: '12px',
        textAlign: 'center' as const,
        maxWidth: '400px',
        margin: '0 auto',
    },
    emptyBox: {
        textAlign: 'center' as const,
        padding: '48px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '400px',
        margin: '0 auto',
    },
    createButton: {
        marginTop: '24px',
        background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
    },
    card: {
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        padding: '16px',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '12px',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        display: 'block',
    },
    cardInfo: {
        marginBottom: '12px',
    },
    dateText: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        marginBottom: '4px',
    },
    txLink: {
        fontSize: '0.75rem',
        color: '#00ffff',
        textDecoration: 'none',
        display: 'block',
    },
    shareButton: {
        width: '100%',
        background: '#7c65c1',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'opacity 0.2s',
    },
};
