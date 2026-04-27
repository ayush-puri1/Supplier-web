'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Activity, Mail, Clock, Shield, Tag, Info, UserCheck, Eye } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function AuditLogsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                search: search
            });
            const data: any = await fetchWithAuth(`/admin/audit-logs?${params}`);
            setLogs(data?.logs || []);
            setTotalPages(data?.totalPages || 1);
            setTotal(data?.total || 0);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, search]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif;  --font-body:'DM Sans',sans-serif; }
        body { background:#0A0A0A; color:white; }
        .search-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; padding: 12px 16px 12px 42px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; width: 100%; outline: none; transition: all 0.2s; }
        .search-input:focus { border-color: #3B82F6; background: rgba(255,255,255,0.05); box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .log-card { background: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; transition: all 0.2s; cursor: pointer; }
        .log-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); background: #161616; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 10px; fontWeight: 700; letterSpacing: '0.05em'; textTransform: 'uppercase'; }
        .badge-role { background: rgba(59,130,246,0.1); color: #60A5FA; border: 1px solid rgba(59,130,246,0.2); }
        .badge-action { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
        .page-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

            <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
                <Sidebar active="audit" />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                    {/* HEADER */}
                    <header style={{ height: 60, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
                        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected</p>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>MongoDB Logging Engine</p>
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={18} color="#34D399" />
                            </div>
                        </div>
                    </header>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 32px' }}>
                        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                            <div style={{ marginBottom: 40 }}>
                                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>Audit History</h1>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 600 }}>
                                    Monitor platform activity across roles. Search by Log ID, Email, or specific actions to find exactly what happened.
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div style={{ position: 'relative', marginBottom: 32 }}>
                                <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Email, or Action (e.g. USER_LOGIN)..."
                                    className="search-input"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>

                            {/* Results */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} style={{ height: 100, background: '#111', borderRadius: 16, animation: 'pulse 2s infinite' }} />
                                    ))
                                ) : logs.length > 0 ? (
                                    logs.map(log => (
                                        <div key={log._id} className="log-card" onClick={() => setSelectedLog(log)} style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <Tag size={16} color="rgba(255,255,255,0.4)" />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontFamily: 'var(--font-num)', fontSize: 12, fontWeight: 700, color: '#3B82F6', marginBottom: 2 }}>{log.logId}</p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span className="badge badge-action">{log.action.replace(/_/g, ' ')}</span>
                                                            <span className="badge badge-role">{log.actorRole}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 4 }}>{log.actorEmail}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', color: 'rgba(255,255,255,0.3)' }}>
                                                        <Clock size={12} />
                                                        <span style={{ fontSize: 11, fontWeight: 500 }}>{new Date(log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                                                <Info size={14} color="rgba(255,255,255,0.2)" />
                                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.details || 'No additional details recorded for this event.'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#111', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <Search size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                                        <p style={{ fontSize: 16, color: 'white', fontWeight: 600, marginBottom: 4 }}>No results found</p>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Try adjusting your search terms or filters.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 40 }}>
                                    <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div style={{ background: '#111', padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                                            Page <span style={{ color: '#3B82F6' }}>{page}</span> of {totalPages}
                                        </p>
                                    </div>
                                    <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* LOG DETAILS MODAL */}
                {selectedLog && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                        <div style={{ background: '#161616', width: '100%', maxWidth: 600, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                            <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Event Details</p>
                                    <h3 style={{ fontSize: 18, color: 'white', fontWeight: 700 }}>{selectedLog.logId}</h3>
                                </div>
                                <button onClick={() => setSelectedLog(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: 8, borderRadius: 10, cursor: 'pointer' }}>
                                    <ArrowLeft size={18} />
                                </button>
                            </div>
                            <div style={{ padding: 32 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                                    <div>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Performed By</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserCheck size={16} color="#3B82F6" />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{selectedLog.actorEmail}</p>
                                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{selectedLog.actorRole}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Timestamp</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Clock size={16} color="rgba(255,255,255,0.4)" />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{new Date(selectedLog.createdAt).toLocaleTimeString()}</p>
                                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{new Date(selectedLog.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 32 }}>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Action Summary</p>
                                    <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                                        <p style={{ fontSize: 14, color: 'white', lineHeight: 1.6 }}>{selectedLog.details || 'No detailed description available.'}</p>
                                    </div>
                                </div>

                                {selectedLog.metadata && (
                                    <div>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Technical Metadata</p>
                                        <pre style={{ padding: 20, background: '#000', borderRadius: 16, color: '#34D399', fontSize: 12, overflow: 'auto', maxHeight: 200, fontFamily: 'monospace', border: '1px solid rgba(52,211,153,0.1)' }}>
                                            {JSON.stringify(selectedLog.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
