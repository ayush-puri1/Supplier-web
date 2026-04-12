'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_TABS = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CONDITIONAL', 'SUSPENDED', 'DRAFT'] as const;

const TRANSITION_MAP: Record<string, { label: string; status: string; color: string }[]> = {
  SUBMITTED: [{ label: 'Start Review', status: 'UNDER_REVIEW', color: 'bg-blue-500 hover:bg-blue-600' }],
  UNDER_REVIEW: [{ label: '✅ Verify', status: 'VERIFIED', color: 'bg-blue-500 hover:bg-blue-600' }, { label: '❌ Reject', status: 'REJECTED', color: 'bg-red-500 hover:bg-red-600' }, { label: '⚠️ Conditional', status: 'CONDITIONAL', color: 'bg-orange-500 hover:bg-orange-600' }],
  VERIFIED: [{ label: '🚫 Suspend', status: 'SUSPENDED', color: 'bg-zinc-700 hover:bg-zinc-800' }],
  CONDITIONAL: [{ label: '🔄 Re-Review', status: 'UNDER_REVIEW', color: 'bg-blue-500 hover:bg-blue-600' }, { label: '❌ Reject', status: 'REJECTED', color: 'bg-red-500 hover:bg-red-600' }],
  REJECTED: [{ label: '↩️ Reset to Draft', status: 'DRAFT', color: 'bg-zinc-600 hover:bg-zinc-700' }],
  SUSPENDED: [{ label: '🔄 Re-Review', status: 'UNDER_REVIEW', color: 'bg-blue-500 hover:bg-blue-600' }],
  DRAFT: [],
};

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);
  const [internalNote, setInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadSuppliers = async () => {
    try {
      const url = activeTab === 'ALL' ? '/admin/suppliers' : `/admin/suppliers?status=${activeTab}`;
      const data = await fetchWithAuth(url);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); loadSuppliers(); }, [activeTab]);

  const handleUpdateStatus = async (id: string, status: string) => {
    let rejectionReason = '';
    if (status === 'REJECTED') { rejectionReason = prompt('Rejection reason:') || ''; if (!rejectionReason) return; }
    setActionLoading(true);
    try {
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) });
      await loadSuppliers();
      if (selected?.id === id) { const updated = await fetchWithAuth(`/admin/suppliers/${id}`); setSelected(updated); }
    } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); } finally { setActionLoading(false); }
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    try { await fetchWithAuth(`/admin/suppliers/${selected.id}/notes`, { method: 'PATCH', body: JSON.stringify({ internalNotes: internalNote }) }); } catch { alert('Failed to save note'); }
  };

  return (
    <DashboardLayout title="Suppliers">
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Supplier Verification</h1>
          <p className="text-sm text-[#6B7280]">Review registrations, manage compliance, and control platform trust.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelected(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === tab ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-[#2563EB]/20' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB] hover:text-[#0F1117]'}`}>
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-20"><LoadingSpinner /></div> : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              {suppliers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-sm text-[#9CA3AF] italic">No suppliers found with status: {activeTab}</div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                  <table className="w-full text-left">
                    <thead><tr className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#6B7280]"><th className="px-6 py-4">Company</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Trust</th><th className="px-6 py-4">Products</th></tr></thead>
                    <tbody className="divide-y divide-[#E5E7EB]/50">
                      {suppliers.map((s) => (
                        <tr key={s.id} onClick={() => { setSelected(s); setInternalNote(s.internalNotes || ''); }} className={`hover:bg-[#F9FAFB] transition-colors cursor-pointer ${selected?.id === s.id ? 'bg-[#ECFDF5]/50' : ''}`}>
                          <td className="px-6 py-4"><p className="text-sm font-semibold">{s.companyName}</p><p className="text-[10px] text-[#9CA3AF]">{s.user?.email}</p></td>
                          <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                          <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-full bg-[#2563EB]" style={{ width: `${s.trustScore || 0}%` }} /></div><span className="text-xs font-bold">{s.trustScore ?? '—'}</span></div></td>
                          <td className="px-6 py-4 text-sm font-semibold">{s._count?.products || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              {selected ? (
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] sticky top-24 animate-scale-in space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#0F1117] mb-1">{selected.companyName}</h3>
                    <p className="text-[10px] text-[#9CA3AF]">ID: {selected.id}</p>
                    <div className="mt-2"><StatusBadge status={selected.status} size="md" /></div>
                    {selected.status === 'REJECTED' && selected.rejectionReason && (<div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200"><p className="text-[10px] font-bold uppercase text-red-500 mb-1">Rejection Reason</p><p className="text-sm text-red-700 italic">&ldquo;{selected.rejectionReason}&rdquo;</p></div>)}
                  </div>

                  <section><p className="text-xs font-bold uppercase text-[#6B7280] mb-3 tracking-widest">Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {(TRANSITION_MAP[selected.status] || []).map((t) => (<button key={t.status} disabled={actionLoading} onClick={() => handleUpdateStatus(selected.id, t.status)} className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 ${t.color}`}>{t.label}</button>))}
                      {(TRANSITION_MAP[selected.status] || []).length === 0 && <p className="text-xs text-[#9CA3AF] italic">No actions available.</p>}
                    </div>
                  </section>

                  <section className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"><p className="text-xs font-bold mb-3 uppercase tracking-widest text-[#6B7280]">Business Details</p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                      {[['GST', selected.gstNumber], ['PAN', selected.panNumber], ['City', selected.city], ['Country', selected.country], ['Est.', selected.yearEstablished], ['Workforce', selected.workforceSize], ['Capacity', `${selected.monthlyCapacity}/mo`], ['MOQ', selected.moq], ['Lead Time', `${selected.leadTimeDays}d`], ['Response', `${selected.responseTimeHr}h`]].map(([label, val]) => (<div key={label as string}><p className="text-[10px] opacity-50 font-bold uppercase">{label}</p><p className="font-medium">{val || 'N/A'}</p></div>))}
                    </div>
                  </section>

                  <section><p className="text-xs font-bold uppercase text-[#6B7280] mb-3 tracking-widest">Internal Notes <span className="text-red-500">(Admin Only)</span></p>
                    <textarea className="w-full h-28 p-4 rounded-xl bg-white border border-[#E5E7EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none text-sm resize-none" placeholder="Add compliance notes..." value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
                    <button onClick={handleSaveNote} className="mt-2 w-full py-2 rounded-xl bg-[#ECFDF5] text-[#2563EB] border border-[#A7F3D0] text-xs font-bold hover:bg-[#2563EB] hover:text-white transition-all">Save Note</button>
                  </section>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] text-[#9CA3AF] italic text-sm">Select a supplier from the table to view details and take action.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
