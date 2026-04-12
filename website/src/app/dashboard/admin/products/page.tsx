'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, LayoutDashboard, Users, Package, Shield, LogOut, BarChart3, History, Search, Crown } from 'lucide-react';
import { SuperAdminSidebar } from '../../super-admin/page';

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
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: true },
    { label: 'Audit Logs', icon: <History size={16} />, href: '/dashboard/admin/audit-logs', active: false },

  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#050505', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "var(--font-heading)" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
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
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

function ProductStatusBadge({ status = 'UNKNOWN', size = 'sm' }: { status?: string; size?: 'sm' | 'md' }) {
  const configs: Record<string, { bg: string; color: string; border: string }> = {
    LIVE: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34D399', border: 'rgba(52, 211, 153, 0.2)' },
    PENDING_APPROVAL: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.2)' },
    REJECTED: { bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171', border: 'rgba(248, 113, 113, 0.2)' },
    DELISTED: { bg: 'rgba(156, 163, 175, 0.1)', color: '#9CA3AF', border: 'rgba(156, 163, 175, 0.2)' },
    DRAFT: { bg: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255, 255, 255, 0.1)' },
    UNKNOWN: { bg: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255, 255, 255, 0.1)' },
  };
  const config = configs[status] || configs.UNKNOWN;

  return (
    <span style={{
      display: 'inline-flex', padding: size === 'md' ? '6px 14px' : '4px 10px',
      borderRadius: 6, background: config.bg, border: `1px solid ${config.border}`,
      color: config.color, fontFamily: 'var(--font-body)', fontSize: size === 'md' ? 12 : 10,
      fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase'
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const STATUS_TABS = ['ALL', 'PENDING_APPROVAL', 'LIVE', 'REJECTED', 'DELISTED'] as const;
const TRANSITION_MAP: Record<string, { label: string; status: string; color: string }[]> = {
  PENDING_APPROVAL: [{ label: '✅ Approve (Go Live)', status: 'LIVE', color: '#10B981' }, { label: '❌ Reject', status: 'REJECTED', color: '#EF4444' }],
  LIVE: [{ label: '🚫 Delist', status: 'DELISTED', color: 'rgba(255,255,255,0.2)' }],
  DELISTED: [{ label: '🔄 Re-list', status: 'LIVE', color: '#3B82F6' }],
  REJECTED: [{ label: '🔄 Re-submit', status: 'PENDING_APPROVAL', color: '#F59E0B' }],
  DRAFT: [],
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProducts = async () => {
    try { const url = activeTab === 'ALL' ? '/admin/products' : `/admin/products?status=${activeTab}`; const data = await fetchWithAuth(url); setProducts(Array.isArray(data) ? data : []); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); loadProducts(); }, [activeTab]);

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    try { const data = await fetchWithAuth(`/admin/products/${id}`); setSelected(data); } catch (err) { console.error(err); } finally { setDetailLoading(false); }
  };

  const handleUpdate = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') { rejectionReason = prompt('Rejection reason:') || ''; if (!rejectionReason) return; }
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) }); await loadProducts(); await loadDetail(id); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); } finally { setActionLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0A0A0A; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px; height:4px;} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        
        .tab-button { padding: 10px 20px; border-radius: 999px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
        .tab-button:hover { background: rgba(255,255,255,0.08); color: white; }
        .tab-button.active { background: #2563EB; border-color: #3B82F6; color: white; box-shadow: 0 0 16px rgba(37,99,235,0.4); }
        
        .list-row { transition: all 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; }
        .list-row:hover { background: rgba(255,255,255,0.02); }
        .list-row.selected { background: rgba(37,99,235,0.05); }
        
        .action-button { padding: 10px 20px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; color: white; border: none; cursor: pointer; transition: all 0.2s; }
        .action-button:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .action-button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
        {user?.role === 'SUPER_ADMIN' ? (
          <SuperAdminSidebar active="products" />
        ) : (
          <AdminSidebar />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ position: 'relative', height: 54, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            {/* CENTERED ADMIN TEXT */}

            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Product Database</span>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Product Moderation</h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Review submitted products and ensure marketplace quality.</p>
                </div>
              </div>

              {/* TABS */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                {STATUS_TABS.map(tab => (
                  <button key={tab} className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setSelected(null); }}>
                    {tab.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 32 }}>

                  {/* MASTER LIST */}
                  <div>
                    {products.length === 0 ? (
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '60px 20px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No products found in this category.</p>
                      </div>
                    ) : (
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplier</th>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(activeTab === 'ALL' ? products : products.filter(p => p.status === activeTab)).map(p => (
                              <tr key={p.id} onClick={() => loadDetail(p.id)} className={`list-row ${selected?.id === p.id ? 'selected' : ''}`}>
                                <td style={{ padding: '16px 20px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    {p.images?.[0] ? (
                                      <img src={p.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    ) : (
                                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={20} color="rgba(255,255,255,0.2)" />
                                      </div>
                                    )}
                                    <div>
                                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 2 }}>{p.name}</p>
                                      <p style={{ fontFamily: 'var(--font-num)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>₹{p.price?.toLocaleString() ?? '—'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'white' }}>{p.supplier?.companyName || '—'}</td>
                                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{p.category || '—'}</td>
                                <td style={{ padding: '16px 20px' }}>
                                  <ProductStatusBadge status={p.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* DETAIL VIEW */}
                  <div>
                    {detailLoading ? (
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '60px 20px', textAlign: 'center', position: 'sticky', top: 32 }}>
                        <div style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      </div>
                    ) : selected ? (
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24, position: 'sticky', top: 32 }}>
                        {selected.images?.length > 0 && (
                          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
                            {selected.images.map((img: string, i: number) => (
                              <img key={i} src={img} alt="" style={{ height: 100, minWidth: 100, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                            ))}
                          </div>
                        )}

                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 6 }}>{selected.name}</h3>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#60A5FA', marginBottom: 12 }}>{selected.supplier?.companyName}</p>
                          <ProductStatusBadge status={selected.status} size="md" />

                          {selected.status === 'REJECTED' && selected.rejectionReason && (
                            <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Rejection Reason</p>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#FCA5A5', fontStyle: 'italic' }}>&ldquo;{selected.rejectionReason}&rdquo;</p>
                            </div>
                          )}
                        </div>

                        {selected.description && (
                          <div style={{ marginBottom: 24 }}>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Description</p>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{selected.description}</p>
                          </div>
                        )}

                        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                              ['Price', `₹${selected.price?.toLocaleString() ?? '—'}`],
                              ['Unit', selected.unit],
                              ['MOQ', selected.moq],
                              ['Lead Time', `${selected.leadTime}d`],
                              ['Category', selected.category]
                            ].map(([l, v]) => (
                              <div key={l as string}>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{l}</p>
                                <p style={{ fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 600, color: 'white' }}>{v || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selected.variants?.length > 0 && (
                          <div style={{ marginBottom: 24 }}>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Variants ({selected.variants.length})</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {selected.variants.map((v: any) => (
                                <div key={v.id} style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'white' }}>{v.name}</p>
                                    {v.sku && <p style={{ fontFamily: 'var(--font-num)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>SKU: {v.sku}</p>}
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    {v.price && <p style={{ fontFamily: 'var(--font-num)', fontSize: 13, fontWeight: 600, color: 'white' }}>₹{v.price.toLocaleString()}</p>}
                                    <p style={{ fontFamily: 'var(--font-num)', fontSize: 11, color: '#34D399' }}>Stock: {v.stock}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Moderation Actions</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {(TRANSITION_MAP[selected.status] || []).map(t => (
                              <button key={t.status} disabled={actionLoading} onClick={() => handleUpdate(selected.id, t.status)} className="action-button" style={{ background: t.color, flex: 1 }}>
                                {t.label}
                              </button>
                            ))}
                            {(TRANSITION_MAP[selected.status] || []).length === 0 && (
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No actions available for this status.</p>
                            )}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.05)', height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', position: 'sticky', top: 32 }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Select a product from the list to view details and moderate.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
