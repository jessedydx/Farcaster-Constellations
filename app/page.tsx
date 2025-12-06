'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk, { type Context } from '@farcaster/frame-sdk';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// NFT Contract ABI (Sadece mint fonksiyonu için)
const NFT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "recipient", "type": "address" },
            { "internalType": "uint256", "name": "fid", "type": "uint256" },
            { "internalType": "string", "name": "_tokenURI", "type": "string" }
        ],
        "name": "mintConstellation",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export default function Home() {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [context, setContext] = useState<any>();
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [constellationData, setConstellationData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Wagmi Hooks
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { writeContract, data: hash, error: mintError, isPending: isMintPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        const load = async () => {
            setContext(await sdk.context);
            sdk.actions.ready();

            // Show "Add Mini App" popup automatically when app opens
            // Only show once per session
            const hasShownPopup = sessionStorage.getItem('addFramePopupShown');
            if (!hasShownPopup && context?.user) {
                try {
                    await sdk.actions.addFrame();
                    sessionStorage.setItem('addFramePopupShown', 'true');
                } catch (error) {
                    console.log('User dismissed add frame popup or already added');
                }
            }

            // Otomatik cüzdan bağlantısı dene (Farcaster içinde)
            const farcasterConnector = connectors.find(c => c.id === 'farcaster');
            if (farcasterConnector) {
                console.log("🔌 Connecting with Farcaster Frame connector...");
                connect({ connector: farcasterConnector });
            } else {
                console.warn("⚠️ Farcaster connector not found, falling back to first available.");
                if (connectors.length > 0) connect({ connector: connectors[0] });
            }
        };
        if (sdk && !isSDKLoaded) {
            load();
        }
    }, [isSDKLoaded, connect]);

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

    const mintNFT = async () => {
        if (!isConnected || !address) {
            const farcasterConnector = connectors.find(c => c.id === 'farcaster');
            if (farcasterConnector) {
                connect({ connector: farcasterConnector });
            } else {
                // If we are in a frame but connector is missing, something is wrong with the environment or SDK
                if (context?.user?.fid) {
                    alert("Farcaster wallet not detected. Please try reloading.");
                } else {
                    // Fallback for testing outside of frame (if any other connectors existed)
                    if (connectors.length > 0) connect({ connector: connectors[0] });
                }
            }
            return;
        }

        if (!constellationData?.tokenURI) {
            setError("No constellation data found to mint.");
            return;
        }

        try {
            writeContract({
                address: constellationData.contractAddress as `0x${string}`,
                abi: NFT_ABI,
                functionName: 'mintConstellation',
                args: [address, context?.user?.fid || 0, constellationData.tokenURI],
            });
        } catch (err: any) {
            console.error("Mint error:", err);
            setError(err.message);
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
                    {(error || mintError) && (
                        <div style={styles.errorBox}>
                            ⚠️ {error || mintError?.message}
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

                            {/* Görsel Alanı */}
                            <div style={styles.imageContainer}>
                                <img
                                    src={constellationData.imageUrl}
                                    alt="Your Constellation"
                                    style={styles.previewImage}
                                />
                            </div>

                            <p style={styles.frameText}>
                                Your unique social map has been generated!
                            </p>

                            <div style={styles.buttonGroup}>
                                {!isConfirmed ? (
                                    <button
                                        onClick={mintNFT}
                                        disabled={isMintPending || isConfirming}
                                        style={{ ...styles.button, opacity: (isMintPending || isConfirming) ? 0.7 : 1 }}
                                    >
                                        {isMintPending ? 'Confirming in Wallet...' :
                                            isConfirming ? 'Minting...' :
                                                '💎 Mint NFT (Free)'}
                                    </button>
                                ) : (
                                    <div style={styles.successBox}>
                                        <h3>🎉 Minted Successfully!</h3>
                                        <a
                                            href={`https://basescan.org/tx/${hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#00ffff', textDecoration: 'underline', display: 'block', marginBottom: '12px' }}
                                        >
                                            View on BaseScan
                                        </a>
                                        <button
                                            onClick={() => {
                                                const topUsers = constellationData.topInteractions
                                                    ? constellationData.topInteractions.map((u: string) => `@${u}`).join(' ')
                                                    : '';

                                                const text = encodeURIComponent(`Just minted my Farcaster Constellation! 🌌\n\nCheck out my social galaxy map! ✨\n\n${topUsers}`);
                                                const miniAppUrl = encodeURIComponent("https://farcaster.xyz/miniapps/1QWOndscTLyV/farcaster-constellation-nft");
                                                // Don't encode image URL - Warpcast needs raw URL for proper embed
                                                const imageUrl = constellationData.imageUrl;

                                                // Order: Image first, then Mini App Link
                                                sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${text}&embeds[]=${imageUrl}&embeds[]=${miniAppUrl}`);
                                            }}
                                            style={{ ...styles.button, background: '#7c65c1', marginTop: '8px' }}
                                        >
                                            📢 Share on Warpcast
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Features section removed */}
                </div>
            </div>
        </main >
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
    imageContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
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
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
    },
    errorBox: {
        background: 'rgba(255, 0, 0, 0.2)',
        border: '1px solid #ff0000',
        color: '#ffcccc',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '24px',
    },
    successBox: {
        background: 'rgba(0, 255, 0, 0.1)',
        border: '1px solid #00ff00',
        padding: '16px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '300px',
    }
};
