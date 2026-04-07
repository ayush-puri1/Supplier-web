'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Package } from 'lucide-react';

const STATUS_TABS = ['ALL', 'PENDING_APPROVAL', 'LIVE', 'REJECTED', 'DELISTED', 'DRAFT'] as const;
const TRANSITION_MAP: Record<string, { label: string; status: string; color: string }[]> = {
  PENDING_APPROVAL: [{ label: '✅ Approve (Go Live)', status: 'LIVE', color: 'bg-emerald-500 hover:bg-emerald-600' }, { label: '❌ Reject', status: 'REJECTED', color: 'bg-red-500 hover:bg-red-600' }],
  LIVE: [{ label: '🚫 Delist', status: 'DELISTED', color: 'bg-zinc-700 hover:bg-zinc-800' }],
  DELISTED: [{ label: '🔄 Re-list', status: 'LIVE', color: 'bg-emerald-500 hover:bg-emerald-600' }],
  REJECTED: [{ label: '🔄 Re-submit', status: 'PENDING_APPROVAL', color: 'bg-amber-500 hover:bg-amber-600' }],
  DRAFT: [],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProducts = async () => {
    try { const url = activeTab === 'ALL' ? '/admin/products' : `/admin/products?status=${activeTab}`; const data = await fetchWithAuth(url); setProducts(Array.isArray(data) ? data : []); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); loadProducts(); }, [activeTab]);

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    try { const data = await fetchWithAuth(`/admin/products/${id}`); setSelected(data); } catch (err) { console.error(err); } finally { setDetailLoading(false); }
  };

  const handleUpdate = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') { rejectionReason = prompt('Rejection reason:') || ''; if (!rejectionReason) return; }
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) }); await loadProducts(); await loadDetail(id); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); } finally { setActionLoading(false); }
  };

  return (
    <DashboardLayout title="Products">
      <div className="space-y-6 animate-fade-in-up">
        <div><h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Product Moderation</h1><p className="text-sm text-[#6B7280]">Review submitted products and ensure marketplace quality.</p></div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(tab => (<button key={tab} onClick={() => { setActiveTab(tab); setSelected(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === tab ? 'bg-[#0D9373] text-white border-[#0D9373] shadow-lg shadow-[#0D9373]/20' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>{tab.replace(/_/g, ' ')}</button>))}
        </div>

        {loading ? <div className="text-center py-20"><LoadingSpinner /></div> : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              {products.length === 0 ? (<div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-sm text-[#9CA3AF] italic">No products found.</div>) : (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                  <table className="w-full text-left">
                    <thead><tr className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#6B7280]"><th className="px-6 py-4">Product</th><th className="px-6 py-4">Supplier</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th></tr></thead>
                    <tbody className="divide-y divide-[#E5E7EB]/50">
                      {products.map(p => (
                        <tr key={p.id} onClick={() => loadDetail(p.id)} className={`hover:bg-[#F9FAFB] transition-colors cursor-pointer ${selected?.id === p.id ? 'bg-[#ECFDF5]/50' : ''}`}>
                          <td className="px-6 py-4"><div className="flex items-center gap-3">{p.images?.[0] ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB]" /> : <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center"><Package className="w-5 h-5 text-[#D1D5DB]" /></div>}<div><p className="text-sm font-semibold">{p.name}</p><p className="text-[10px] text-[#9CA3AF]">₹{p.price?.toLocaleString() ?? '—'}</p></div></div></td>
                          <td className="px-6 py-4 text-sm">{p.supplier?.companyName}</td>
                          <td className="px-6 py-4 text-xs text-[#6B7280]">{p.category}</td>
                          <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              {detailLoading ? (<div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center animate-pulse"><LoadingSpinner text="Loading..." /></div>) : selected ? (
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] sticky top-24 animate-scale-in space-y-6">
                  {selected.images?.length > 0 && (<div className="flex gap-2 overflow-x-auto pb-2">{selected.images.map((img: string, i: number) => (<img key={i} src={img} alt="" className="h-24 w-24 rounded-xl object-cover border border-[#E5E7EB] flex-shrink-0" />))}</div>)}
                  <div><h3 className="text-xl font-bold">{selected.name}</h3><p className="text-xs text-[#9CA3AF] mt-1">{selected.supplier?.companyName}</p><div className="mt-2"><StatusBadge status={selected.status} size="md" /></div>{selected.status === 'REJECTED' && selected.rejectionReason && (<div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200"><p className="text-[10px] font-bold uppercase text-red-500 mb-1">Rejection Reason</p><p className="text-sm text-red-700 italic">&ldquo;{selected.rejectionReason}&rdquo;</p></div>)}</div>
                  {selected.description && (<section><p className="text-xs font-bold uppercase text-[#6B7280] mb-2 tracking-widest">Description</p><p className="text-sm text-[#6B7280] leading-relaxed">{selected.description}</p></section>)}
                  <section className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"><div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">{[['Price', `₹${selected.price?.toLocaleString() ?? '—'}`], ['Unit', selected.unit], ['MOQ', selected.moq], ['Lead Time', `${selected.leadTime}d`], ['Category', selected.category]].map(([l, v]) => (<div key={l as string}><p className="text-[10px] opacity-50 font-bold uppercase">{l}</p><p className="font-medium">{v || 'N/A'}</p></div>))}</div></section>
                  {selected.variants?.length > 0 && (<section><p className="text-xs font-bold uppercase text-[#6B7280] mb-2 tracking-widest">Variants ({selected.variants.length})</p><div className="space-y-2">{selected.variants.map((v: any) => (<div key={v.id} className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]/50 flex justify-between text-xs"><div><span className="font-bold">{v.name}</span>{v.sku && <span className="ml-2 text-[#9CA3AF]">SKU: {v.sku}</span>}</div><div className="text-right">{v.price && <span className="font-bold">₹{v.price.toLocaleString()}</span>}<span className="ml-2 text-[#9CA3AF]">Stock: {v.stock}</span></div></div>))}</div></section>)}
                  <section><p className="text-xs font-bold uppercase text-[#6B7280] mb-3 tracking-widest">Actions</p><div className="flex flex-wrap gap-2">{(TRANSITION_MAP[selected.status] || []).map(t => (<button key={t.status} disabled={actionLoading} onClick={() => handleUpdate(selected.id, t.status)} className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 ${t.color}`}>{t.label}</button>))}{(TRANSITION_MAP[selected.status] || []).length === 0 && <p className="text-xs text-[#9CA3AF] italic">No actions available.</p>}</div></section>
                </div>
              ) : (<div className="h-80 flex items-center justify-center p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] text-[#9CA3AF] italic text-sm">Click a product to view details and moderate.</div>)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
