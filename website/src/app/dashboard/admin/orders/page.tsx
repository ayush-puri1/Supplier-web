'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, ShoppingCart, TrendingUp, DollarSign,
  Clock, Package, Truck, CheckCircle, XCircle, Eye
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

/* ════════ STATUS BADGE ════════ */
function OrderStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
    PENDING:     { bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24', border: 'rgba(251,191,36,0.2)',  icon: <Clock size={12} /> },
    PROCESSING:  { bg: 'rgba(96,165,250,0.1)',  color: '#60A5FA', border: 'rgba(96,165,250,0.2)',  icon: <Package size={12} /> },
    SHIPPED:     { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.2)', icon: <Truck size={12} /> },
    DELIVERED:   { bg: 'rgba(52,211,153,0.1)',  color: '#34D399', border: 'rgba(52,211,153,0.2)',  icon: <CheckCircle size={12} /> },
    CANCELLED:   { bg: 'rgba(248,113,113,0.1)', color: '#F87171', border: 'rgba(248,113,113,0.2)', icon: <XCircle size={12} /> },
  };
  const c = configs[status] || configs.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {c.icon} {status}
    </span>
  );
}

const TABS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const url = activeTab === 'ALL' ? '/orders/admin/all' : `/orders/admin/all?status=${activeTab}`;
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

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await fetchWithAuth(`/orders/admin/${id}`);
      setSelectedOrder(data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; --font-num:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0A0A0A; color:white; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .tab-btn { padding:8px 18px; border-radius:999px; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); }
        .tab-btn:hover { background:rgba(255,255,255,0.08); color:white; }
        .tab-btn.active { background:#2563EB; border-color:#3B82F6; color:white; box-shadow:0 0 16px rgba(37,99,235,0.4); }
        .order-row { transition:all 0.2s; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; }
        .order-row:hover { background:rgba(255,255,255,0.02); }
        .order-row.selected { background:rgba(37,99,235,0.05); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
        <Sidebar active="orders" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 54, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Platform Orders</span>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              {/* Title */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Order Dashboard</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Monitor all platform orders, revenue, and fulfillment status.</p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Total Orders', value: stats.totalOrders || 0, icon: <ShoppingCart size={18} />, color: '#3B82F6' },
                  { label: 'Platform Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={18} />, color: '#10B981' },
                  { label: 'Commission Earned', value: `₹${(stats.totalCommission || 0).toLocaleString()}`, icon: <DollarSign size={18} />, color: '#F59E0B' },
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
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setSelectedOrder(null); }}>
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
                  {/* Order List */}
                  <div>
                    {orders.length === 0 ? (
                      <div style={{ background: '#111', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)', padding: '80px 20px', textAlign: 'center' }}>
                        <ShoppingCart size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>No orders found in this category.</p>
                      </div>
                    ) : (
                      <div style={{ background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              {['Order', 'Supplier', 'Product', 'Total', 'Status'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((o) => (
                              <tr key={o.id} className={`order-row ${selectedOrder?.id === o.id ? 'selected' : ''}`} onClick={() => loadDetail(o.id)}>
                                <td style={{ padding: '14px 16px' }}>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: 'white', fontFamily: 'var(--font-num)' }}>#{o.id?.substring(0, 8)}</p>
                                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'white' }}>{o.supplier?.companyName || '—'}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{o.product?.name || '—'}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#34D399', fontFamily: 'var(--font-num)' }}>₹{o.totalAmount?.toLocaleString()}</td>
                                <td style={{ padding: '14px 16px' }}><OrderStatusBadge status={o.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Detail Panel */}
                  <div>
                    {detailLoading ? (
                      <div style={{ background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '60px 20px', textAlign: 'center', position: 'sticky', top: 32 }}>
                        <div style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      </div>
                    ) : selectedOrder ? (
                      <div style={{ background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 24, position: 'sticky', top: 32 }}>
                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>Order #{selectedOrder.id?.substring(0, 8)}</h3>
                          <OrderStatusBadge status={selectedOrder.status} />
                        </div>

                        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                              ['Product', selectedOrder.product?.name],
                              ['Category', selectedOrder.product?.category],
                              ['Quantity', selectedOrder.quantity],
                              ['Unit Price', `₹${selectedOrder.product?.price?.toLocaleString()}`],
                              ['Total Amount', `₹${selectedOrder.totalAmount?.toLocaleString()}`],
                              ['Commission', `₹${selectedOrder.commissionPaid?.toLocaleString()}`],
                            ].map(([l, v]) => (
                              <div key={l as string}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{l}</p>
                                <p style={{ fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 600, color: 'white' }}>{v || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Supplier Info</p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{selectedOrder.supplier?.companyName}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{selectedOrder.supplier?.user?.email}</p>
                          {selectedOrder.supplier?.city && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>📍 {selectedOrder.supplier.city}</p>}
                        </div>

                        <div style={{ marginTop: 20 }}>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.05)', height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', position: 'sticky', top: 32 }}>
                        <div>
                          <Eye size={32} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
                          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Select an order to view details.</p>
                        </div>
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
