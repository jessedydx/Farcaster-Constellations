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

    useEffect(() => {
        const load = async () => {
            const ctx = await sdk.context;
            setContext(ctx);
            sdk.actions.ready();
        };
        load();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats(data.stats);
                setActivity(data.activity);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (context) {
            fetchData();
        }
    }, [context]);

    // Check if user is admin (your FID)
    if (context && context.user?.fid !== 328997) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
                <h1>🚫 Unauthorized</h1>
                <p>Only admin can access this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1 style={{ marginBottom: '30px' }}>🎯 Constellation Tracker</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard
                    title="Total Creates"
                    value={stats?.totalCreates || 0}
                    icon="✨"
                />
                <StatCard
                    title="Total Mints"
                    value={stats?.totalMints || 0}
                    icon="💎"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${stats?.conversionRate || 0}%`}
                    icon="📊"
                />
                <StatCard
                    title="This Week"
                    value={`${stats?.thisWeekCreates || 0} / ${stats?.thisWeekMints || 0}`}
                    icon="📅"
                />
            </div>

            {/* Recent Activity */}
            <h2 style={{ marginBottom: '20px' }}>Recent Activity</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f5f5f5' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activity.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>
                                    <strong>@{item.username}</strong>
                                    <br />
                                    <small style={{ color: '#666' }}>FID: {item.fid}</small>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    {item.minted ? (
                                        <span style={{ color: '#00cc44', fontWeight: 'bold' }}>✅ Minted</span>
                                    ) : (
                                        <span style={{ color: '#ff8800', fontWeight: 'bold' }}>⏳ Pending</span>
                                    )}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
                                        View Image →
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {activity.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No activity yet
                    </p>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
    return (
        <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{title}</div>
        </div>
    );
}
