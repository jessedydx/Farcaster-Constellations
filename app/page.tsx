'use client';

export default function Home() {
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

                    <div style={styles.framebox}>
                        <h2 style={styles.frameTitle}>Ready to Create?</h2>
                        <p style={styles.frameText}>
                            Share this Frame link on Farcaster to create your constellation!
                        </p>
                        <button onClick={copyToClipboard} style={styles.button}>
                            📋 Copy Frame URL
                        </button>
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
        padding: '24px',
        borderRadius: '16px',
        marginTop: '32px',
        border: '1px solid rgba(255, 0, 255, 0.3)',
    },
    frameTitle: {
        fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    frameText: {
        color: '#d1d5db',
        marginBottom: '16px',
        fontSize: 'clamp(0.875rem, 3vw, 1rem)',
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
    },
};
