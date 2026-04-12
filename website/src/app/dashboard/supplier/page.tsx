'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Package, Clock, Truck, Search, Bell, User, Settings,
  LayoutDashboard, LogOut, Check, X, AlertCircle, Zap,
  ArrowRight, CheckCircle2, MapPin, Navigation,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
type OrderStatus = 'new' | 'accepted' | 'ready' | 'dispatched' | 'delivered' | 'rejected' | 'expired';

interface Order {
  id: string;
  customerName: string;
  items: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  receivedAt: number;
}

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
}

/* ══════════════════════════════════════════════
   DEMO DATA
══════════════════════════════════════════════ */
const DEMO_ORDERS: Order[] = [
  { id: 'ORD-001', customerName: 'Apex Retailers', items: 'Premium Cotton Tee × 3', quantity: 3, price: 3600, status: 'new', receivedAt: Date.now() - 2 * 60 * 1000 },
  { id: 'ORD-002', customerName: 'StyleHouse Co.', items: 'Eco Tote Bag × 12', quantity: 12, price: 5400, status: 'new', receivedAt: Date.now() - 8 * 60 * 1000 },
  { id: 'ORD-003', customerName: 'Metro Fashion', items: 'Leather Wallet × 5', quantity: 5, price: 10500, status: 'accepted', receivedAt: Date.now() - 12 * 60 * 1000 },
];

/* ══════════════════════════════════════════════
   COUNTDOWN HOOK
══════════════════════════════════════════════ */
function useCountdown(startMs: number, limitMs = 15 * 60 * 1000) {
  const [remaining, setRemaining] = useState(() => Math.max(0, limitMs - (Date.now() - startMs)));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, limitMs - (Date.now() - startMs))), 1000);
    return () => clearInterval(id);
  }, [startMs, limitMs]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining > 0 && remaining < 5 * 60 * 1000;
  const expired = remaining === 0;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return { display, isUrgent, expired };
}

/* ══════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════ */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier', active: true },
    { label: 'My Products', icon: <Package size={16} />, href: '/dashboard/supplier/products', active: false },
    { label: 'Business Profile', icon: <User size={16} />, href: '/dashboard/supplier/profile', active: false },
    { label: 'Notifications', icon: <Bell size={16} />, href: '/dashboard/supplier/notifications', active: false },
    { label: 'Settings', icon: <Settings size={16} />, href: '/dashboard/supplier/settings', active: false },
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

/* ══════════════════════════════════════════════
   ORDER TIMER CHIP
══════════════════════════════════════════════ */
function TimerChip({ receivedAt, onExpire }: { receivedAt: number; onExpire: () => void }) {
  const { display, isUrgent, expired } = useCountdown(receivedAt);
  const calledRef = useRef(false);

  useEffect(() => {
    if (expired && !calledRef.current) {
      calledRef.current = true;
      onExpire();
    }
  }, [expired, onExpire]);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 6,
      fontFamily: "'Newsreader', serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      color: expired ? '#F87171' : isUrgent ? '#FBBF24' : 'rgba(255,255,255,0.45)',
      background: expired ? 'rgba(248,113,113,0.1)' : isUrgent ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${expired ? 'rgba(248,113,113,0.25)' : isUrgent ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)'}`,
      animation: isUrgent && !expired ? 'urgentPulse 1.2s ease-in-out infinite' : 'none',
    }}>
      <Clock size={11} />
      {expired ? 'EXPIRED' : display}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ACTION STEP BUTTON  (visible always, disabled when not current)
