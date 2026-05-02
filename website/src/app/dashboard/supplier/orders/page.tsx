'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Package, ShoppingCart, TrendingUp, DollarSign,
  Clock, Truck, CheckCircle, XCircle, Filter
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

/* ════════ STATUS BADGE ════════ */
function OrderStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
    PENDING:    { bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24', border: 'rgba(251,191,36,0.2)',  icon: <Clock size={12} /> },
    PROCESSING: { bg: 'rgba(96,165,250,0.1)',  color: '#60A5FA', border: 'rgba(96,165,250,0.2)',  icon: <Package size={12} /> },
    SHIPPED:    { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.2)', icon: <Truck size={12} /> },
    DELIVERED:  { bg: 'rgba(52,211,153,0.1)',  color: '#34D399', border: 'rgba(52,211,153,0.2)',  icon: <CheckCircle size={12} /> },
    CANCELLED:  { bg: 'rgba(248,113,113,0.1)', color: '#F87171', border: 'rgba(248,113,113,0.2)', icon: <XCircle size={12} /> },
  };
  const c = configs[status] || configs.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {c.icon} {status}
    </span>
  );
}

/* ════════ STATUS TRANSITIONS ════════ */
const TRANSITIONS: Record<string, { label: string; status: string; color: string }[]> = {
  PENDING:    [{ label: '▶ Process', status: 'PROCESSING', color: '#3B82F6' }, { label: '✕ Cancel', status: 'CANCELLED', color: '#EF4444' }],
  PROCESSING: [{ label: '🚚 Ship', status: 'SHIPPED', color: '#8B5CF6' }, { label: '✕ Cancel', status: 'CANCELLED', color: '#EF4444' }],
  SHIPPED:    [{ label: '✓ Delivered', status: 'DELIVERED', color: '#10B981' }],
  DELIVERED:  [],
  CANCELLED:  [],
};

const TABS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function SupplierOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const url = activeTab === 'ALL' ? '/orders/my' : `/orders/my?status=${activeTab}`;
      const data = await fetchWithAuth(url);
      setOrders(data?.items || []);
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); loadOrders(); }, [activeTab]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      await fetchWithAuth(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; --font-num:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0A0A0A; color:white; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .tab-btn { padding:8px 18px; border-radius:999px; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); }
        .tab-btn:hover { background:rgba(255,255,255,0.08); color:white; }
        .tab-btn.active { background:#2563EB; border-color:#3B82F6; color:white; box-shadow:0 0 16px rgba(37,99,235,0.4); }
        .order-row { transition:all 0.2s; border-bottom:1px solid rgba(255,255,255,0.03); }
        .order-row:hover { background:rgba(255,255,255,0.02); }
        .action-btn { padding:7px 16px; border-radius:10px; font-size:12px; font-weight:700; color:white; border:none; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .action-btn:hover:not(:disabled) { filter:brightness(1.15); transform:translateY(-1px); }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
        <Sidebar active="orders" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 54, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Page Title */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Order Management</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Track, process, and fulfil your incoming orders.</p>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Total Orders', value: stats.totalOrders || 0, icon: <ShoppingCart size={18} />, color: '#3B82F6' },
                  { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={18} />, color: '#10B981' },
                  { label: 'Commission Paid', value: `₹${(stats.totalCommission || 0).toLocaleString()}`, icon: <DollarSign size={18} />, color: '#F59E0B' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontFamily: 'var(--font-num)', fontSize: 22, fontWeight: 800, color: 'white' }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                {TABS.map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : orders.length === 0 ? (
                <div style={{ background: '#111', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)', padding: '80px 20px', textAlign: 'center' }}>
                  <ShoppingCart size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, color: 'white', fontWeight: 700, marginBottom: 8 }}>No orders yet</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 320, margin: '0 auto' }}>Orders will appear here when buyers purchase your products.</p>
                </div>
              ) : (
                <div style={{ background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['Order', 'Product', 'Qty', 'Total', 'Commission', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="order-row">
                          <td style={{ padding: '14px 16px' }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'white', fontFamily: 'var(--font-num)' }}>#{o.id?.substring(0, 8)}</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: 'white' }}>{o.product?.name || '—'}</td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-num)' }}>{o.quantity}</td>
                          <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#34D399', fontFamily: 'var(--font-num)' }}>₹{o.totalAmount?.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#FBBF24', fontFamily: 'var(--font-num)' }}>₹{o.commissionPaid?.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px' }}><OrderStatusBadge status={o.status} /></td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {(TRANSITIONS[o.status] || []).map(t => (
                                <button key={t.status} className="action-btn" disabled={actionLoading === o.id} onClick={() => handleStatusUpdate(o.id, t.status)} style={{ background: t.color, fontSize: 11, padding: '6px 12px' }}>
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
