'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import {
  Package, Plus, Edit2, Trash2, LayoutDashboard,
  User, Bell, Settings, LogOut, Search, Clock, Truck,
  CheckCircle2, AlertCircle, XCircle,
} from 'lucide-react';

/* ── Sidebar (shared pattern) ── */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: true  },
    { label: 'Business Profile', icon: <User size={16} />,            href: '/dashboard/supplier/profile',       active: false },
    { label: 'Notifications',    icon: <Bell size={16} />,            href: '/dashboard/supplier/notifications', active: false },
    { label: 'Settings',         icon: <Settings size={16} />,        href: '/dashboard/supplier/settings',      active: false },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>B2B Portal</div>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user?.email || 'supplier@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'SUPPLIER'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    LIVE:     { label: 'Live',     color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
    PENDING:  { label: 'Pending',  color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
    REJECTED: { label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
    DRAFT:    { label: 'Draft',    color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' },
  };
  const cfg = map[status] || map.DRAFT;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: cfg.color, background: cfg.bg }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
      {cfg.label}
    </span>
  );
}

/* ── Main page ── */
export default function SupplierProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    try {
      const data = await fetchWithAuth('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await fetchWithAuth(`/products/${id}`, { method: 'DELETE' }); loadProducts(); }
    catch (err: any) { alert(err?.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .prod-search { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:white; font-family:var(--font-body); font-size:13px; padding:7px 12px 7px 34px; outline:none; width:220px; transition:all 0.2s; }
        .prod-search::placeholder{color:rgba(255,255,255,0.2)}
        .prod-search:focus{border-color:rgba(255,255,255,0.14);width:260px}
        .prod-card { background:#1E1E1E; border-radius:14px; border:1px solid rgba(255,255,255,0.07); overflow:hidden; transition:border-color 0.2s, transform 0.2s; }
        .prod-card:hover { border-color:rgba(37,99,235,0.3); transform:translateY(-2px); }
        .prod-action-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 0; border:none; background:transparent; cursor:pointer; font-family:var(--font-body); font-size:12px; font-weight:600; color:rgba(255,255,255,0.3); transition:all 0.2s; }
        .prod-action-btn:hover { color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.04); }
        .prod-action-btn.danger:hover { color:#F87171; background:rgba(248,113,113,0.06); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .anim-up { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="rgba(255,255,255,0.28)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input className="prod-search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Link href="/dashboard/supplier/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 9, background: '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 20px rgba(37,99,235,0.35)', transition: 'all 0.2s' }}>
              <Plus size={14} /> Add Product
            </Link>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>
            <div className="anim-up" style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>My Products</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Manage your catalog. Products go live after admin approval.</p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' as const }}>
              {[
                { label: 'Total',    value: products.length,                              color: 'rgba(255,255,255,0.5)', icon: <Package size={13} /> },
                { label: 'Live',     value: products.filter(p => p.status === 'LIVE').length,     color: '#34D399',            icon: <CheckCircle2 size={13} /> },
                { label: 'Pending',  value: products.filter(p => p.status === 'PENDING').length,  color: '#FBBF24',            icon: <Clock size={13} /> },
                { label: 'Rejected', value: products.filter(p => p.status === 'REJECTED').length, color: '#F87171',            icon: <XCircle size={13} /> },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 10, background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white' }}>{s.value}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
              <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '64px 20px', textAlign: 'center' as const }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Package size={24} color="#60A5FA" />
                </div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                  {search ? 'No products match your search' : 'No products yet'}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
                  {search ? 'Try a different keyword.' : 'Add your first product to start selling on Delraw.'}
                </p>
                {!search && (
                  <Link href="/dashboard/supplier/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, background: '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}>
                    <Plus size={14} /> Add Product
                  </Link>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!loading && filtered.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {filtered.map(p => (
                  <div key={p.id} className="prod-card">
                    {/* Image area */}
                    <div style={{ height: 180, background: 'rgba(255,255,255,0.03)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={36} color="rgba(255,255,255,0.1)" />
                      )}
                      <div style={{ position: 'absolute', top: 12, left: 12 }}>
                        <StatusBadge status={p.status} />
                      </div>
                      {p.status === 'REJECTED' && p.rejectionReason && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(248,113,113,0.85)', padding: '6px 12px' }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '16px 18px 8px' }}>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.name}</h3>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {p.description || 'No description provided.'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'white' }}>₹{p.price?.toLocaleString() || '—'}</span>
                        {p.moq && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)' }}>MOQ: {p.moq}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Link href={`/dashboard/supplier/products/${p.id}`} className="prod-action-btn" style={{ textDecoration: 'none' }}>
                        <Edit2 size={13} /> Edit
                      </Link>
                      {p.status !== 'LIVE' && (
                        <button onClick={() => handleDelete(p.id)} className="prod-action-btn danger" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