══════════════════════════════════════════════ */
function StepButton({
  label, icon, done, active, danger, onClick
}: {
  label: string; icon: React.ReactNode;
  done: boolean; active: boolean; danger?: boolean;
  onClick?: () => void;
}) {
  const baseColor = danger ? '#F87171' : done ? 'rgba(255,255,255,0.2)' : active ? '#fff' : 'rgba(255,255,255,0.18)';
  const baseBg = danger
    ? (active ? 'rgba(248,113,113,0.12)' : 'rgba(248,113,113,0.05)')
    : done
      ? 'rgba(52,211,153,0.08)'
      : active
        ? 'rgba(255,255,255,0.07)'
        : 'rgba(255,255,255,0.025)';
  const baseBorder = danger
    ? (active ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.12)')
    : done
      ? 'rgba(52,211,153,0.2)'
      : active
        ? 'rgba(255,255,255,0.14)'
        : 'rgba(255,255,255,0.06)';

  return (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      style={{
        flex: 1, padding: '10px 8px', borderRadius: 10,
        border: `1px solid ${baseBorder}`,
        background: baseBg, color: baseColor,
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
        cursor: active ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
        opacity: !active && !done ? 0.45 : 1,
        position: 'relative' as const,
        overflow: 'hidden',
      }}
    >
      {done
        ? <><Check size={13} color="#34D399" /><span style={{ color: '#34D399' }}>{label}</span></>
        : <>{icon}{label}</>
      }
      {active && !done && (
        <span style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: danger ? '#F87171' : '#3B82F6',
          boxShadow: `0 0 8px ${danger ? 'rgba(248,113,113,0.6)' : 'rgba(59,130,246,0.6)'}`,
          animation: 'shimmer 1.8s ease-in-out infinite',
        }} />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════
   ORDER CARD  — full state machine, always visible
══════════════════════════════════════════════ */
function OrderCard({ order, onAction }: { order: Order; onAction: (id: string, next: OrderStatus) => void }) {
  const isNew = order.status === 'new';

  /* completion states — dispatched means supplier's job is done */
  const isCompleted = ['dispatched', 'delivered', 'rejected', 'expired'].includes(order.status);

  /* Step flags */
  const acceptedDone = ['accepted', 'ready', 'dispatched', 'delivered'].includes(order.status);
  const readyDone = ['ready', 'dispatched', 'delivered'].includes(order.status);
  const dispatchedDone = ['dispatched', 'delivered'].includes(order.status);

  const acceptActive = order.status === 'new';
  const readyActive = order.status === 'accepted';
  const dispatchActive = order.status === 'ready';

  const statusColors: Record<OrderStatus, { label: string; dot: string; bg: string; color: string }> = {
    new: { label: 'New Order', dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)', color: '#60A5FA' },
    accepted: { label: 'Accepted', dot: '#34D399', bg: 'rgba(52,211,153,0.1)', color: '#34D399' },
    ready: { label: 'Ready', dot: '#FBBF24', bg: 'rgba(251,191,36,0.1)', color: '#FBBF24' },
    dispatched: { label: 'On the Way', dot: '#A78BFA', bg: 'rgba(167,139,250,0.1)', color: '#A78BFA' },
    delivered: { label: 'Delivered', dot: '#34D399', bg: 'rgba(52,211,153,0.1)', color: '#34D399' },
    rejected: { label: 'Rejected', dot: '#F87171', bg: 'rgba(248,113,113,0.1)', color: '#F87171' },
    expired: { label: 'Expired', dot: '#F87171', bg: 'rgba(248,113,113,0.1)', color: '#F87171' },
  };
  const sc = statusColors[order.status];

  return (
    <div style={{
      background: '#1E1E1E',
      border: `1px solid ${isCompleted ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 16,
      overflow: 'hidden',
      opacity: isCompleted ? 0.6 : 1,
      transition: 'opacity 0.4s, border-color 0.3s',
    }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{order.customerName}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{order.id}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: sc.color, background: sc.bg }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
            {sc.label}
          </span>
          {isNew && (
            <TimerChip
              receivedAt={order.receivedAt}
              onExpire={() => onAction(order.id, 'expired')}
            />
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 600 }}>Items</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{order.items}</p>
        </div>
        <div style={{ textAlign: 'center' as const }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>QTY</p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>{order.quantity}</p>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>Total</p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>₹{order.price.toLocaleString()}</p>
        </div>
      </div>

      {/* ── "ON THE WAY" TRACKER ── */}
      {order.status === 'dispatched' && (
        <div style={{ margin: '0 20px 14px', padding: '12px 16px', borderRadius: 10, background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Navigation size={14} color="#A78BFA" style={{ animation: 'navigate 2s linear infinite' }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.06em' }}>ORDER ON THE WAY</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Awaiting delivery confirmation from buyer</p>
          </div>
        </div>
      )}

      {/* ── ACTION BUTTONS ROW ── */}
      {!isCompleted && (
        <div style={{ padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Step 1: Accept / Reject */}
          <div style={{ display: 'flex', gap: 8 }}>
            <StepButton
              label="Reject"
              icon={<X size={13} />}
              done={false}
              active={acceptActive || false}
              danger
              onClick={() => onAction(order.id, 'rejected')}
            />
            <StepButton
              label="Accept"
              icon={<Check size={13} />}
              done={acceptedDone}
              active={acceptActive}
              onClick={() => onAction(order.id, 'accepted')}
            />
          </div>

          {/* Step 2 + 3: Ready → Dispatch */}
          <div style={{ display: 'flex', gap: 8 }}>
            <StepButton
              label="Ready"
              icon={<Zap size={13} />}
              done={readyDone}
              active={readyActive}
              onClick={() => onAction(order.id, 'ready')}
            />
            <StepButton
              label="Dispatch"
              icon={<Truck size={13} />}
              done={dispatchedDone}
              active={dispatchActive}
              onClick={() => onAction(order.id, 'dispatched')}
            />
          </div>
        </div>
      )}

      {/* ── COMPLETION BANNERS ── */}
      {order.status === 'dispatched' && (
        <div style={{ margin: '0 20px 16px', padding: '12px 16px', borderRadius: 10, background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(167,139,250,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Navigation size={13} color="#A78BFA" style={{ animation: 'navigate 2s linear infinite' }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.06em' }}>DISPATCHED — ON THE WAY</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>Awaiting delivery confirmation from admin</p>
          </div>
        </div>
      )}
      {order.status === 'delivered' && (
        <div style={{ margin: '0 20px 16px', padding: '12px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={15} color="#34D399" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#34D399', fontWeight: 500 }}>Order delivered successfully</span>
        </div>
      )}
      {order.status === 'rejected' && (
        <div style={{ margin: '0 20px 16px', padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <X size={15} color="#F87171" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#F87171', fontWeight: 500 }}>Order rejected</span>
        </div>
      )}
      {order.status === 'expired' && (
        <div style={{ margin: '0 20px 16px', padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={15} color="#F87171" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#F87171', fontWeight: 500 }}>Acceptance window expired — auto rejected</span>
        </div>
      )}
    </div>
  );
}

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
   FLASH
══════════════════════════════════════════════ */
function FlashOverlay({ visible }: { visible: boolean }) {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none', background: 'rgba(37,99,235,0.09)', opacity: visible ? 1 : 0, transition: 'opacity 0.35s' }} />;
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function SupplierDashboard() {
  const [storeOpen, setStoreOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flash, setFlash] = useState(false);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    const id = String(++toastIdRef.current);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  }, []);

  const handleOrderAction = useCallback((id: string, next: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    if (next === 'accepted') { triggerFlash(); pushToast('success', `Order ${id} accepted — prepare for fulfillment.`); }
    else if (next === 'rejected') { pushToast('warning', `Order ${id} has been rejected.`); }
    else if (next === 'ready') { pushToast('info', `Order ${id} marked as ready for pickup.`); }
    else if (next === 'dispatched') { triggerFlash(); pushToast('success', `Order ${id} dispatched — on the way!`); }
    else if (next === 'delivered') { triggerFlash(); pushToast('success', `Order ${id} delivered successfully!`); }
    else if (next === 'expired') { pushToast('warning', `Order ${id} acceptance window expired — auto rejected.`); }
  }, [pushToast, triggerFlash]);

  /* simulate incoming order */
  useEffect(() => {
    const t = setTimeout(() => {
      setOrders(prev => {
        if (prev.some(o => o.id === 'ORD-004')) return prev;
        return [{ id: 'ORD-004', customerName: 'Fabric King Ltd.', items: 'Raw Linen Fabric × 20m', quantity: 20, price: 8000, status: 'new', receivedAt: Date.now() }, ...prev];
      });
      triggerFlash();
      pushToast('info', 'New order received from Fabric King Ltd.!');
    }, 8000);
    return () => clearTimeout(t);
  }, [pushToast, triggerFlash]);

  const pendingCount = orders.filter(o => o.status === 'new').length;
  const inTransitCount = orders.filter(o => o.status === 'dispatched').length;
  const liveProducts = 8;

  const activeOrders = orders.filter(o => ['new', 'accepted', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => ['dispatched', 'delivered', 'rejected', 'expired'].includes(o.status));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        @keyframes toastIn   { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes urgentPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes shimmer   { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes navigate  { 0%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} 100%{transform:rotate(-15deg)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .search-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:white; font-family:var(--font-body); font-size:13px; padding:7px 12px 7px 34px; outline:none; width:200px; transition:all 0.2s; }
        .search-input::placeholder{color:rgba(255,255,255,0.2)}
        .search-input:focus{border-color:rgba(255,255,255,0.14); width:240px}
      `}</style>

      <FlashOverlay visible={flash} />
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StoreToggle open={storeOpen} onToggle={() => {
                const next = !storeOpen;
                setStoreOpen(next);
                pushToast(next ? 'success' : 'warning', next ? 'Store is now Open for orders.' : 'Store is Closed — no new orders accepted.');
              }} />
              <div style={{ position: 'relative' }}>
                <Search size={13} color="rgba(255,255,255,0.28)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="search-input" placeholder="Search orders..." />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/dashboard/supplier/notifications" style={{ position: 'relative', textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <Bell size={14} color="rgba(255,255,255,0.65)" />
                </div>
                {pendingCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#3B82F6', fontSize: 9, fontWeight: 700, color: 'white', fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0A0A0A' }}>{pendingCount}</span>
                )}
              </Link>
              <Link href="/dashboard/supplier/profile" style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 10px rgba(37,99,235,0.45)', textDecoration: 'none' }}>
                <User size={14} color="white" />
              </Link>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Supplier Dashboard</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Manage your orders, inventory, and store operations.</p>
            </div>

            {/* STAT CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
              {[
                { label: 'Pending Orders', value: pendingCount, icon: <Clock size={20} />, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', note: pendingCount > 0 ? 'Need attention' : 'All clear' },
                { label: 'Orders in Transit', value: inTransitCount, icon: <Truck size={20} />, color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)', note: 'Currently dispatched' },
                { label: 'Live Products', value: liveProducts, icon: <Package size={20} />, color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)', note: 'Active in catalog' },
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

            {/* ORDERS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

              {/* ACTION REQUIRED */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white' }}>Action Required</h2>
                  {activeOrders.length > 0 && (
                    <span style={{ minWidth: 22, height: 22, borderRadius: 999, padding: '0 7px', background: '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(37,99,235,0.5)' }}>{activeOrders.length}</span>
                  )}
                  {!storeOpen && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#F87171' }}>Store closed</span>
                    </div>
                  )}
                </div>

                {activeOrders.length === 0 ? (
                  <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '48px 20px', textAlign: 'center' as const }}>
                    <CheckCircle2 size={36} color="rgba(52,211,153,0.35)" style={{ margin: '0 auto 14px' }} />
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.28)' }}>All orders handled — queue is empty.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {activeOrders.map(o => (
                      <OrderCard key={o.id} order={o} onAction={handleOrderAction} />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT PANEL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Completed Orders */}
                <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'white' }}>Completed</h3>
                    {completedOrders.length > 0 && (
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{completedOrders.length} order{completedOrders.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {completedOrders.length === 0 ? (
                    <div style={{ padding: '28px 20px', textAlign: 'center' as const }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No completed orders yet</p>
                    </div>
                  ) : (
                    completedOrders.map((o, i) => {
                      const isDispatched = o.status === 'dispatched';
                      const isDelivered = o.status === 'delivered';
                      const dotColor = isDelivered ? '#34D399' : isDispatched ? '#A78BFA' : '#F87171';
                      const statusLabel = isDelivered ? 'Delivered' : isDispatched ? 'On the Way' : o.status === 'rejected' ? 'Rejected' : 'Expired';
                      return (
                        <div key={o.id} style={{ padding: '13px 20px', borderBottom: i < completedOrders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{o.customerName}</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{o.id} · ₹{o.price.toLocaleString()}</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: dotColor, background: `${dotColor}15` }}>
                              <span style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />
                              {statusLabel}
                            </span>
                            {isDispatched && (
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>Admin confirms delivery</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick tip card */}
                <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, #1E1E1E 70%)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 14, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: -16, right: -16, opacity: 0.05, pointerEvents: 'none' }}>
                    <Zap size={80} strokeWidth={1} color="#60A5FA" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-num)', fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 6 }}>Inventory </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.65, marginBottom: 14 }}>
                    Update your product stock levels to ensure accurate availability for buyers.
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
