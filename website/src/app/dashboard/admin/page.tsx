'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Clock, Package, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
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

  if (loading) return <DashboardLayout title="Admin"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" text="Loading dashboard..." /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Admin">
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Platform Overview</h1>
          <p className="text-sm text-[#6B7280]">Monitor and manage the Delraw marketplace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Suppliers" value={stats?.suppliers?.total || 0} subtitle="Registered accounts" icon={<Users className="w-5 h-5" />} />
          <StatCard label="Pending Verification" value={stats?.suppliers?.pending || 0} subtitle="Needs review" valueColor="text-amber-600" icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Live Products" value={stats?.products?.live || 0} subtitle="Active inventory" valueColor="text-emerald-600" icon={<Package className="w-5 h-5" />} />
          <StatCard label="Pending Approval" value={stats?.products?.pending || 0} subtitle="Awaiting moderation" valueColor="text-amber-600" icon={<AlertCircle className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Supplier Verification */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#0F1117]">Supplier Verification</h3>
              <Link href="/dashboard/admin/suppliers" className="text-xs font-semibold text-[#0D9373] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {pendingSuppliers.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9CA3AF] italic">No suppliers pending verification.</div>
            ) : (
              <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase tracking-wider font-bold text-[#6B7280] bg-[#F9FAFB]"><th className="px-6 py-3">Business</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {pendingSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-3"><p className="text-sm font-medium">{s.companyName}</p><p className="text-[10px] text-[#9CA3AF]">{s.user?.email}</p></td>
                      <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <Link href={`/dashboard/admin/suppliers/${s.id}`} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#F9FAFB] text-[#6B7280] hover:bg-[#E5E7EB] transition-colors border border-[#E5E7EB]">View</Link>
                        <button onClick={() => handleSupplierAction(s.id, 'VERIFIED')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Approve</button>
                        <button onClick={() => handleSupplierAction(s.id, 'REJECTED')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Product Moderation */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#0F1117]">Product Moderation</h3>
              <Link href="/dashboard/admin/products" className="text-xs font-semibold text-[#0D9373] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {pendingProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9CA3AF] italic">No products in the moderation queue.</div>
            ) : (
              <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase tracking-wider font-bold text-[#6B7280] bg-[#F9FAFB]"><th className="px-6 py-3">Product</th><th className="px-6 py-3">Supplier</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {pendingProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-3"><p className="text-sm font-medium">{p.name}</p><p className="text-[10px] text-[#9CA3AF]">₹{p.price?.toLocaleString()}</p></td>
                      <td className="px-6 py-3 text-sm text-[#6B7280]">{p.supplier?.companyName}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button onClick={() => handleProductAction(p.id, 'LIVE')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Approve</button>
                        <button onClick={() => handleProductAction(p.id, 'REJECTED')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
