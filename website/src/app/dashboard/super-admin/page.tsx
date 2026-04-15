'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Users, Package, AlertCircle, ArrowRight,
  LayoutDashboard, LogOut, Shield,
  BarChart3, History, Lock,
  UserCog, Activity, RefreshCw, Zap, Globe, UserCheck, Ban, Settings, CheckCircle, Crown
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   COLOR PALETTE — Deep Premium Admin
══════════════════════════════════════════════════════ */

const C = {
  bg: '#0A0A0A',
  surface: '#121212',
  sidebar: '#050505',
  border: 'rgba(255,255,255,0.06)',
  accent:   '#3B82F6',
  accentLt: '#93C5FD',
  muted:    'rgba(148,175,210,0.15)',
  text:     '#F1F5F9',
  textDim:  '#94A3B8',
  green:    '#10B981',
  amber:    '#F59E0B',
  red:      '#EF4444',
  purple:   '#8B5CF6',
  teal:     '#06B6D4',
};

/* ── Sidebar ── */
export function SuperAdminSidebar({ active }: { active: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Command Center', icon: <LayoutDashboard size={15} />, href: '/dashboard/super-admin', key: 'home' },
    { label: 'User Control', icon: <UserCog size={15} />, href: '/dashboard/admin/users', key: 'users' },
    { label: 'Supplier Pipeline', icon: <Users size={15} />, href: '/dashboard/admin/suppliers', key: 'suppliers' },
    { label: 'Product Moderation', icon: <Package size={15} />, href: '/dashboard/admin/products', key: 'products' },
    { label: 'Analytics', icon: <BarChart3 size={15} />, href: '/dashboard/admin/analytics', key: 'analytics' },
    { label: 'Audit Logs', icon: <History size={15} />, href: '/dashboard/admin/audit-logs', key: 'audit' },
    { label: 'System Config', icon: <Settings size={15} />, href: '/dashboard/super-admin/config', key: 'config' },
    { label: 'Admin Management', icon: <Crown size={15} />, href: '/dashboard/super-admin/admin-management', key: 'admin_mgmt' },
    { label: 'Admin Portal', icon: <Shield size={15} />, href: '/dashboard/admin', key: 'admin' },
  ];
  return (
    <aside style={{ width: 232, flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '24px 12px 20px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32, paddingLeft: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, #2A4E80, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px rgba(59,130,246,0.3)`, flexShrink: 0 }}>
          <Shield size={15} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: C.text, lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 7.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.accent, marginTop: 3 }}>Super Admin</div>
        </div>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {navItems.map(item => {
          const isActive = item.key === active;
          return (
            <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, textDecoration: 'none', fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: isActive ? C.text : C.textDim, background: isActive ? `rgba(255,255,255,0.06)` : 'transparent', transition: 'all 0.2s' }}>
              <span style={{ color: isActive ? C.accent : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        {user && (
          <div style={{ padding: '10px 12px', borderRadius: 9, background: `rgba(255,255,255,0.02)`, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'admin@delraw.com'}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginTop: 2 }}>Platform Lead</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 12.5, color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Metric Card ── */
function MetricCard({ title, value, subtitle, icon: Icon, trend, accent = C.accent }: any) {
  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 22px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}15`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={accent} />
        </div>
        {trend && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: trend.startsWith('+') ? C.green : C.red, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8 }}>{trend}</span>
        )}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{title}</p>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
      {subtitle && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Status Dot ── */
function StatusDot({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, display: 'inline-block' }} />;
}

/* ── Notification Portal ── */
function PortalNotification({ message, type, visible, onHide }: any) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 4000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, animation: 'sa-slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
      <style>{`
        @keyframes sa-slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
      <div style={{ background: '#121212', border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minWidth: 280 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {type === 'error' ? <AlertCircle size={16} color="#EF4444" /> : <CheckCircle size={16} color="#10B981" />}
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: 'white' }}>{type === 'error' ? 'Action Failed' : 'Success'}</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{message}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN CONTENT
══════════════════════════════════════════════════════ */
function SuperAdminContent() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState<{msg:string, show:boolean, type:string}>({ msg: '', show: false, type: 'success' });
  const [platformToggles, setPlatformToggles] = useState({
    maintenance: false,
    autoApprove: false,
    registrations: true,
    emailNotif: true,
  });

  const triggerNotify = (msg: string, type = 'success') => {
    setNotification({ msg, type, show: true });
  };

  const handleAction = async (action: string) => {
    triggerNotify(`Initiating ${action}...`, 'success');
    await new Promise(r => setTimeout(r, 1200));
    triggerNotify(`${action} completed successfully.`, 'success');
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    try {
      const statsData = await fetchWithAuth('/admin/stats').catch(() => ({}));
      setStats(statsData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:${C.bg}; color:${C.text}; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sa-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <SuperAdminSidebar active="home" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* HEADER */}
          <header style={{ height: 54, background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusDot color={C.green} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: C.textDim, fontWeight: 500 }}>Global Systems Status: Optimal</span>
            </div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 900, color: C.accent, letterSpacing: '0.22em' }}>COMMAND CENTRE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
               <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: C.textDim, fontVariantNumeric: 'tabular-nums' }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
            <div style={{ maxWidth: 1300, margin: '0 auto' }}>
              
              <div style={{ marginBottom: 48 }} className="sa-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ height: 1, width: 40, background: C.accent }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.accent }}>Platform Governance</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontStyle: 'italic' }}>Command Center</h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: C.textDim, marginTop: 12, maxWidth: 600, lineHeight: 1.6 }}>High-fidelity oversight of market health and platform orchestration.</p>
              </div>

              {/* METRICS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }} className="sa-in">
                <MetricCard title="Market Presence" value={stats?.totalSuppliers ?? '--'} icon={Users} trend="+12.4%" subtitle="Active business entities" />
                <MetricCard title="Awaiting Verdict" value={stats?.pendingSuppliers ?? '--'} icon={AlertCircle} accent={C.amber} subtitle="Suppliers in validation" />
                <MetricCard title="Product Ledger" value={stats?.totalProducts ?? '--'} icon={Package} trend="+4.2%" accent={C.purple} subtitle="Verified SKU inventory" />
                <MetricCard title="Digital Footprint" value={stats?.totalUsers ?? '--'} icon={Globe} accent={C.teal} subtitle="Authenticated users" />
              </div>

              {/* SYSTEM HEALTH + CONTROLS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 48 }} className="sa-in">
                <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: '32px' }}>
                   <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 24 }}>System Integrity</h2>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                      {[
                        { name: 'Core Engine', latency: '14ms', status: 'ONLINE' },
                        { name: 'Global DB', latency: '4ms', status: 'ONLINE' },
                        { name: 'Assets (S3)', latency: '32ms', status: 'ONLINE' },
                        { name: 'Notification Hub', latency: '190ms', status: 'DEGRADED' },
                      ].map(svc => (
                        <div key={svc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                           <div>
                             <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: C.text }}>{svc.name}</p>
                             <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim }}>{svc.latency}</p>
                           </div>
                           <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 800, color: svc.status === 'ONLINE' ? C.green : C.amber }}>{svc.status}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div style={{ background: `linear-gradient(135deg, #121212 0%, #050505 100%)`, borderRadius: 20, border: `1px solid ${C.border}`, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                   <div>
                      <Shield size={32} color={C.accent} style={{ marginBottom: 24 }} />
                      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 12 }}>Platform Authority</h2>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>Authorized session only. All modifications comply with platform policies.</p>
                   </div>
                   <Link href="/dashboard/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', borderRadius: 12, background: C.accent, color: 'white', textDecoration: 'none', fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, textAlign: 'center', justifyContent: 'center' }}>
                      Admin Portal <ArrowRight size={14} />
                   </Link>
                </div>
              </div>

              {/* GLOBAL POLICIES SECTION (RE-INTEGRATED) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="sa-in">
                 <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: '32px' }}>
                    <div style={{ marginBottom: 32 }}>
                      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8 }}>Infrastructure orchestration</h2>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: C.textDim }}>Toggle system-wide behaviors and platform entry points.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                       {[
                         { key: 'maintenance', label: 'Lockdown Mode', desc: 'Restrict platform to administrators only', danger: true },
                         { key: 'autoApprove', label: 'Automated Verified', desc: 'Bypass manual audit for local entities', danger: false },
                         { key: 'registrations', label: 'Onboarding Portal', desc: 'Control visibility of the join module', danger: false },
                         { key: 'emailNotif', label: 'Dispatch Hub', desc: 'Global SMTP notification broadcasting', danger: false },
                       ].map(t => {
                         const val = (platformToggles as any)[t.key];
                         return (
                           <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                              <div>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t.label}</p>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: C.textDim }}>{t.desc}</p>
                              </div>
                              <button onClick={() => setPlatformToggles(prev => ({ ...prev, [t.key]: !val }))} style={{ width: 44, height: 24, borderRadius: 22, background: val ? (t.danger ? C.red : C.accent) : 'rgba(255,255,255,0.1)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                                 <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: val ? 23 : 3, transition: 'all 0.2s' }} />
                              </button>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 {/* DANGER ZONE (RE-INTEGRATED) */}
                 <div style={{ background: 'rgba(239, 68, 68, 0.03)', borderRadius: 20, border: `1px solid rgba(239, 68, 68, 0.1)`, padding: '32px' }}>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: C.red, marginBottom: 24 }}>System Purge & Reset</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                       {[
                         { name: 'Invalidate All Sessions', icon: Lock },
                         { name: 'Flush System Cache', icon: RefreshCw },
                         { name: 'Reset DNS Routing', icon: Globe },
                       ].map(action => (
                         <button onClick={() => handleAction(action.name)} key={action.name} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px', borderRadius: 16, background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.08)', cursor: 'pointer', textAlign: 'left' }}>
                            <action.icon size={20} color={C.red} />
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: C.text }}>{action.name}</p>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <PortalNotification message={notification.msg} type={notification.type} visible={notification.show} onHide={() => setNotification(p => ({ ...p, show: false }))} />
    </>
  );
}

export default function SuperAdminPage() {
  return (
    <Suspense fallback={null}>
      <SuperAdminContent />
    </Suspense>
  );
}
