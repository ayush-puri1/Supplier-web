'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle, FileText, Download } from 'lucide-react';

export default function SupplierDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWithAuth(`/admin/suppliers/${id}`).then(setSupplier).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!confirm('Approve this supplier?')) return;
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'VERIFIED' }) }); router.push('/dashboard/admin/suppliers'); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); setActionLoading(false); }
  };

  const handleReject = async () => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }) }); router.push('/dashboard/admin/suppliers'); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); setActionLoading(false); }
  };

  if (loading) return <DashboardLayout title="Supplier Detail"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div></DashboardLayout>;
  if (!supplier) return <DashboardLayout title="Supplier Detail"><div className="text-center py-20"><h2 className="text-xl font-bold mb-4">Supplier not found</h2><button onClick={() => router.back()} className="text-sm text-[#0D9373] font-semibold hover:underline">Go Back</button></div></DashboardLayout>;

  const isPending = supplier.status === 'SUBMITTED' || supplier.status === 'UNDER_REVIEW';
  const Field = ({ label, value }: { label: string; value: any }) => (<div><p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">{label}</p><p className="text-sm font-medium text-[#0F1117]">{value || '—'}</p></div>);

  return (
    <DashboardLayout title="Supplier Detail">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button onClick={() => router.back()} className="text-sm font-semibold text-[#6B7280] hover:text-[#0F1117] transition-colors flex items-center mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</button>
            <div className="flex items-center gap-4">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117]">{supplier.companyName || 'Unknown'}</h1>
              <StatusBadge status={supplier.status} size="md" />
            </div>
            <p className="text-xs text-[#6B7280] mt-1">ID: {supplier.id}</p>
          </div>
          {isPending && (
            <div className="flex items-center gap-3">
              <button onClick={handleReject} disabled={actionLoading} className="px-6 py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-2 disabled:opacity-50"><XCircle className="w-4 h-4" /> Reject</button>
              <button onClick={handleApprove} disabled={actionLoading} className="px-6 py-3 rounded-xl bg-[#0D9373] text-white font-semibold text-sm hover:bg-[#0A7A61] shadow-lg shadow-[#0D9373]/20 transition-all flex items-center gap-2 disabled:opacity-50"><CheckCircle className="w-4 h-4" /> Approve</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#0F1117] border-b border-[#E5E7EB] pb-2">Business Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6"><Field label="Company Name" value={supplier.companyName} /><Field label="Business Type" value={supplier.businessType} /><Field label="GST Number" value={supplier.gstNumber} /><Field label="PAN Number" value={supplier.panNumber} /><Field label="Year Established" value={supplier.yearEstablished} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#0F1117] border-b border-[#E5E7EB] pb-2">Contact Info</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6"><Field label="Primary Contact" value={supplier.contactName} /><Field label="Phone" value={supplier.phone} /><div className="col-span-2"><Field label="Account Email" value={supplier.user?.email} /></div><div className="col-span-2"><Field label="Address" value={[supplier.address, supplier.city, supplier.state, supplier.pincode].filter(Boolean).join(', ')} /></div></div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#0F1117] border-b border-[#E5E7EB] pb-2">Operations</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6"><Field label="Workforce Size" value={supplier.workforceSize} /><Field label="Monthly Capacity" value={supplier.monthlyCapacity} /><Field label="Minimum Order Qty" value={supplier.moq} /><Field label="Avg Lead Time" value={supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : undefined} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#0F1117] border-b border-[#E5E7EB] pb-2">Documents</h2>
            <div className="space-y-3">
              {(supplier.documents || []).length > 0 ? supplier.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#0D9373]/30 transition-colors">
                  <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-[#6B7280]" /><div><p className="text-sm font-medium">{doc.type?.replace(/_/g, ' ') || 'Document'}</p><p className="text-xs text-[#6B7280]">{doc.fileName || 'file'}</p></div></div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#0D9373] hover:bg-[#ECFDF5] rounded-lg transition-colors"><Download className="w-4 h-4" /></a>
                </div>
              )) : <p className="text-sm text-[#9CA3AF] italic">No documents uploaded.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
