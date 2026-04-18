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

// Shared Components
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';

/* ── Metric Card ── */
function MetricCard({ title, value, subtitle, icon: Icon, trend, accent = 'var(--primary)' }: any) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 16, border: `1px solid var(--border)`, padding: '24px 22px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}15`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={accent} />
        </div>
        {trend && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: trend.startsWith('+') ? '#10B981' : '#EF4444', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8 }}>{trend}</span>
        )}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{title}</p>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
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

  const load = useCallback(async () => {
    try {
      const statsData = await fetchWithAuth('/admin/stats').catch(() => ({}));
      setStats(statsData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar active="super_admin_home" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DashboardHeader 
          centerText="SUPER ADMIN" 
          leftContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusDot color="#10B981" />
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>Global Systems Optimal</span>
            </div>
          }
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto' }} className="animate-fade-up">
            
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ height: 1, width: 40, background: 'var(--primary)' }} />
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)' }}>Platform Governance</span>
              </div>
              <h1 style={{ fontSize: 42, color: 'white', letterSpacing: '-0.04em', lineHeight: 1, fontStyle: 'italic' }}>Command Center</h1>
              <p style={{ fontSize: 15, color: 'var(--text-dim)', marginTop: 12, maxWidth: 600, lineHeight: 1.6 }}>High-fidelity oversight of market health and platform orchestration.</p>
            </div>

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
              <MetricCard title="Market Presence" value={stats?.totalSuppliers ?? '--'} icon={Users} trend="+12.4%" subtitle="Active business entities" />
              <MetricCard title="Awaiting Verdict" value={stats?.pendingSuppliers ?? '--'} icon={AlertCircle} accent="#F59E0B" subtitle="Suppliers in validation" subtitleColor="rgba(245,158,11,0.4)"/>
              <MetricCard title="Product Ledger" value={stats?.totalProducts ?? '--'} icon={Package} trend="+4.2%" accent="#8B5CF6" subtitle="Verified SKU inventory" />
              <MetricCard title="Digital Footprint" value={stats?.totalUsers ?? '--'} icon={Globe} accent="#06B6D4" subtitle="Authenticated users" />
            </div>

            {/* SYSTEM HEALTH + CONTROLS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 48 }}>
              <div style={{ background: 'var(--bg-surface)', borderRadius: 20, border: `1px solid var(--border)`, padding: '32px' }}>
                  <h2 style={{ fontSize: 24, color: 'white', marginBottom: 24 }}>System Integrity</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    {[
                      { name: 'Core Engine', latency: '14ms', status: 'ONLINE', color: '#10B981' },
                      { name: 'Global DB', latency: '4ms', status: 'ONLINE', color: '#10B981' },
                      { name: 'Assets (S3)', latency: '32ms', status: 'ONLINE', color: '#10B981' },
                      { name: 'Notification Hub', latency: '190ms', status: 'DEGRADED', color: '#FBBF24' },
                    ].map(svc => (
                      <div key={svc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid var(--border)` }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{svc.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{svc.latency}</p>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: svc.color }}>{svc.status}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <div style={{ background: `linear-gradient(135deg, #121212 0%, #050505 100%)`, borderRadius: 20, border: `1px solid var(--border)`, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <Shield size={32} color="var(--primary)" style={{ marginBottom: 24 }} />
                    <h2 style={{ fontSize: 20, color: 'white', marginBottom: 12 }}>Platform Authority</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>Authorized session only. All modifications comply with platform policies.</p>
                  </div>
                  <Link href="/dashboard/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', borderRadius: 12, background: 'var(--primary)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center', justifyContent: 'center' }}>
                    Admin Portal <ArrowRight size={14} />
                  </Link>
              </div>
            </div>

            {/* GLOBAL POLICIES SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 20, border: `1px solid var(--border)`, padding: '32px' }}>
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 28, color: 'white', marginBottom: 8 }}>Infrastructure Orchestration</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>Toggle system-wide behaviors and platform entry points.</p>
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
                          <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid var(--border)` }}>
                              <div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>{t.label}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{t.desc}</p>
                              </div>
                              <button onClick={() => setPlatformToggles(prev => ({ ...prev, [t.key]: !val }))} style={{ width: 44, height: 24, borderRadius: 22, background: val ? (t.danger ? '#EF4444' : 'var(--primary)') : 'rgba(255,255,255,0.1)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: val ? 23 : 3, transition: 'all 0.2s' }} />
                              </button>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* DANGER ZONE */}
                <div style={{ background: 'rgba(239, 68, 68, 0.03)', borderRadius: 20, border: `1px solid rgba(239, 68, 68, 0.1)`, padding: '32px' }}>
                  <h2 style={{ fontSize: 24, color: '#EF4444', marginBottom: 24 }}>System Purge & Reset</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      {[
                        { name: 'Invalidate All Sessions', icon: Lock },
                        { name: 'Flush System Cache', icon: RefreshCw },
                        { name: 'Reset DNS Routing', icon: Globe },
                      ].map(action => (
                        <button onClick={() => handleAction(action.name)} key={action.name} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px', borderRadius: 16, background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.08)', cursor: 'pointer', textAlign: 'left' }}>
                          <action.icon size={20} color="#EF4444" />
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{action.name}</p>
                        </button>
                      ))}
                  </div>
                </div>
            </div>

          </div>
        </div>
      </div>
      <PortalNotification message={notification.msg} type={notification.type} visible={notification.show} onHide={() => setNotification(p => ({ ...p, show: false }))} />
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <Suspense fallback={null}>
      <SuperAdminContent />
    </Suspense>
  );
}
