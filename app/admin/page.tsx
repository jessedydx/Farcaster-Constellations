'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

interface Stats {
    totalCreates: number;
    totalMints: number;
    conversionRate: number;
    thisWeekCreates: number;
    thisWeekMints: number;
}

interface Activity {
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

export default function AdminDashboard() {
    const [context, setContext] = useState<any>();
    const [stats, setStats] = useState<Stats | null>(null);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const ctx = await sdk.context;
                setContext(ctx);
                sdk.actions.ready();
            } catch (err) {
                console.log('SDK not available, skipping context');
                // Continue without SDK context
            }
        };
        load();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Add timestamp to bust cache completely
                const timestamp = Date.now();
                const res = await fetch(`/api/admin/stats?_t=${timestamp}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                setStats(data.stats);
                setActivity(data.activity);
            } catch (error: any) {
                console.error('Failed to fetch admin data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // Load data immediately
        fetchData();

        // Auto-refresh every 3 seconds (reduced from 10)
        const interval = setInterval(fetchData, 3000);

        return () => clearInterval(interval);
    }, []);

    // Optional: Check if user is admin (your FID)
    // Skip this check if context is not available
    if (context && context.user && context.user.fid !== 328997) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
                <h1>🚫 Unauthorized</h1>
                <p>Only admin can access this page.</p>
                <p><small>Your FID: {context.user.fid}</small></p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
                <h2>Error Loading Dashboard</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '12px', marginBottom: '30px', color: '#fff' }}>
                <h1 style={{ margin: 0, fontSize: '32px' }}>🎯 Constellation Tracker</h1>
                <p style={{ margin: '10px 0 0', opacity: 0.9 }}>Admin Dashboard - Real-time Analytics</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard
                    title="Total Creates"
                    value={stats?.totalCreates || 0}
                    icon="✨"
                    subtitle="All time constellations"
                    color="#667eea"
                />
                <StatCard
                    title="Total Mints"
                    value={stats?.totalMints || 0}
                    icon="💎"
                    subtitle="Successfully minted"
                    color="#764ba2"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${stats?.conversionRate || 0}%`}
                    icon="📊"
                    subtitle="Create → Mint ratio"
                    color="#F093FB"
                />
                <StatCard
                    title="This Week"
                    value={`${stats?.thisWeekCreates || 0} / ${stats?.thisWeekMints || 0}`}
                    icon="📅"
                    subtitle="Creates / Mints"
                    color="#4FACFE"
                />
            </div>

            {/* Recent Activity */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>📋 Recent Activity</h2>
                    <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>Latest constellation creates and mints</p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#495057', fontWeight: '600', fontSize: '14px' }}>FID</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#495057', fontWeight: '600', fontSize: '14px' }}>Username</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#495057', fontWeight: '600', fontSize: '14px' }}>Created</th>
                                <th style={{ padding: '15px', textAlign: 'center', color: '#495057', fontWeight: '600', fontSize: '14px' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#495057', fontWeight: '600', fontSize: '14px' }}>Last Activity</th>
                                <th style={{ padding: '15px', textAlign: 'center', color: '#495057', fontWeight: '600', fontSize: '14px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.map((item, idx) => {
                                const createdDate = new Date(item.createdAt);
                                const lastActivity = item.mintedAt ? new Date(item.mintedAt) : createdDate;
                                const timeSince = getTimeSince(lastActivity);

                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                                        <td style={{ padding: '15px', color: '#667eea', fontWeight: 'bold', fontSize: '14px' }}>
                                            {item.fid}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ color: '#212529', fontWeight: '500' }}>@{item.username}</div>
                                            {item.tokenId && (
                                                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                                    Token #{item.tokenId}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px', color: '#495057', fontSize: '13px' }}>
                                            {createdDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                                {createdDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {item.minted ? (
                                                <span style={{
                                                    background: '#d4edda',
                                                    color: '#155724',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    display: 'inline-block'
                                                }}>
                                                    ✅ Minted
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: '#fff3cd',
                                                    color: '#856404',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    display: 'inline-block'
                                                }}>
                                                    ⏳ Pending
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px', color: '#495057', fontSize: '13px' }}>
                                            <div>{timeSince}</div>
                                            <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                                {item.minted ? 'Minted' : 'Created'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <a
                                                href={item.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#667eea',
                                                    textDecoration: 'none',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    padding: '6px 12px',
                                                    border: '1px solid #667eea',
                                                    borderRadius: '6px',
                                                    display: 'inline-block',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = '#667eea';
                                                    e.currentTarget.style.color = '#fff';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = '#667eea';
                                                }}
                                            >
                                                View Image →
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {activity.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6c757d' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                            <div style={{ fontSize: '16px', fontWeight: '500' }}>No activity yet</div>
                            <div style={{ fontSize: '14px', marginTop: '5px' }}>Constellations will appear here when created</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtitle, color }: { title: string; value: string | number; icon: string; subtitle: string; color: string }) {
    return (
        <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${color}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
            }}
        >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '6px', color: '#212529' }}>{value}</div>
            <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#adb5bd' }}>{subtitle}</div>
        </div>
    );
}

function getTimeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
}
