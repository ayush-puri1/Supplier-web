'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Users, Clock, Package, AlertCircle, ArrowRight,
  LayoutDashboard, LogOut, Check, X, Search, Activity, FileText, Bell,
  Shield, CheckCircle2, Navigation, BarChart3, History
} from 'lucide-react';

/* ══════════════════════════════════════════════
   ADMIN SIDEBAR
══════════════════════════════════════════════ */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} />, href: '/dashboard/admin', active: true },
    { label: 'Analytics', icon: <BarChart3 size={16} />, href: '/dashboard/admin/analytics', active: false },
    { label: 'Suppliers', icon: <Users size={16} />, href: '/dashboard/admin/suppliers', active: false },
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: false },
    { label: 'Audit Logs', icon: <History size={16} />, href: '/dashboard/admin/audit-logs', active: false },
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
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Admin Portal</div>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user?.email || 'admin@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'ADMIN'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════
   REUSABLE BADGE
══════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case 'VERIFIED': case 'LIVE':
        return { dot: '#34D399', bg: 'rgba(52,211,153,0.1)', color: '#34D399', label: status };
      case 'SUBMITTED': case 'PENDING_APPROVAL': case 'UNDER_REVIEW':
        return { dot: '#FBBF24', bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', label: 'PENDING' };
      case 'REJECTED': case 'DELISTED': case 'SUSPENDED':
        return { dot: '#F87171', bg: 'rgba(248,113,113,0.1)', color: '#F87171', label: status };
      default:
        return { dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', label: status };
    }
  };
  const sc = getStyle();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: sc.color, background: sc.bg }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
      {sc.label}
    </span>
  );
}

/* ══════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingSuppliers, setPendingSuppliers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, sup, prod] = await Promise.all([
          fetchWithAuth('/admin/stats'),
          fetchWithAuth('/admin/suppliers/pending').catch(() => []),
          fetchWithAuth('/admin/products?status=PENDING_APPROVAL').catch(() => []),
        ]);
        setStats(s);
        setPendingSuppliers(Array.isArray(sup) ? sup.slice(0, 5) : []);
        setPendingProducts(Array.isArray(prod) ? prod.slice(0, 5) : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  const handleSupplierAction = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      rejectionReason = prompt('Provide a rejection reason:') || '';
      if (!rejectionReason) return;
    }
    try {
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) });
      setPendingSuppliers(pendingSuppliers.filter(s => s.id !== id));
    } catch (err: any) { alert(err?.response?.data?.message || 'Action failed'); }
  };

  const handleProductAction = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      rejectionReason = prompt('Provide a rejection reason:') || '';
      if (!rejectionReason) return;
    }
    try {
      await fetchWithAuth(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) });
      setPendingProducts(pendingProducts.filter(p => p.id !== id));
    } catch (err: any) { alert(err?.response?.data?.message || 'Action failed'); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .search-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:white; font-family:var(--font-body); font-size:13px; padding:7px 12px 7px 34px; outline:none; width:200px; transition:all 0.2s; }
        .search-input::placeholder{color:rgba(255,255,255,0.2)}
        .search-input:focus{border-color:rgba(255,255,255,0.14); width:240px}
        .admin-table-row { transition: background 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .admin-table-row:hover { background: rgba(255,255,255,0.02); }
        .action-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); cursor: pointer; padding: 6px 12px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; transition: all 0.2s; }
        .action-btn:hover { background: rgba(255,255,255,0.08); color: white; }
        .action-btn.approve { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.25); color: #34D399; }
        .action-btn.approve:hover { background: rgba(52,211,153,0.2); }
        .action-btn.reject { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.25); color: #F87171; }
        .action-btn.reject:hover { background: rgba(248,113,113,0.2); }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <AdminSidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', gap: 16 }}>
             {/* CENTERED ADMIN TEXT */}
             <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 800, letterSpacing: '0.15em', color: 'white' }}>ADMIN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} color="rgba(255,255,255,0.28)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="search-input" placeholder="Search platform..." />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/dashboard/admin/analytics" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#60A5FA', textDecoration: 'none', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, transition: 'all 0.2s' }}>
                <BarChart3 size={13} /> View Analytics
              </Link>
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                <Bell size={14} color="rgba(255,255,255,0.65)" />
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 10px rgba(96,165,250,0.45)' }}>
                <Shield size={14} color="white" />
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Platform Overview</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Monitor and manage the Delraw marketplace.</p>
            </div>

            {/* STAT CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
              {[
                { label: 'Total Suppliers', value: stats?.suppliers?.total || 0, icon: <Users size={20} />, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)', note: 'Registered accounts' },
                { label: 'Pending Verification', value: stats?.suppliers?.pending || 0, icon: <Clock size={20} />, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', note: 'Needs review' },
                { label: 'Live Products', value: stats?.products?.live || 0, icon: <Package size={20} />, color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)', note: 'Active inventory' },
                { label: 'Pending Approval', value: stats?.products?.pending || 0, icon: <AlertCircle size={20} />, color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', note: 'Awaiting moderation' },
              ].map(card => (
                <div key={card.label} style={{ background: '#1E1E1E', borderRadius: 14, border: `1px solid ${card.border}`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)' }}>{card.label}</p>
                     <div style={{ color: card.color }}>{card.icon}</div>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-num)', fontSize: 26, fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: 4 }}>{card.value}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: card.color }}>{card.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DATA TABLES GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              
              {/* Supplier Verification Queue */}
              <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Supplier Verification</h2>
                  <Link href="/dashboard/admin/suppliers" style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                {pendingSuppliers.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center' as const, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                     <CheckCircle2 size={32} color="rgba(52,211,153,0.3)" style={{ marginBottom: 12 }} />
                     <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>No suppliers pending verification.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>Business</th>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>Status</th>
                        <th style={{ textAlign: 'right', padding: '12px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSuppliers.map((s) => (
                        <tr key={s.id} className="admin-table-row">
                          <td style={{ padding: '12px 20px' }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{s.companyName}</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{s.user?.email}</p>
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            <StatusBadge status={s.status} />
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <Link href={`/dashboard/admin/suppliers/${s.id}`} style={{ textDecoration: 'none' }}><button className="action-btn">View</button></Link>
                              <button onClick={() => handleSupplierAction(s.id, 'VERIFIED')} className="action-btn approve">Approve</button>
                              <button onClick={() => handleSupplierAction(s.id, 'REJECTED')} className="action-btn reject">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Product Moderation Queue */}
              <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Product Moderation</h2>
                  <Link href="/dashboard/admin/products" style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                {pendingProducts.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center' as const, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                     <CheckCircle2 size={32} color="rgba(52,211,153,0.3)" style={{ marginBottom: 12 }} />
                     <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>No products in the moderation queue.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>Product</th>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>Supplier</th>
                        <th style={{ textAlign: 'right', padding: '12px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProducts.map((p) => (
                        <tr key={p.id} className="admin-table-row">
                          <td style={{ padding: '12px 20px' }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{p.name}</p>
                            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>₹{p.price?.toLocaleString() || '-'}</p>
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{p.supplier?.companyName}</p>
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button onClick={() => handleProductAction(p.id, 'LIVE')} className="action-btn approve">Approve</button>
                              <button onClick={() => handleProductAction(p.id, 'REJECTED')} className="action-btn reject">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
