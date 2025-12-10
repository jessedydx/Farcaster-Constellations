'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function BroadcastManagement() {
    const [context, setContext] = useState<any>();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Broadcast state
    const [broadcastMessage, setBroadcastMessage] = useState({ title: '', body: '' });
    const [testFids, setTestFids] = useState<string>(''); // FID input field
    const [activeBroadcast, setActiveBroadcast] = useState<any>(null);
    const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
    const [selectedBroadcast, setSelectedBroadcast] = useState<string | null>(null);
    const [broadcastDetails, setBroadcastDetails] = useState<any>(null);

    useEffect(() => {
        // Check authentication
        const savedAuth = localStorage.getItem('admin_authenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }

        const load = async () => {
            try {
                const ctx = await sdk.context;
                setContext(ctx);
                sdk.actions.ready();
            } catch (err) {
                console.log('SDK not available');
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadBroadcastHistory();
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'galaxy2024') {
            setIsAuthenticated(true);
            localStorage.setItem('admin_authenticated', 'true');
        } else {
            alert('Incorrect password');
            setPassword('');
        }
    };

    // Broadcast to ALL users
    const handleBroadcastToAll = async () => {
        if (!broadcastMessage.title || !broadcastMessage.body) {
            alert('⚠️ Please enter title and body');
            return;
        }
        const confirmMsg = `🚀 Broadcast to ALL?\n\nTitle: ${broadcastMessage.title}\nBody: ${broadcastMessage.body}\n\nThis will send to ALL users.`;
        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const startRes = await fetch('/api/admin/broadcast/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: {
                        title: broadcastMessage.title,
                        body: broadcastMessage.body,
                        targetUrl: window.location.origin
                    }
                    // NO testFids = broadcast to all
                })
            });
            const startData = await startRes.json();
            if (!startData.success) throw new Error(startData.error);

            alert(`✅ Queued!\n\nID: ${startData.broadcastId}\nTotal: ${startData.totalUsers}`);

            fetch('/api/admin/broadcast/worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcastId: startData.broadcastId })
            }).catch(console.error);

            setActiveBroadcast({ id: startData.broadcastId, ...startData });
            startStatusPolling(startData.broadcastId);
            setBroadcastMessage({ title: '', body: '' });
            setTestFids(''); // Clear FID input
        } catch (err: any) {
            alert('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Broadcast to SELECTED FIDs
    const handleBroadcastToSelected = async () => {
        if (!broadcastMessage.title || !broadcastMessage.body) {
            alert('⚠️ Please enter title and body');
            return;
        }
        if (!testFids.trim()) {
            alert('⚠️ Please enter FID(s)');
            return;
        }

        // Parse FIDs (comma or space separated)
        const fidArray = testFids
            .split(/[,\s]+/)
            .map(f => f.trim())
            .filter(f => f)
            .map(f => parseInt(f))
            .filter(f => !isNaN(f));

        if (fidArray.length === 0) {
            alert('⚠️ No valid FIDs found');
            return;
        }

        const confirmMsg = `🎯 Broadcast to ${fidArray.length} Selected User(s)?\n\nTitle: ${broadcastMessage.title}\nFIDs: ${fidArray.join(', ')}`;
        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const startRes = await fetch('/api/admin/broadcast/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: {
                        title: broadcastMessage.title,
                        body: broadcastMessage.body,
                        targetUrl: window.location.origin
                    },
                    testFids: fidArray // Send to specific FIDs
                })
            });
            const startData = await startRes.json();
            if (!startData.success) throw new Error(startData.error);

            alert(`✅ Queued!\n\nID: ${startData.broadcastId}\nSelected: ${startData.totalUsers} FIDs`);

            fetch('/api/admin/broadcast/worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcastId: startData.broadcastId })
            }).catch(console.error);

            setActiveBroadcast({ id: startData.broadcastId, ...startData });
            startStatusPolling(startData.broadcastId);
            setBroadcastMessage({ title: '', body: '' });
            setTestFids(''); // Clear FID input
        } catch (err: any) {
            alert('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const startStatusPolling = (broadcastId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/admin/broadcast/status?id=${broadcastId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setActiveBroadcast(data);
                if (data.isComplete) {
                    clearInterval(interval);
                    alert(`✅ Complete!\n\nSent: ${data.stats.sent}\nFailed: ${data.stats.failed}\nClicks: ${data.stats.clicks}`);
                    loadBroadcastHistory();
                    setActiveBroadcast(null);
                }
            } catch (err) {
                console.error('Poll error:', err);
                clearInterval(interval);
            }
        }, 3000);
    };

    const loadBroadcastHistory = async () => {
        try {
            const res = await fetch('/api/admin/broadcast/history?limit=10');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setBroadcastHistory(data.broadcasts || []);
        } catch (err) {
            console.error('History error:', err);
        }
    };

    const loadBroadcastDetails = async (broadcastId: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/broadcast/details?id=${broadcastId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setBroadcastDetails(data);
            setSelectedBroadcast(broadcastId);
        } catch (err: any) {
            alert('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryFailed = async (broadcastId: string) => {
        if (!confirm('🔄 Retry all failed notifications?')) return;
        try {
            setLoading(true);
            const res = await fetch('/api/admin/broadcast/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcastId })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            alert(`✅ Re-enqueued ${data.retriedCount} notifications`);

            fetch('/api/admin/broadcast/worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcastId })
            }).catch(console.error);

            loadBroadcastDetails(broadcastId);
        } catch (err: any) {
            alert('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Login screen
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <h1 style={{ margin: '0 0 10px', color: '#333', textAlign: 'center' }}>🔐 Broadcast Admin</h1>
                    <p style={{ margin: '0 0 30px', color: '#666', textAlign: 'center', fontSize: '14px' }}>
                        Enter password
                    </p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                marginBottom: '20px',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Check FID authorization
    if (context && context.user && context.user.fid !== 328997) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
                <h1>🚫 Unauthorized</h1>
                <p>Only admin can access this page.</p>
                <p><small>Your FID: {context.user.fid}</small></p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui', background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '12px', marginBottom: '30px', color: '#fff' }}>
                <h1 style={{ margin: 0, fontSize: '32px' }}>📢 Broadcast Management</h1>
                <p style={{ margin: '10px 0 0', opacity: 0.9 }}>Enterprise Notification System</p>
            </div>

            {/* Broadcast Form */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '24px', color: '#333' }}>🚀 New Broadcast</h2>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Title</label>
                    <input
                        type="text"
                        value={broadcastMessage.title}
                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, title: e.target.value })}
                        placeholder="e.g. 🌟 Galaxy Update"
                        style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                        maxLength={32}
                    />
                    <small style={{ color: '#999' }}>{broadcastMessage.title.length}/32 characters</small>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Body</label>
                    <textarea
                        value={broadcastMessage.body}
                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, body: e.target.value })}
                        placeholder="e.g. New stars have entered your galaxy..."
                        style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', minHeight: '100px', boxSizing: 'border-box', fontFamily: 'system-ui' }}
                        maxLength={128}
                    />
                    <small style={{ color: '#999' }}>{broadcastMessage.body.length}/128 characters</small>
                </div>

                {/* FID Selection Input */}
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #dee2e6' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>
                        🎯 Seçili Gruba Gönder (Opsiyonel)
                    </label>
                    <input
                        type="text"
                        value={testFids}
                        onChange={(e) => setTestFids(e.target.value)}
                        placeholder="FID'leri girin (örn: 328997, 123456, 789012)"
                        style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <small style={{ color: '#6c757d', fontSize: '12px' }}>Virgül veya boşlukla ayırın. Boş bırakırsanız "Herkese Gönder" kullanın.</small>
                </div>

                {/* Dual Button System */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleBroadcastToAll}
                        disabled={loading || !broadcastMessage.title || !broadcastMessage.body}
                        style={{
                            flex: 1,
                            padding: '14px 28px',
                            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? '⏳ Gönderiliyor...' : '📢 Herkese Gönder'}
                    </button>
                    <button
                        onClick={handleBroadcastToSelected}
                        disabled={loading || !broadcastMessage.title || !broadcastMessage.body || !testFids.trim()}
                        style={{
                            flex: 1,
                            padding: '14px 28px',
                            background: (loading || !testFids.trim()) ? '#ccc' : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (loading || !testFids.trim()) ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? '⏳ Gönderiliyor...' : '🎯 Seçili Gruba Gönder'}
                    </button>
                </div>
            </div>

            {/* Active Broadcast */}
            {activeBroadcast && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '24px', color: '#333' }}>🔄 Active Broadcast</h2>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                                {activeBroadcast.progress || 0}%
                            </div>
                            <div style={{ background: '#e0e0e0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ width: `${activeBroadcast.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', transition: 'width 0.3s' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '14px' }}>
                            <div><strong>Total:</strong> {activeBroadcast.stats?.total || 0}</div>
                            <div style={{ color: '#4CAF50' }}><strong>✅ Sent:</strong> {activeBroadcast.stats?.sent || 0}</div>
                            <div style={{ color: '#f44336' }}><strong>❌ Failed:</strong> {activeBroadcast.stats?.failed || 0}</div>
                            <div style={{ color: '#2196F3' }}><strong>👁️ Clicks:</strong> {activeBroadcast.stats?.clicks || 0}</div>
                        </div>
                        {activeBroadcast.eta > 0 && (
                            <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                                ⏱️ ETA: ~{activeBroadcast.eta}s
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Broadcast History */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '24px', color: '#333' }}>📜 Broadcast History</h2>
                {broadcastHistory.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>No broadcasts yet</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Sent</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Failed</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Clicks</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>CTR</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {broadcastHistory.map((broadcast: any) => {
                                    const ctr = broadcast.stats?.sent > 0
                                        ? ((broadcast.stats.clicks / broadcast.stats.sent) * 100).toFixed(1)
                                        : '0.0';
                                    return (
                                        <tr key={broadcast.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px' }}>{new Date(broadcast.date).toLocaleString()}</td>
                                            <td style={{ padding: '12px' }}>{broadcast.stats?.total || 0}</td>
                                            <td style={{ padding: '12px', color: '#4CAF50' }}>{broadcast.stats?.sent || 0}</td>
                                            <td style={{ padding: '12px', color: '#f44336' }}>{broadcast.stats?.failed || 0}</td>
                                            <td style={{ padding: '12px', color: '#2196F3' }}>{broadcast.stats?.clicks || 0}</td>
                                            <td style={{ padding: '12px' }}>{ctr}%</td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => loadBroadcastDetails(broadcast.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#667eea',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Broadcast Details Modal */}
            {selectedBroadcast && broadcastDetails && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>📊 Broadcast Details</h2>
                            <button
                                onClick={() => { setSelectedBroadcast(null); setBroadcastDetails(null); }}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3>Stats</h3>
                            <p>Total: {broadcastDetails.stats.total} | Sent: {broadcastDetails.stats.sent} | Failed: {broadcastDetails.stats.failed} | Clicks: {broadcastDetails.stats.clicks}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3>Success ({broadcastDetails.succeeded.length})</h3>
                            <div style={{ maxHeight: '150px', overflow: 'auto', background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                                {broadcastDetails.succeeded.join(', ')}
                            </div>
                        </div>
                        {broadcastDetails.failed.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3>Failed ({broadcastDetails.failed.length})</h3>
                                <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                                    {broadcastDetails.failed.map((f: any) => (
                                        <div key={f.fid} style={{ padding: '5px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                            FID {f.fid}: {f.error}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleRetryFailed(selectedBroadcast)}
                                    style={{
                                        marginTop: '10px',
                                        padding: '10px 20px',
                                        background: '#ff9800',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    🔄 Retry All Failed
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
