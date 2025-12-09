'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useRouter } from 'next/navigation';

export default function InfoPage() {
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            await sdk.context;
            sdk.actions.ready();
        };
        load();
    }, []);

    return (
        <main style={styles.main}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <button onClick={() => router.back()} style={styles.backButton}>
                        ← Back
                    </button>
                    <h1 style={styles.title}>How Your Constellation is Created</h1>
                    <p style={styles.subtitle}>
                        Understanding the metrics behind your unique social galaxy
                    </p>
                </div>

                <div style={styles.grid}>
                    {/* Card 1 */}
                    <div style={styles.card}>
                        <div style={styles.icon}>📊</div>
                        <h3 style={styles.cardTitle}>Data Collection</h3>
                        <p style={styles.cardText}>
                            We analyze your last 30 days of Farcaster interactions to understand your social network.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div style={styles.card}>
                        <div style={styles.icon}>🎯</div>
                        <h3 style={styles.cardTitle}>Scoring System</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Reply: <strong>3 points</strong></li>
                            <li style={styles.listItem}>Recast: <strong>1.5 points</strong></li>
                            <li style={styles.listItem}>Like: <strong>0.2 points</strong></li>
                        </ul>
                    </div>

                    {/* Card 3 */}
                    <div style={styles.card}>
                        <div style={styles.icon}>⭐</div>
                        <h3 style={styles.cardTitle}>Top Connections</h3>
                        <p style={styles.cardText}>
                            The top 20 users with the highest interaction scores become stars in your constellation.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div style={styles.card}>
                        <div style={styles.icon}>🎨</div>
                        <h3 style={styles.cardTitle}>Visualization</h3>
                        <p style={styles.cardText}>
                            Your unique constellation map is generated in a stunning cyber-neon aesthetic.
                        </p>
                    </div>

                    {/* Card 5 */}
                    <div style={styles.card}>
                        <div style={styles.icon}>🔗</div>
                        <h3 style={styles.cardTitle}>NFT on Base</h3>
                        <p style={styles.cardText}>
                            Mint your constellation as an NFT on the Base blockchain - completely free!
                        </p>
                    </div>

                    {/* Card 6 */}
                    <div style={styles.card}>
                        <div style={styles.icon}>🌌</div>
                        <h3 style={styles.cardTitle}>Your Galaxy</h3>
                        <p style={styles.cardText}>
                            Each constellation is unique to you and captures a snapshot of your social network at that moment in time.
                        </p>
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
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    container: {
        maxWidth: '1000px',
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
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
    },
    card: {
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    icon: {
        fontSize: '2.5rem',
        marginBottom: '12px',
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#00ffff',
    },
    cardText: {
        fontSize: '0.9rem',
        color: '#d1d5db',
        lineHeight: '1.6',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    listItem: {
        fontSize: '0.9rem',
        color: '#d1d5db',
        marginBottom: '8px',
        paddingLeft: '20px',
        position: 'relative' as const,
    },
};
