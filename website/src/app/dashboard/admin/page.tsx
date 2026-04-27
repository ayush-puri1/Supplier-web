'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Users, Clock, Package, AlertCircle, ArrowRight,
  LayoutDashboard, Check, X, Search, Activity, FileText, Bell,
  Shield, CheckCircle2, Navigation, BarChart3, History
} from 'lucide-react';

// Shared Components
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatusBadge from '@/components/StatusBadge';

/* ══════════════════════════════════════════════
   MAIN ADMIN PAGE
   ══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingSuppliers, setPendingSuppliers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, sup, prod] = await Promise.all([
          fetchWithAuth('/admin/stats'),
          fetchWithAuth('/admin/suppliers/pending').catch(() => []),
          fetchWithAuth('/admin/products?status=PENDING_APPROVAL').catch(() => []),
        ]);
        setStats(s);
        setPendingSuppliers(Array.isArray(sup) ? sup.slice(0, 5) : []);
        setPendingProducts(Array.isArray(prod) ? prod.slice(0, 5) : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  const handleSupplierAction = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      rejectionReason = prompt('Provide a rejection reason:') || '';
      if (!rejectionReason) return;
    }
    try {
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) });
      setPendingSuppliers(pendingSuppliers.filter(s => s.id !== id));
    } catch (err: any) { alert(err?.response?.data?.message || 'Action failed'); }
  };

  const handleProductAction = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      rejectionReason = prompt('Provide a rejection reason:') || '';
      if (!rejectionReason) return;
    }
    try {
      await fetchWithAuth(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) });
      setPendingProducts(pendingProducts.filter(p => p.id !== id));
    } catch (err: any) { alert(err?.response?.data?.message || 'Action failed'); }
  };

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
      <Sidebar active="admin_home" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <DashboardHeader showAnalytics={true} />

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Platform Overview</h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Monitor and manage the Delraw marketplace.</p>
          </div>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Total Suppliers', value: stats?.suppliers?.total || 0, icon: <Users size={20} />, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)', note: 'Registered accounts' },
              { label: 'Pending Verification', value: stats?.suppliers?.pending || 0, icon: <Clock size={20} />, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', note: 'Needs review' },
              { label: 'Live Products', value: stats?.products?.live || 0, icon: <Package size={20} />, color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)', note: 'Active inventory' },
              { label: 'Pending Approval', value: stats?.products?.pending || 0, icon: <AlertCircle size={20} />, color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', note: 'Awaiting moderation' },
            ].map(card => (
              <div key={card.label} style={{ background: 'var(--bg-surface)', borderRadius: 14, border: `1px solid ${card.border}`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)' }}>{card.label}</p>
                  <div style={{ color: card.color }}>{card.icon}</div>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-num)', fontSize: 26, fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: 4 }}>{card.value}</p>
                  <p style={{ fontSize: 11, color: card.color }}>{card.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* DATA TABLES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Supplier Verification Queue */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, color: 'white' }}>Supplier Verification</h2>
                <Link href="/dashboard/admin/suppliers" style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              {pendingSuppliers.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center' as const, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <CheckCircle2 size={32} color="rgba(52,211,153,0.3)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No suppliers pending verification.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>Business</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSuppliers.map((s) => (
                      <tr key={s.id} className="admin-table-row">
                        <td style={{ padding: '12px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{s.companyName}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.user?.email}</p>
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <StatusBadge status={s.status} />
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <Link href={`/dashboard/admin/suppliers/${s.id}`} style={{ textDecoration: 'none' }}><button className="action-btn">View</button></Link>
                            <button onClick={() => handleSupplierAction(s.id, 'VERIFIED')} className="action-btn approve">Approve</button>
                            <button onClick={() => handleSupplierAction(s.id, 'REJECTED')} className="action-btn reject">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Product Moderation Queue */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, color: 'white' }}>Product Moderation</h2>
                <Link href="/dashboard/admin/products" style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              {pendingProducts.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center' as const, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <CheckCircle2 size={32} color="rgba(52,211,153,0.3)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No products in the moderation queue.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>Product</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>Supplier</th>
                      <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map((p) => (
                      <tr key={p.id} className="admin-table-row">
                        <td style={{ padding: '12px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{p.name}</p>
                          <p style={{ fontFamily: "var(--font-heading)", fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>₹{p.price?.toLocaleString() || '-'}</p>
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.supplier?.companyName}</p>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button onClick={() => handleProductAction(p.id, 'LIVE')} className="action-btn approve">Approve</button>
                            <button onClick={() => handleProductAction(p.id, 'REJECTED')} className="action-btn reject">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
    );
}
