'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await fetchWithAuth('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await fetchWithAuth(`/products/${id}`, { method: 'DELETE' }); loadProducts(); } catch (err: any) { alert(err?.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) return <DashboardLayout title="My Products"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="My Products">
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>

            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">My Products</h1>
            <p className="text-sm text-[#6B7280]">Manage your product catalog and track moderation status.</p>
          </div>
          <Link href="/dashboard/supplier/products/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0D9373] text-white text-sm font-semibold hover:bg-[#0A7A61] transition-all hover:shadow-lg hover:shadow-[#0D9373]/20">
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title="No products found"
            subtitle="Start by adding your first product to the catalog."
            action={<Link href="/dashboard/supplier/products/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:border-[#0D9373] hover:text-[#0D9373] transition-all">Add Product</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#0D9373]/30 hover:shadow-lg transition-all duration-300 group">
                {/* Image */}
                <div className="h-48 bg-[#F9FAFB] flex items-center justify-center relative">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-[#D1D5DB]" />
                  )}
                  <div className="absolute top-3 left-3"><StatusBadge status={p.status} /></div>
                  {p.status === 'REJECTED' && p.rejectionReason && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white px-3 py-1.5 text-[10px] font-medium truncate">{p.rejectionReason}</div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-semibold text-[#0F1117] truncate mb-1">{p.name}</h3>
                  <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">{p.description || 'No description'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1117]">₹{p.price?.toLocaleString() || '—'}</span>
                    {p.moq && <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">MOQ: {p.moq}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-[#E5E7EB]">
                  <Link href={`/dashboard/supplier/products/${p.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#0D9373] transition-all">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  {p.status !== 'LIVE' && (
                    <button onClick={() => handleDelete(p.id)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all border-l border-[#E5E7EB]">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
