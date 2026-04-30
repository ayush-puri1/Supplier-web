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
import StatusBadge from '@/components/StatusBadge';
import ActionModal from '@/components/ActionModal';

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
  const [pendingSuppliers, setPendingSuppliers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [platformToggles, setPlatformToggles] = useState({
    maintenanceMode: false,
    autoApproveSuppliers: false,
    registrationsOpen: true,
  });
  const [notification, setNotification] = useState<{msg:string, show:boolean, type:string}>({ msg: '', show: false, type: 'success' });
  // Inline rejection modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; entity: 'supplier' | 'product' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Invalidate sessions modal
  const [invalidateModal, setInvalidateModal] = useState(false);

  const triggerNotify = (msg: string, type = 'success') => setNotification({ msg, type, show: true });

  const load = useCallback(async () => {
    try {
      const [statsData, pendingSup, pendingProd, healthData, configData] = await Promise.all([
        fetchWithAuth('/admin/stats'),
        fetchWithAuth('/admin/suppliers/pending').catch(() => []),
        fetchWithAuth('/admin/products?status=PENDING_APPROVAL').catch(() => []),
        fetchWithAuth('/admin/health').catch(() => null),
        fetchWithAuth('/admin/config').catch(() => null),
      ]);
      setStats(statsData);
      setPendingSuppliers(Array.isArray(pendingSup) ? pendingSup.slice(0, 5) : (pendingSup?.items ?? []).slice(0, 5));
      setPendingProducts(Array.isArray(pendingProd) ? pendingProd.slice(0, 5) : (pendingProd?.items ?? []).slice(0, 5));
      setHealth(healthData);
      if (configData) {
        setPlatformToggles({
          maintenanceMode: configData.maintenanceMode ?? false,
          autoApproveSuppliers: configData.autoApproveSuppliers ?? false,
          registrationsOpen: configData.registrationsOpen ?? true,
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    setPlatformToggles(prev => ({ ...prev, [key]: value }));
    setConfigLoading(true);
    try {
      await fetchWithAuth('/admin/config', { method: 'PATCH', body: JSON.stringify({ [key]: value }) });
      triggerNotify(`${key.replace(/([A-Z])/g, ' $1')} updated.`);
    } catch (err: any) {
      // Revert on failure
      setPlatformToggles(prev => ({ ...prev, [key]: !value }));
      triggerNotify(err?.response?.data?.message || 'Failed to update config', 'error');
    } finally { setConfigLoading(false); }
  };

  const handleInvalidateSessions = async () => {
    setInvalidateModal(false);
    try {
      triggerNotify('Invalidating all sessions...', 'success');
      const result = await fetchWithAuth('/admin/sessions/invalidate-all', { method: 'POST' });
      triggerNotify(`Done. ${result?.invalidated ?? 0} sessions terminated.`);
    } catch (err: any) {
      triggerNotify(err?.response?.data?.message || 'Failed to invalidate sessions', 'error');
    }
  };

  const handleSupplierAction = async (id: string, status: string, reason?: string) => {
    if (status === 'REJECTED' && !reason) {
      setRejectModal({ open: true, id, entity: 'supplier' });
      setRejectReason('');
      return;
    }
    try {
      triggerNotify(`Processing...`, 'success');
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason: reason || '' }) });
      setPendingSuppliers(prev => prev.filter(s => s.id !== id));
      triggerNotify(`Supplier ${status.toLowerCase()} successfully.`);
    } catch (err: any) { triggerNotify(err?.response?.data?.message || 'Action failed', 'error'); }
  };

  const handleProductAction = async (id: string, status: string, reason?: string) => {
    if (status === 'REJECTED' && !reason) {
      setRejectModal({ open: true, id, entity: 'product' });
      setRejectReason('');
      return;
    }
    try {
      triggerNotify(`Processing...`, 'success');
      await fetchWithAuth(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason: reason || '' }) });
      setPendingProducts(prev => prev.filter(p => p.id !== id));
      triggerNotify(`Product ${status.toLowerCase()} successfully.`);
    } catch (err: any) { triggerNotify(err?.response?.data?.message || 'Action failed', 'error'); }
  };

  const handleConfirmReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    const { id, entity } = rejectModal;
    setRejectModal(null);
    if (entity === 'supplier') await handleSupplierAction(id, 'REJECTED', rejectReason.trim());
    else await handleProductAction(id, 'REJECTED', rejectReason.trim());
  };

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
        {/* ─── REJECTION MODAL ─── */}
        {rejectModal?.open && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#1A1A1A', borderRadius: 20, border: '1px solid rgba(239,68,68,0.2)', padding: 32, maxWidth: 420, width: '90%' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>Reject {rejectModal.entity === 'supplier' ? 'Supplier' : 'Product'}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Provide a clear reason. The supplier will be notified by email.</p>
              <textarea autoFocus value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Incomplete documentation..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.3)', color: 'white', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'none', outline: 'none', marginBottom: 20 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleConfirmReject} disabled={!rejectReason.trim()} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#EF4444', border: 'none', color: 'white', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !rejectReason.trim() ? 0.5 : 1 }}>Reject</button>
              </div>
            </div>
          </div>
        )}
        <DashboardHeader 
          centerText="SUPER ADMIN" 
          leftContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusDot color={health?.status === 'OPTIMAL' ? '#10B981' : health?.status === 'DEGRADED' ? '#FBBF24' : '#6B7280'} />
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
                {health ? (health.status === 'OPTIMAL' ? 'All Systems Optimal' : 'System Degraded') : 'Checking systems...'}
              </span>
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

            {/* SYSTEM HEALTH ROW */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ background: 'var(--bg-surface)', borderRadius: 20, border: `1px solid var(--border)`, padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 24, color: 'white' }}>System Health</h2>
                  {health?.checkedAt && (
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>Last checked {new Date(health.checkedAt).toLocaleTimeString()}</span>
                  )}
                </div>
                {health?.services ? (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${health.services.length}, 1fr)`, gap: 16 }}>
                    {health.services.map((svc: any) => {
                      const color = svc.status === 'ONLINE' || svc.status === 'CONFIGURED' ? '#10B981' : svc.status === 'DEGRADED' ? '#FBBF24' : '#EF4444';
                      return (
                        <div key={svc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid var(--border)` }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{svc.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{svc.latency}</p>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 800, color }}>{svc.status}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-dim)', fontSize: 13 }}>Loading health data...</div>
                )}
              </div>
            </div>

            {/* MODERATION QUEUES (MERGED FROM ADMIN OVERVIEW) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
              
              {/* Supplier Verification Queue */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
                  <div>
                    <h2 style={{ fontSize: 18, color: 'white', marginBottom: 4 }}>Supplier Verification</h2>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Entities awaiting platform validation</p>
                  </div>
                  <Link href="/dashboard/admin/suppliers" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  {pendingSuppliers.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CheckCircle size={32} color="rgba(16,185,129,0.2)" style={{ marginBottom: 16 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>All suppliers are currently verified.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {pendingSuppliers.map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 28px' }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{s.companyName}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <StatusBadge status={s.status} />
                                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.user?.email}</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                  <button onClick={() => handleSupplierAction(s.id, 'VERIFIED')} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                                  <button onClick={() => handleSupplierAction(s.id, 'REJECTED')} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
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

              {/* Product Moderation Queue */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
                  <div>
                    <h2 style={{ fontSize: 18, color: 'white', marginBottom: 4 }}>Product Moderation</h2>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>SKUs pending inventory live-status</p>
                  </div>
                  <Link href="/dashboard/admin/products" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  {pendingProducts.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Package size={32} color="rgba(139,92,246,0.2)" style={{ marginBottom: 16 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Moderation queue is empty.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {pendingProducts.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 28px' }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{p.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>₹{p.price?.toLocaleString()}</span>
                                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>by {p.supplier?.companyName}</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                  <button onClick={() => handleProductAction(p.id, 'LIVE')} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                                  <button onClick={() => handleProductAction(p.id, 'REJECTED')} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
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

            {/* GLOBAL POLICIES SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'var(--bg-surface)', borderRadius: 20, border: `1px solid var(--border)`, padding: '32px' }}>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, color: 'white', marginBottom: 8 }}>Platform Configuration</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>Changes are saved instantly to the database.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                  {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Restrict platform access to admins only', danger: true },
                    { key: 'autoApproveSuppliers', label: 'Auto-Approve Suppliers', desc: 'Skip manual review for new supplier submissions', danger: false },
                    { key: 'registrationsOpen', label: 'Registrations Open', desc: 'Allow new suppliers to register on the platform', danger: false },
                  ].map(t => {
                    const val = (platformToggles as any)[t.key];
                    return (
                      <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid var(--border)`, opacity: configLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>{t.label}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{t.desc}</p>
                        </div>
                        <button disabled={configLoading} onClick={() => handleToggle(t.key, !val)} style={{ width: 44, height: 24, borderRadius: 22, background: val ? (t.danger ? '#EF4444' : 'var(--primary)') : 'rgba(255,255,255,0.1)', position: 'relative', border: 'none', cursor: configLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: val ? 23 : 3, transition: 'all 0.2s' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DANGER ZONE */}
              <div style={{ background: 'rgba(239,68,68,0.03)', borderRadius: 20, border: `1px solid rgba(239,68,68,0.1)`, padding: '32px' }}>
                <h2 style={{ fontSize: 24, color: '#EF4444', marginBottom: 8 }}>Danger Zone</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>These actions are irreversible. Use with caution.</p>
                <button onClick={() => setInvalidateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px', borderRadius: 16, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <Lock size={20} color="#EF4444" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>Invalidate All Sessions</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Force-logs out all users platform-wide. Your own session is preserved.</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <PortalNotification message={notification.msg} type={notification.type} visible={notification.show} onHide={() => setNotification(p => ({ ...p, show: false }))} />

      <ActionModal
        isOpen={invalidateModal}
        title="Invalidate All Sessions"
        message="This will log out all users except yourself. This action cannot be undone. Continue?"
        type="confirm"
        danger={true}
        confirmText="Invalidate"
        onConfirm={handleInvalidateSessions}
        onCancel={() => setInvalidateModal(false)}
      />
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
