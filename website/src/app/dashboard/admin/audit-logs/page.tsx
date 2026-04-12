'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, LayoutDashboard, Users, Package, Shield, LogOut, BarChart3, ChevronLeft, ChevronRight, FileText, Search, Activity, History } from 'lucide-react';

/* ══════════════════════════════════════════════
   ADMIN SIDEBAR
══════════════════════════════════════════════ */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} />, href: '/dashboard/admin', active: false },
    { label: 'Analytics', icon: <BarChart3 size={16} />, href: '/dashboard/admin/analytics', active: false },
    { label: 'Suppliers', icon: <Users size={16} />, href: '/dashboard/admin/suppliers', active: false },
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: false },
    { label: 'Audit Logs', icon: <History size={16} />, href: '/dashboard/admin/audit-logs', active: true },
    { label: 'Config', icon: <Shield size={16} />, href: '/dashboard/admin/config', active: false },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Admin Portal</div>
        </div>
      </Link>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? 'white' : 'rgba(255,255,255,0.38)', background: item.active ? 'rgba(37,99,235,0.14)' : 'transparent', borderLeft: item.active ? '2px solid #60A5FA' : '2px solid transparent', transition: 'all 0.2s' }}>
            <span style={{ color: item.active ? '#60A5FA' : 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
        {user && (
          <div style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'admin@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'ADMIN'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filterAction) params.append('action', filterAction);
      if (filterEntity) params.append('entityType', filterEntity);
      const data: any = await fetchWithAuth(`/admin/audit-logs?${params}`);
      setLogs(data?.logs || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchWithAuth('/admin/audit-logs/actions').then((d: any) => setActions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { loadLogs(); }, [page, filterAction, filterEntity]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px; height:4px;} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .filter-select { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; padding: 10px 16px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; outline: none; transition: all 0.2s; cursor: pointer; appearance: none; }
        .filter-select:hover { border-color: rgba(255,255,255,0.15); }
        .filter-select:focus { border-color: #3B82F6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
        .filter-select option { background: #1E1E1E; color: white; }
        .log-table-row { transition: background 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .log-table-row:hover { background: rgba(255,255,255,0.02); }
        .page-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; width: 36px; height: 36px; border-radius: 10px; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <AdminSidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
             {/* CENTERED ADMIN TEXT */}
             <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 800, letterSpacing: '0.15em', color: 'white' }}>ADMIN</div>
             <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
               <ArrowLeft size={14} /> Back
             </button>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Activity size={14} color="#34D399" />
               <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>System logging active</span>
             </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Audit Logs</h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Detailed historical record of all critical platform events.</p>
                </div>
              </div>

              {/* Filters Block */}
              <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }} className="filter-select">
                      <option value="">All Actions</option>
                      {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select value={filterEntity} onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }} className="filter-select">
                      <option value="">All Entities</option>
                      {['User', 'Supplier', 'Product', 'System'].map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ flex: 1 }} />
                
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontFamily: 'var(--font-num)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total: <span style={{ color: 'white' }}>{total}</span> records</p>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actor</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entity</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map(log => (
                          <tr key={log.id} className="log-table-row">
                            <td style={{ padding: '16px 20px', fontFamily: 'var(--font-num)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(log.createdAt).toLocaleString(undefined, { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{log.actorEmail}</p>
                              <p style={{ fontFamily: 'var(--font-num)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>ID: {log.actorId?.slice(0, 8)}...</p>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#60A5FA', marginBottom: 2 }}>{log.entityType}</p>
                              <p style={{ fontFamily: 'var(--font-num)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>ID: {log.entityId?.slice(0, 8)}...</p>
                            </td>
                            <td style={{ padding: '16px 20px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {log.details || '—'}
                            </td>
                          </tr>
                        ))}
                        {logs.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No audit logs found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                    Page <span style={{ color: 'white' }}>{page}</span> of {totalPages}
                  </span>
                  <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
