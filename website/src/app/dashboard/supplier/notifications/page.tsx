'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, User, Bell, Settings, LogOut,
  Package2, ShieldCheck, ShieldX, Info, Zap,
  Clock,
} from 'lucide-react';

/* ════════ UTILS ════════ */
function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* Map notification type → icon + color */
function notifStyle(type: string): { icon: React.ReactNode; color: string; bg: string } {
  switch (type) {
    case 'PRODUCT_APPROVED':  return { icon: <Package2 size={14} />,    color: '#34D399', bg: 'rgba(52,211,153,0.12)'  };
    case 'PRODUCT_REJECTED':  return { icon: <Package2 size={14} />,    color: '#F87171', bg: 'rgba(248,113,113,0.12)' };
    case 'PROFILE_APPROVED':  return { icon: <ShieldCheck size={14} />, color: '#34D399', bg: 'rgba(52,211,153,0.12)'  };
    case 'PROFILE_REJECTED':  return { icon: <ShieldX size={14} />,     color: '#F87171', bg: 'rgba(248,113,113,0.12)' };
    case 'ORDER_NEW':         return { icon: <Zap size={14} />,         color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  };
    case 'ORDER_DISPATCHED':  return { icon: <Package size={14} />,     color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' };
    default:                  return { icon: <Info size={14} />,         color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  };
  }
}

/* ════════ SIDEBAR ════════ */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: false },
    { label: 'Business Profile', icon: <User size={16} />,            href: '/dashboard/supplier/profile',       active: false },
    { label: 'Notifications',    icon: <Bell size={16} />,            href: '/dashboard/supplier/notifications', active: true  },
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

/* ════════ MAIN PAGE ════════ */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/supplier/notifications')
      .then((data: any) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const DEMO: any[] = [
    { id: 'd1', type: 'PROFILE_APPROVED',  title: 'Profile Approved',    message: 'Your business profile has been verified. You can now list products.',        createdAt: new Date(Date.now() - 1000*3600*2).toISOString() },
    { id: 'd2', type: 'ORDER_NEW',         title: 'New Order Received',  message: 'Order #ORD-2041 received from Textile Hub. 15 min to accept.',              createdAt: new Date(Date.now() - 1000*60*20).toISOString()   },
    { id: 'd3', type: 'PRODUCT_APPROVED',  title: 'Product Live',        message: '"Premium Cotton Tee" is now live in the catalog.',                         createdAt: new Date(Date.now() - 1000*86400).toISOString()   },
    { id: 'd4', type: 'ORDER_DISPATCHED',  title: 'Order Dispatched',    message: 'Order #ORD-1998 has been marked dispatched successfully.',                  createdAt: new Date(Date.now() - 1000*86400*2).toISOString() },
    { id: 'd5', type: 'PRODUCT_REJECTED',  title: 'Product Rejected',    message: '"Synthetic Blend Fabric" was rejected — blurry images. Please re-upload.', createdAt: new Date(Date.now() - 1000*86400*3).toISOString() },
  ];
  const displayList = (notifications.length === 0 && !loading) ? DEMO : notifications;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .anim-up { animation:fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .notif-row { display:flex; gap:14px; padding:16px 20px; cursor:pointer; transition:background 0.15s; border-bottom:1px solid rgba(255,255,255,0.04); }
        .notif-row:last-child { border-bottom:none; }
        .notif-row:hover { background:rgba(255,255,255,0.025); }
        .filter-btn { padding:6px 16px; border-radius:8px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; transition:all 0.2s; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Notifications</span>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>
            <div className="anim-up" style={{ maxWidth: 680, margin: '0 auto' }}>

              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Notifications</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Stay updated on orders, products, and verifications.</p>
              </div>

              {/* Loading */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
                  <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}

              {/* List */}
              {!loading && (
                displayList.length === 0 ? (
                  <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '56px 20px', textAlign: 'center' as const }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Bell size={20} color="rgba(255,255,255,0.2)" />
                    </div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                      No notifications yet
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
                      You'll receive updates on orders, products, and verifications.
                    </p>
                  </div>
                ) : (
                  <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                    {displayList.map((n, i) => {
                      const style = notifStyle(n.type);
                      return (
                        <div
                          key={n.id}
                          className="notif-row"
                        >
                          {/* Icon */}
                          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: style.bg, color: style.color, marginTop: 1 }}>
                            {style.icon}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'white' }}>{n.title}</p>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.22)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} /> {timeAgo(n.createdAt)}
                              </span>
                            </div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>{n.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Footer hint */}
              {!loading && displayList.length > 0 && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.14)', textAlign: 'center' as const, marginTop: 20 }}>
                  Showing {displayList.length} notification{displayList.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
