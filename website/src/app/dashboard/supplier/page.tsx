'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import {
  Package, Clock, Truck, Bell, Check, X, AlertCircle, Zap,
  ArrowRight, CheckCircle2, Navigation, ShoppingBag,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
}

interface NotificationItem {
  id: string;
  type: Toast['type'];
  message: string;
  time: Date;
}

interface DashboardStats {
  productStats: { total: number; live: number; pending: number };
  salesStats: { totalOrders: number; totalRevenue: number };
  notifications: Array<{ id: string; title: string; message: string; isRead: boolean; createdAt: string }>;
  recentOrders: Array<{ id: string; status: string; totalAmount: number; quantity: number; createdAt: string; product: { name: string } }>;
  commission: number;
}

/* ── Shared Components ── */
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';

/* ══════════════════════════════════════════════
   STORE TOGGLE
══════════════════════════════════════════════ */
function StoreToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 10px', borderRadius: 10, background: open ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${open ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
      <div style={{ width: 34, height: 18, borderRadius: 999, position: 'relative', background: open ? '#34D399' : 'rgba(255,255,255,0.1)', boxShadow: open ? '0 0 10px rgba(52,211,153,0.5)' : 'none', transition: 'all 0.3s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: open ? 18 : 3, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left 0.3s cubic-bezier(.22,1,.36,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: open ? '#34D399' : '#F87171' }}>
        {open ? 'Open' : 'Closed'}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 12, minWidth: 280,
          background: 'rgba(18,18,26,0.97)',
          border: `1px solid ${t.type === 'success' ? 'rgba(52,211,153,0.25)' : t.type === 'warning' ? 'rgba(251,191,36,0.25)' : 'rgba(37,99,235,0.25)'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'toastIn 0.4s cubic-bezier(.22,1,.36,1)', cursor: 'pointer', pointerEvents: 'auto' as const,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'success' ? 'rgba(52,211,153,0.12)' : t.type === 'warning' ? 'rgba(251,191,36,0.12)' : 'rgba(37,99,235,0.12)' }}>
            {t.type === 'success' ? <CheckCircle2 size={14} color="#34D399" /> : t.type === 'warning' ? <AlertCircle size={14} color="#FBBF24" /> : <Bell size={14} color="#60A5FA" />}
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{t.message}</p>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   NOTIFICATION PANEL
══════════════════════════════════════════════ */
function NotificationPanel({
  visible,
  onClose,
  notifications,
  onMarkRead,
}: {
  visible: boolean;
  onClose: () => void;
  notifications: DashboardStats['notifications'];
  onMarkRead: (id: string) => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.4s cubic-bezier(.22,1,.36,1)'
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: visible ? 0 : -380, bottom: 0, width: 380,
        zIndex: 10001, background: '#121212', borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        transition: 'right 0.5s cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'white' }}>Notifications</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>Platform activity & updates</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bell size={20} color="rgba(255,255,255,0.15)" />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>No notifications yet.</p>
            </div>
          ) : (
            [...notifications].reverse().map((n) => (
              <div key={n.id} onClick={() => !n.isRead && onMarkRead(n.id)} style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 14, cursor: n.isRead ? 'default' : 'pointer', background: n.isRead ? 'transparent' : 'rgba(37,99,235,0.03)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={14} color="#60A5FA" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: n.isRead ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.85)', lineHeight: 1.4, marginBottom: 2 }}>{n.title}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontFamily: 'var(--font-num)', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 5, fontWeight: 600 }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <Link href="/dashboard/supplier/notifications" onClick={onClose} style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#60A5FA', textDecoration: 'none' }}>
            View all notifications →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function SupplierDashboard() {
  const { user } = useAuth();
  const [storeOpen, setStoreOpen] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    const id = String(++toastIdRef.current);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  // Load real dashboard data from backend
  useEffect(() => {
    fetchWithAuth('/supplier/dashboard')
      .then((data: any) => setStats(data))
      .catch(() => pushToast('warning', 'Could not load dashboard data'))
      .finally(() => setLoading(false));
  }, [pushToast]);

  const handleMarkRead = useCallback(async (notifId: string) => {
    try {
      await fetchWithAuth(`/supplier/notifications/${notifId}/read`, { method: 'PATCH' });
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === notifId ? { ...n, isRead: true } : n
          ),
        };
      });
    } catch {
      // Non-critical — ignore
    }
  }, []);

  const unreadCount = stats?.notifications.filter(n => !n.isRead).length ?? 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        @keyframes toastIn   { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      <NotificationPanel
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={stats?.notifications ?? []}
        onMarkRead={handleMarkRead}
      />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar active="dashboard" />

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
          filter: showNotifications ? 'blur(8px)' : 'none',
          transition: 'filter 0.4s cubic-bezier(.22,1,.36,1)'
        }}>
          <DashboardHeader
            centerText="SUPPLIER PORTAL"
            onNotificationClick={() => setShowNotifications(true)}
            notificationCount={unreadCount}
            leftContent={
              <StoreToggle open={storeOpen} onToggle={() => {
                const next = !storeOpen;
                setStoreOpen(next);
                pushToast(next ? 'success' : 'warning', next ? 'Store is now Open for orders.' : 'Store is Closed — no new orders accepted.');
              }} />
            }
          />

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>
                {user?.companyName || 'Supplier Dashboard'}
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
                Manage your products, orders, and store operations.
              </p>
            </div>

            {/* STAT CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
              {[
                { label: 'Live Products', value: stats?.productStats.live ?? 0, icon: <Package size={20} />, color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)', note: 'Active in catalog' },
                { label: 'Pending Approval', value: stats?.productStats.pending ?? 0, icon: <Clock size={20} />, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', note: 'Under admin review' },
                { label: 'Total Orders', value: stats?.salesStats.totalOrders ?? 0, icon: <ShoppingBag size={20} />, color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)', note: `₹${(stats?.salesStats.totalRevenue ?? 0).toLocaleString()} revenue` },
              ].map(card => (
                <div key={card.label} style={{ background: '#1E1E1E', borderRadius: 14, border: `1px solid ${card.border}`, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>{card.icon}</div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)', marginBottom: 5 }}>{card.label}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-num)', fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1 }}>{card.value}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: card.color }}>{card.note}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CONTENT GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

              {/* ORDERS SECTION — placeholder until orders API is fully wired */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white' }}>Recent Orders</h2>
                  {!storeOpen && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#F87171' }}>Store closed</span>
                    </div>
                  )}
                </div>

                <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                  {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                      <CheckCircle2 size={36} color="rgba(52,211,153,0.35)" style={{ margin: '0 auto 14px' }} />
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.28)' }}>No orders yet. They will appear here once customers start buying.</p>
                    </div>
                  ) : (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                            <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 20px' }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{order.product.name}</p>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                                  background: order.status === 'DELIVERED' ? 'rgba(52,211,153,0.1)' : 'rgba(37,99,235,0.1)',
                                  color: order.status === 'DELIVERED' ? '#34D399' : '#60A5FA'
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'var(--font-num)' }}>₹{order.totalAmount.toLocaleString()}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Commission info */}
                <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Platform Commission</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-num)', fontSize: 32, fontWeight: 700, color: '#60A5FA' }}>{stats?.commission ?? 10}%</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>per transaction</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, #1E1E1E 70%)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 14, padding: '20px' }}>
                  <p style={{ fontFamily: 'var(--font-num)', fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 6 }}>Product Catalog</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.65, marginBottom: 14 }}>
                    {stats && stats.productStats.total === 0
                      ? 'You have no products yet. Add your first product to get started.'
                      : `${stats?.productStats.total ?? 0} products · ${stats?.productStats.live ?? 0} live`}
                  </p>
                  <Link href="/dashboard/supplier/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'white', color: '#141414', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                    Manage Products <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
