'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, User, Bell, Settings, LogOut,
  Package2, ShieldCheck, ShieldX, Info, Zap,
  Clock, Activity, History, ArrowLeft
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

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
  // Normalize types if they come from audit (e.g. USER_LOGIN)
  if (type.includes('USER_') || type.includes('PRODUCT_') || type.includes('ORDER_')) {
      if (type.includes('REJECTED')) return { icon: <ShieldX size={14} />, color: '#F87171', bg: 'rgba(248,113,113,0.12)' };
      if (type.includes('APPROVED')) return { icon: <ShieldCheck size={14} />, color: '#34D399', bg: 'rgba(52,211,153,0.12)' };
      if (type.includes('ORDER')) return { icon: <Zap size={14} />, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' };
  }

  switch (type) {
    case 'AUDIT':             return { icon: <History size={14} />,     color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' };
    case 'PRODUCT_APPROVED':  return { icon: <Package2 size={14} />,    color: '#34D399', bg: 'rgba(52,211,153,0.12)'  };
    case 'PRODUCT_REJECTED':  return { icon: <Package2 size={14} />,    color: '#F87171', bg: 'rgba(248,113,113,0.12)' };
    case 'ORDER_NEW':         return { icon: <Zap size={14} />,         color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  };
    default:                  return { icon: <Activity size={14} />,    color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/supplier/notifications')
      .then((data: any) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        body { background:#0A0A0A; color:white; }
        .anim-up { animation:fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .notif-row { display:flex; gap:16px; padding:20px 24px; cursor:pointer; transition:all 0.2s; border-bottom:1px solid rgba(255,255,255,0.04); }
        .notif-row:hover { background:rgba(255,255,255,0.02); }
        .empty-state { background: #111; border: 1px dashed rgba(255,255,255,0.1); border-radius: 20px; padding: 60px 20px; text-align: center; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
        <Sidebar active="notifications" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 60, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
               <ArrowLeft size={16} /> Back
             </button>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 32px' }}>
            <div className="anim-up" style={{ maxWidth: 720, margin: '0 auto' }}>

              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>Notifications & Activity</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
                    Track all your account movements, order updates, and system logs in one place.
                </p>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
                  <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <Bell size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, color: 'white', fontWeight: 700, marginBottom: 8 }}>All caught up</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 300, margin: '0 auto' }}>
                    When orders come in or your account status changes, they will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
                  {notifications.map((n) => {
                    const style = notifStyle(n.type || 'AUDIT');
                    return (
                      <div key={n.id} className="notif-row">
                        <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: style.bg, color: style.color, border: '1px solid rgba(255,255,255,0.05)' }}>
                          {style.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{n.title}</p>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={11} /> {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{n.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
