'use client';

import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [workforceSize, setWorkforceSize] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState('');
  const [moq, setMoq] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('');
  const [responseTimeHr, setResponseTimeHr] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchWithAuth('/supplier/me');
        setProfile(data);
        setCompanyName(data.companyName || '');
        setGstNumber(data.gstNumber || '');
        setPanNumber(data.panNumber || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setCountry(data.country || '');
        setYearEstablished(data.yearEstablished?.toString() || '');
        setWorkforceSize(data.workforceSize?.toString() || '');
        setMonthlyCapacity(data.monthlyCapacity?.toString() || '');
        setMoq(data.moq?.toString() || '');
        setLeadTimeDays(data.leadTimeDays?.toString() || '');
        setResponseTimeHr(data.responseTimeHr?.toString() || '');
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  const isEditable = profile?.status === 'DRAFT' || profile?.status === 'REJECTED';

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = await fetchWithAuth('/supplier/me', {
        method: 'PATCH',
        body: JSON.stringify({ companyName, gstNumber, panNumber, address, city, country, yearEstablished: parseInt(yearEstablished) || 0, workforceSize: parseInt(workforceSize) || 0, monthlyCapacity: parseInt(monthlyCapacity) || 0, moq: parseInt(moq) || 0, leadTimeDays: parseInt(leadTimeDays) || 0, responseTimeHr: parseInt(responseTimeHr) || 0 }),
      });
      setProfile(data);
      setSuccess('Profile saved successfully');
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try { await fetchWithAuth('/supplier/submit', { method: 'POST' }); window.location.reload(); } catch (err: any) { setError(err?.response?.data?.message || 'Failed to submit'); } finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="Business Profile"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  const inputCls = `w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none transition-all ${!isEditable ? 'opacity-50 cursor-not-allowed bg-[#F9FAFB]' : ''}`;

  return (
    <DashboardLayout title="Business Profile">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Business Profile</h1>
            <p className="text-sm text-[#6B7280]">Manage your company information and verification documents.</p>
          </div>
          <StatusBadge status={profile?.status} size="md" />
        </div>

        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

        {profile?.status === 'REJECTED' && profile?.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase text-red-500 tracking-wider mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700 italic">&ldquo;{profile.rejectionReason}&rdquo;</p>
            <p className="text-xs text-red-500 mt-2">Please correct the issues and save to re-submit.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h3 className="font-semibold text-[#0F1117]">General Info</h3>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Company Name</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">GST Number</label><input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} disabled={!isEditable} className={`${inputCls} uppercase`} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">PAN Number</label><input type="text" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} disabled={!isEditable} className={`${inputCls} uppercase`} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Country</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
            </div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Year Established</label><input type="number" value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h3 className="font-semibold text-[#0F1117]">Operational Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Workforce Size</label><input type="number" value={workforceSize} onChange={(e) => setWorkforceSize(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Monthly Capacity</label><input type="number" value={monthlyCapacity} onChange={(e) => setMonthlyCapacity(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Min Order (MOQ)</label><input type="number" value={moq} onChange={(e) => setMoq(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Lead Time (days)</label><input type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Response Time (hrs)</label><input type="number" value={responseTimeHr} onChange={(e) => setResponseTimeHr(e.target.value)} disabled={!isEditable} className={inputCls} /></div>
            </div>
            {profile?.trustScore !== undefined && (
              <div className="bg-[#F9FAFB] rounded-xl p-4 mt-4">
                <p className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider mb-1">Trust Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-full bg-[#0D9373] rounded-full" style={{ width: `${profile.trustScore || 0}%` }} /></div>
                  <span className="text-sm font-bold text-[#0F1117]">{profile.trustScore ?? '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {isEditable && (
          <div className="flex gap-4">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-full bg-[#0D9373] text-white font-semibold text-sm hover:bg-[#0A7A61] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {profile?.status === 'DRAFT' && (
              <button onClick={handleSubmit} disabled={saving} className="px-8 py-3 rounded-full border-2 border-[#0D9373] text-[#0D9373] font-semibold text-sm hover:bg-[#0D9373] hover:text-white transition-all disabled:opacity-50">
                Submit for Review
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
