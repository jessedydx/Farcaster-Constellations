'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk, { type Context } from '@farcaster/frame-sdk';

export default function Home() {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [context, setContext] = useState<any>();
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [constellationData, setConstellationData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setContext(await sdk.context);
            sdk.actions.ready();
            setIsSDKLoaded(true);

            // Check if added (this is a basic check, real check might need backend)
            // For now, we assume if we have context, we are in Farcaster
        };
        if (sdk && !isSDKLoaded) {
            load();
        }
    }, [isSDKLoaded]);

    const addToFarcaster = useCallback(async () => {
        try {
            await sdk.actions.addFrame();
            setIsAdded(true);
        } catch (err) {
            console.error('Failed to add frame:', err);
        }
    }, []);

    const createConstellation = async () => {
        if (!context?.user?.fid) {
            setError("Please open this in Farcaster!");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/frame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fid: context.user.fid })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create constellation');
            }

            setConstellationData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}/api/frame`;
            navigator.clipboard.writeText(url);
            alert('Frame URL copied! 📋');
        }
    };

    return (
        <main style={styles.main}>
            <div style={styles.container}>
                <div style={styles.content}>
                    <h1 style={styles.title}>
                        Farcaster Constellation NFT
                    </h1>

                    <p style={styles.subtitle}>
                        Transform your Farcaster social network into a stunning cyber-neon constellation NFT.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorBox}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Main Action Area */}
                    {!constellationData ? (
                        <div style={styles.framebox}>
                            {context?.user?.fid ? (
                                <>
                                    <h2 style={styles.frameTitle}>Welcome, @{context.user.username}!</h2>
                                    <p style={styles.frameText}>
                                        Ready to visualize your social galaxy?
                                    </p>

                                    <div style={styles.buttonGroup}>
                                        <button
                                            onClick={createConstellation}
                                            disabled={isLoading}
                                            style={{ ...styles.button, opacity: isLoading ? 0.7 : 1 }}
                                        >
                                            {isLoading ? 'Creating Magic... ✨' : '🚀 Create Constellation'}
                                        </button>

                                        {!isAdded && (
                                            <button
                                                onClick={addToFarcaster}
                                                style={{ ...styles.secondaryButton, marginTop: '12px' }}
                                            >
                                                📲 Add to Farcaster
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 style={styles.frameTitle}>Open in Farcaster</h2>
                                    <p style={styles.frameText}>
                                        Please open this Mini App inside Farcaster to connect your account.
                                    </p>
                                    <button onClick={copyToClipboard} style={styles.button}>
                                        📋 Copy App URL
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={styles.resultBox}>
                            <h2 style={styles.frameTitle}>Constellation Ready! 🌟</h2>
                            <img
                                src={constellationData.imageUrl}
                                alt="Your Constellation"
                                style={styles.previewImage}
                            />
                            <p style={styles.frameText}>
                                Your unique social map has been generated and uploaded to IPFS.
                            </p>

                            <div style={styles.buttonGroup}>
                                <a
                                    href={`https://basescan.org/address/${constellationData.contractAddress}#writeContract`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ ...styles.button, textDecoration: 'none', display: 'inline-block' }}
                                >
                                    💎 Mint NFT (BaseScan)
                                </a>
                                <p style={{ fontSize: '0.8rem', marginTop: '8px', color: '#6b7280' }}>
                                    (Frontend minting coming soon!)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Features Grid */}
                    <div style={styles.grid}>
                        <div style={styles.card}>
                            <div style={styles.emoji}>🌐</div>
                            <h3 style={styles.cardTitle}>Analyze</h3>
                            <p style={styles.cardText}>
                                We analyze your last 30 days of Farcaster interactions
                            </p>
                        </div>

                        <div style={styles.card}>
                            <div style={styles.emoji}>✨</div>
                            <h3 style={styles.cardTitle}>Visualize</h3>
                            <p style={styles.cardText}>
                                Your top 20 connections become a cyber-neon constellation
                            </p>
                        </div>

                        <div style={styles.card}>
                            <div style={styles.emoji}>🎨</div>
                            <h3 style={styles.cardTitle}>Mint</h3>
                            <p style={styles.cardText}>
                                Mint your unique constellation as an NFT on Base L2
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const styles = {
    main: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0f0a1e 100%)',
        color: 'white',
        padding: '32px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    content: {
        textAlign: 'center' as const,
    },
    title: {
        fontSize: 'clamp(2rem, 8vw, 3.5rem)',
        fontWeight: 'bold',
        marginBottom: '16px',
        background: 'linear-gradient(to right, #00ffff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: '1.2',
    },
    subtitle: {
        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
        marginBottom: '32px',
        color: '#d1d5db',
        padding: '0 8px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        marginTop: '48px',
    },
    card: {
        background: 'rgba(30, 30, 40, 0.5)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 255, 0.3)',
    },
    emoji: {
        fontSize: '2rem',
        marginBottom: '12px',
    },
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '8px',
    },
    cardText: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        lineHeight: '1.5',
    },
    framebox: {
        background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
        padding: '32px',
        borderRadius: '16px',
        marginTop: '32px',
        border: '1px solid rgba(255, 0, 255, 0.5)',
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.2)',
    },
    resultBox: {
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '32px',
        borderRadius: '16px',
        marginTop: '32px',
        border: '1px solid #00ffff',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
    },
    frameTitle: {
        fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#fff',
    },
    frameText: {
        color: '#d1d5db',
        marginBottom: '24px',
        fontSize: 'clamp(0.875rem, 3vw, 1rem)',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '12px',
    },
    button: {
        background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
        color: 'white',
        border: 'none',
        padding: '16px 32px',
        fontSize: 'clamp(1rem, 4vw, 1.125rem)',
        fontWeight: 'bold',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 20px rgba(0, 255, 255, 0.3)',
        width: '100%',
        maxWidth: '300px',
    },
    secondaryButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '12px 24px',
        fontSize: '1rem',
        borderRadius: '12px',
        cursor: 'pointer',
        width: '100%',
        maxWidth: '300px',
    },
    previewImage: {
        width: '100%',
        maxWidth: '400px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
    },
    errorBox: {
        background: 'rgba(255, 0, 0, 0.2)',
        border: '1px solid #ff0000',
        color: '#ffcccc',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '24px',
    }
};
