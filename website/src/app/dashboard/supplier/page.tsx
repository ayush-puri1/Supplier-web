'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Package, Plus, Clock, AlertTriangle, Info, ArrowRight } from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, statsData, productsData] = await Promise.all([
          fetchWithAuth('/supplier/me'),
          fetchWithAuth('/supplier/dashboard').catch(() => null),
          fetchWithAuth('/products').catch(() => []),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setProducts(Array.isArray(productsData) ? productsData.slice(0, 5) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const status = profile?.status;

  // DRAFT → redirect to onboarding
  if (status === 'DRAFT') {
    router.push('/dashboard/supplier/onboarding');
    return null;
  }

  // SUBMITTED / UNDER_REVIEW → Pending screen
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center max-w-md animate-fade-in-up">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              status === 'UNDER_REVIEW' ? 'bg-amber-100' : 'bg-zinc-100'
            }`}>
              <Clock className={`w-10 h-10 ${status === 'UNDER_REVIEW' ? 'text-amber-500' : 'text-zinc-400'}`} />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1117] mb-3">
              {status === 'UNDER_REVIEW' ? 'An admin is reviewing your application' : 'Application submitted, awaiting review'}
            </h1>
            <p className="text-sm text-[#6B7280] mb-6">
              Your supplier profile has been submitted and is currently being reviewed by our team. We&apos;ll notify you once the review is complete.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-left">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Usually takes 24-48 business hours. You can safely log out and check back later.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // REJECTED → Rejection notice
  if (status === 'REJECTED') {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="max-w-md animate-fade-in-up">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-red-700 text-center mb-3">Application Rejected</h1>
              {profile?.rejectionReason && (
                <div className="bg-white/60 rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold uppercase text-red-500 tracking-wider mb-1">Reason</p>
                  <p className="text-sm text-red-700 italic">&ldquo;{profile.rejectionReason}&rdquo;</p>
                </div>
              )}
              <button
                onClick={() => router.push('/dashboard/supplier/profile')}
                className="w-full py-3 rounded-full bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all"
              >
                Edit Profile & Resubmit
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // VERIFIED → Full Dashboard
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8 animate-fade-in-up">
        {/* Welcome */}
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">
            Welcome back, {profile?.companyName}
          </h1>
          <p className="text-sm text-[#6B7280]">Here&apos;s an overview of your supplier account.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Products" value={stats?.productStats?.total || 0} icon={<Package className="w-5 h-5" />} />
          <StatCard label="Live Products" value={stats?.productStats?.live || 0} valueColor="text-emerald-600" icon={<Package className="w-5 h-5" />} />
          <StatCard label="Pending Approval" value={stats?.productStats?.pending || 0} valueColor="text-amber-600" icon={<Clock className="w-5 h-5" />} />
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#0F1117]">Recent Products</h2>
            <Link href="/dashboard/supplier/products/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D9373] text-white text-xs font-semibold hover:bg-[#0A7A61] transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Package className="w-12 h-12" />}
                title="No products yet"
                subtitle="Start by adding your first product to the catalog."
                action={
                  <Link href="/dashboard/supplier/products/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:border-[#0D9373] hover:text-[#0D9373] transition-all">
                    Add Product
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#6B7280]">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/50">
                  {products.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#0F1117]">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{p.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold">₹{p.price?.toLocaleString() || '—'}</td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-[#E5E7EB]">
                <Link href="/dashboard/supplier/products" className="text-xs font-semibold text-[#0D9373] hover:underline inline-flex items-center gap-1">
                  View all products <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
