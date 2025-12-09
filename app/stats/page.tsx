'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useRouter } from 'next/navigation';

interface StatsData {
    totalConstellations: number;
    totalMinted: number;
    topTaggedUsers: Array<{ username: string; count: number }>;
}

export default function StatsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            await sdk.context;
            sdk.actions.ready();
            fetchStats();
        };
        load();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load stats');
            }

            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main style={styles.main}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <button onClick={() => router.back()} style={styles.backButton}>
                        ← Back
                    </button>
                    <h1 style={{ ...styles.title, paddingTop: '40px' }}>Community Stats</h1>
                    <p style={styles.subtitle}>
                        Explore the constellation community
                    </p>
                </div>

                {isLoading ? (
                    <div style={styles.loadingBox}>
                        <p>Loading stats... ✨</p>
                    </div>
                ) : error ? (
                    <div style={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                ) : stats ? (
                    <>
                        {/* Overview Cards */}
                        <div style={styles.overviewGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{stats.totalConstellations}</div>
                                <div style={styles.statLabel}>Total Constellations</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{stats.totalMinted}</div>
                                <div style={styles.statLabel}>Minted as NFTs</div>
                            </div>
                        </div>

                        {/* Top Tagged Users */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>🌟 Most Tagged Users</h2>
                            <p style={styles.sectionSubtitle}>
                                The most connected users across all constellations
                            </p>

                            <div style={styles.leaderboard}>
                                {stats.topTaggedUsers.map((user, index) => (
                                    <div key={user.username} style={styles.leaderboardItem}>
                                        <div style={styles.rank}>
                                            {index + 1 === 1 && '🥇'}
                                            {index + 1 === 2 && '🥈'}
                                            {index + 1 === 3 && '🥉'}
                                            {index + 1 > 3 && `#${index + 1}`}
                                        </div>
                                        <div style={styles.username}>@{user.username}</div>
                                        <div style={styles.count}>{user.count} tags</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
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
        maxWidth: '800px',
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
    },
    overviewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '48px',
    },
    statCard: {
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '32px 24px',
        textAlign: 'center' as const,
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
    },
    statNumber: {
        fontSize: 'clamp(2rem, 8vw, 3rem)',
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #00ffff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    },
    section: {
        marginBottom: '48px',
    },
    sectionTitle: {
        fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#00ffff',
    },
    sectionSubtitle: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        marginBottom: '24px',
    },
    leaderboard: {
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    leaderboardItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'background 0.2s',
    },
    rank: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        width: '50px',
        flexShrink: 0,
    },
    username: {
        flex: 1,
        fontSize: '1rem',
        color: '#ffffff',
    },
    count: {
        fontSize: '0.875rem',
        color: '#9ca3af',
        fontWeight: '600',
    },
};
