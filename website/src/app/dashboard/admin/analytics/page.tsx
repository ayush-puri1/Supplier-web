'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';

const SUPPLIER_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-400', SUBMITTED: 'bg-amber-400', UNDER_REVIEW: 'bg-blue-400',
  VERIFIED: 'bg-blue-500', CONDITIONAL: 'bg-orange-400', REJECTED: 'bg-red-400', SUSPENDED: 'bg-zinc-600',
};
const PRODUCT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-400', PENDING_APPROVAL: 'bg-amber-400', LIVE: 'bg-blue-500', REJECTED: 'bg-red-400', DELISTED: 'bg-zinc-600',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/analytics').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Analytics"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" text="Loading analytics..." /></div></DashboardLayout>;

  const summary = data?.summary || {};
  const supplierDist = data?.distributions?.supplier || {};
  const productDist = data?.distributions?.product || {};
  const topSuppliers = data?.topSuppliers || [];

  const supplierTotal = Object.values(supplierDist).reduce((a: number, b: any) => a + (b as number), 0) as number || 1;
  const productTotal = Object.values(productDist).reduce((a: number, b: any) => a + (b as number), 0) as number || 1;

  const stats = [
    { emoji: '👤', label: 'Total Users', value: summary.totalUsers || 0 },
    { emoji: '🏢', label: 'Total Suppliers', value: summary.totalSuppliers || 0 },
    { emoji: '✅', label: 'Active Suppliers', value: summary.activeSuppliers || 0 },
    { emoji: '📦', label: 'Total Products', value: summary.totalProducts || 0 },
    { emoji: '🚀', label: 'Live Products', value: summary.liveProducts || 0 },
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Platform Analytics</h1>
          <p className="text-sm text-[#6B7280]">High-level overview of supplier onboarding and product catalog health.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">{s.emoji}</span>
              <p className="text-3xl font-black text-[#0F1117] mb-1">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Supplier Funnel */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold text-[#0F1117] mb-6">Supplier Funnel</h3>
            <div className="space-y-3">
              {Object.entries(supplierDist).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] w-24 truncate">{status.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-6 bg-[#F9FAFB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SUPPLIER_STATUS_COLORS[status] || 'bg-zinc-400'} transition-all duration-700`}
                      style={{ width: `${Math.max(3, ((count as number) / supplierTotal) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#0F1117] w-8 text-right">{count as number}</span>
                </div>
              ))}
              {Object.keys(supplierDist).length === 0 && <p className="text-sm text-[#9CA3AF] italic text-center py-4">No data</p>}
            </div>
          </div>

          {/* Product Status */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold text-[#0F1117] mb-6">Product Catalog Status</h3>
            <div className="space-y-3">
              {Object.entries(productDist).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] w-28 truncate">{status.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-6 bg-[#F9FAFB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PRODUCT_STATUS_COLORS[status] || 'bg-zinc-400'} transition-all duration-700`}
                      style={{ width: `${Math.max(3, ((count as number) / productTotal) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#0F1117] w-8 text-right">{count as number}</span>
                </div>
              ))}
              {Object.keys(productDist).length === 0 && <p className="text-sm text-[#9CA3AF] italic text-center py-4">No data</p>}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <h3 className="font-semibold text-[#0F1117] mb-6">Top Contributors</h3>
          {topSuppliers.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] italic text-center py-4">No supplier data</p>
          ) : (
            <div className="space-y-3">
              {topSuppliers.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F1117] truncate">{s.companyName}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-[#0F1117]">{s._count?.products || 0}</p>
                    <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Products</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
