'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, LayoutDashboard, Users, Package, Shield, LogOut, BarChart3, TrendingUp, Activity, PieChart, Building2, CheckCircle2, History , Crown } from 'lucide-react';
import { SuperAdminSidebar } from '../../super-admin/page';

/* ══════════════════════════════════════════════
   ADMIN SIDEBAR
══════════════════════════════════════════════ */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} />, href: '/dashboard/admin', active: false },
    { label: 'Analytics', icon: <BarChart3 size={16} />, href: '/dashboard/admin/analytics', active: true },
    { label: 'Suppliers', icon: <Users size={16} />, href: '/dashboard/admin/suppliers', active: false },
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: false },
    { label: 'Audit Logs', icon: <History size={16} />, href: '/dashboard/admin/audit-logs', active: false },
    
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#050505', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
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
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

const SUPPLIER_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#A1A1AA', SUBMITTED: '#FBBF24', UNDER_REVIEW: '#60A5FA',
  VERIFIED: '#3B82F6', CONDITIONAL: '#FB923C', REJECTED: '#F87171', SUSPENDED: '#52525B',
};
const PRODUCT_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#A1A1AA', PENDING_APPROVAL: '#FBBF24', LIVE: '#34D399', REJECTED: '#F87171', DELISTED: '#52525B',
};

function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case 'VERIFIED': case 'LIVE': return { dot: '#34D399', bg: 'rgba(52,211,153,0.1)', color: '#34D399', label: status };
      case 'SUBMITTED': case 'PENDING_APPROVAL': case 'UNDER_REVIEW': return { dot: '#FBBF24', bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', label: 'PENDING' };
      case 'REJECTED': case 'DELISTED': case 'SUSPENDED': return { dot: '#F87171', bg: 'rgba(248,113,113,0.1)', color: '#F87171', label: status };
      default: return { dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', label: status };
    }
  };
  const sc = getStyle();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: sc.color, background: sc.bg }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
      {sc.label}
    </span>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/analytics').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const summary = data?.summary || {};
  const supplierDist = data?.distributions?.supplier || {};
  const productDist = data?.distributions?.product || {};
  const topSuppliers = data?.topSuppliers || [];

  const supplierTotal = Object.values(supplierDist).reduce((a: number, b: any) => a + (b as number), 0) as number || 1;
  const productTotal = Object.values(productDist).reduce((a: number, b: any) => a + (b as number), 0) as number || 1;

  const stats = [
    { icon: <Users size={22} color="#A78BFA" />, label: 'Total Users', value: summary.totalUsers || 0, bg: 'rgba(167,139,250,0.1)' },
    { icon: <Building2 size={22} color="#3B82F6" />, label: 'Suppliers', value: summary.totalSuppliers || 0, bg: 'rgba(59,130,246,0.1)' },
    { icon: <CheckCircle2 size={22} color="#34D399" />, label: 'Active Sellers', value: summary.activeSuppliers || 0, bg: 'rgba(52,211,153,0.1)' },
    { icon: <Package size={22} color="#FBBF24" />, label: 'Total Products', value: summary.totalProducts || 0, bg: 'rgba(251,191,36,0.1)' },
    { icon: <Activity size={22} color="#F472B6" />, label: 'Live Products', value: summary.liveProducts || 0, bg: 'rgba(244,114,182,0.1)' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0A0A0A; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
        {user?.role === "SUPER_ADMIN" ? <SuperAdminSidebar active="analytics" /> : <AdminSidebar />}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ position: 'relative', height: 54, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
             {/* HEADER NAVIGATION */}
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Last updated Just now</span>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Platform Analytics</h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>High-level overview of supplier onboarding and product catalog health.</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
                {stats.map((s) => (
                  <div key={s.label} style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.icon}
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-num)', fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 24 }}>

                {/* Supplier Funnel */}
                <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 20 }}>
                    <TrendingUp size={18} color="#3B82F6" />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Supplier Funnel</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {Object.entries(supplierDist).map(([status, count]) => {
                      const color = SUPPLIER_STATUS_COLORS[status] || '#A1A1AA';
                      return (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', width: 100, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{status.replace(/_/g, ' ')}</span>
                          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: color, width: `${Math.max(2, ((count as number) / supplierTotal) * 100)}%`, transition: 'width 1s ease-out', boxShadow: `0 0 10px ${color}66` }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 700, color: 'white', width: 32, textAlign: 'right' }}>{count as number}</span>
                        </div>
                      );
                    })}
                    {Object.keys(supplierDist).length === 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No data available</p>}
                  </div>
                </div>

                {/* Product Status */}
                <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 20 }}>
                    <PieChart size={18} color="#3B82F6" />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Product Catalog Status</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {Object.entries(productDist).map(([status, count]) => {
                      const color = PRODUCT_STATUS_COLORS[status] || '#A1A1AA';
                      return (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', width: 120, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{status.replace(/_/g, ' ')}</span>
                          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: color, width: `${Math.max(2, ((count as number) / productTotal) * 100)}%`, transition: 'width 1s ease-out', boxShadow: `0 0 10px ${color}66` }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 700, color: 'white', width: 32, textAlign: 'right' }}>{count as number}</span>
                        </div>
                      );
                    })}
                    {Object.keys(productDist).length === 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No data available</p>}
                  </div>
                </div>

              </div>

              {/* Top Contributors */}
              <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 20 }}>
                  <Users size={18} color="#3B82F6" />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Top Contributors</h3>
                </div>
                {topSuppliers.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No supplier data available</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {topSuppliers.map((s: any, i: number) => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 700 }}>
                          #{i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{s.companyName}</p>
                          <StatusBadge status={s.status} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'var(--font-num)', fontSize: 20, fontWeight: 700, color: 'white' }}>{s._count?.products || 0}</p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Products</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
