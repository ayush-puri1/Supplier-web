'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import FileUpload from '@/components/ui/FileUpload';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import api from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [workforceSize, setWorkforceSize] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState('');
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bizFile, setBizFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchWithAuth('/supplier/me');
        if (data.status !== 'DRAFT') { router.push('/dashboard/supplier'); return; }
        setCompanyName(data.companyName === 'Pending Setup' ? '' : data.companyName || '');
        setGstNumber(data.gstNumber || '');
        setPanNumber(data.panNumber || '');
        setYearEstablished(data.yearEstablished?.toString() || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setCountry(data.country || 'India');
        setWorkforceSize(data.workforceSize?.toString() || '');
        setMonthlyCapacity(data.monthlyCapacity?.toString() || '');
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadProfile();
  }, [router]);

  const saveProfile = async () => {
    setSaving(true); setError('');
    try {
      await fetchWithAuth('/supplier/me', { method: 'PATCH', body: JSON.stringify({ companyName, gstNumber, panNumber, yearEstablished: parseInt(yearEstablished) || 0, address, city, country, workforceSize: parseInt(workforceSize) || 0, monthlyCapacity: parseInt(monthlyCapacity) || 0 }) });
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to save'); throw err; } finally { setSaving(false); }
  };

  const uploadFile = async (file: File, type: string) => {
    setUploading(type);
    const formData = new FormData(); formData.append('file', file); formData.append('type', type);
    try { await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch { setError(`Failed to upload ${type}`); } finally { setUploading(''); }
  };

  const handleNext = async () => {
    setError('');
    if (step === 1) { if (!companyName.trim()) { setError('Business name is required'); return; } try { await saveProfile(); setStep(2); } catch {} }
    else if (step === 2) { try { await saveProfile(); setStep(3); } catch {} }
    else if (step === 3) { setStep(4); }
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try { await fetchWithAuth('/supplier/submit', { method: 'POST' }); router.push('/dashboard/supplier'); } catch (err: any) { setError(err?.response?.data?.message || 'Failed to submit'); } finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="Onboarding"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" text="Loading..." /></div></DashboardLayout>;

  const progress = (step / 4) * 100;
  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none transition-all";

  return (
    <DashboardLayout title="Onboarding">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#374151]">Step {step} of 4</p><p className="text-sm text-[#6B7280]">{Math.round(progress)}%</p></div>
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-full bg-[#0D9373] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>

        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
          {step === 1 && (
            <div className="animate-fade-in-up space-y-6">
              <div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#0F1117]">Business Information</h2><p className="text-sm text-[#6B7280]">Tell us about your company</p></div>
              <div className="space-y-4">
                <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Business Name *</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" className={inputCls} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">GST Number</label><input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" className={`${inputCls} uppercase`} /></div>
                  <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">PAN Number</label><input type="text" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} placeholder="ABCDE1234F" className={`${inputCls} uppercase`} /></div>
                </div>
                <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Year Established</label><input type="number" value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} placeholder="2020" className={inputCls} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up space-y-6">
              <div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#0F1117]">Contact & Operations</h2><p className="text-sm text-[#6B7280]">Where are you located?</p></div>
              <div className="space-y-4">
                <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Business Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className={inputCls} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className={inputCls} /></div>
                  <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Country</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Workforce Size</label><input type="number" value={workforceSize} onChange={(e) => setWorkforceSize(e.target.value)} placeholder="50" className={inputCls} /></div>
                  <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Monthly Capacity</label><input type="number" value={monthlyCapacity} onChange={(e) => setMonthlyCapacity(e.target.value)} placeholder="1000" className={inputCls} /></div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-up space-y-6">
              <div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#0F1117]">Document Upload</h2><p className="text-sm text-[#6B7280]">Upload clear copies for verification.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileUpload label="GST Certificate" file={gstFile} onFileSelect={(f) => { setGstFile(f); uploadFile(f, 'GST_CERTIFICATE'); }} uploading={uploading === 'GST_CERTIFICATE'} />
                <FileUpload label="PAN Card" file={panFile} onFileSelect={(f) => { setPanFile(f); uploadFile(f, 'PAN_CARD'); }} uploading={uploading === 'PAN_CARD'} />
                <FileUpload label="Business Reg." file={bizFile} onFileSelect={(f) => { setBizFile(f); uploadFile(f, 'BUSINESS_REGISTRATION'); }} uploading={uploading === 'BUSINESS_REGISTRATION'} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in-up space-y-6">
              <div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#0F1117]">Review & Submit</h2><p className="text-sm text-[#6B7280]">Please review your details before submitting.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F9FAFB] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">Business</p><button onClick={() => setStep(1)} className="text-xs text-[#0D9373] font-semibold hover:underline">Edit</button></div>
                  {[['Company', companyName], ['GST', gstNumber || '—'], ['PAN', panNumber || '—'], ['Year', yearEstablished || '—']].map(([l, v]) => <div key={l as string}><p className="text-[10px] uppercase text-[#9CA3AF] font-bold">{l}</p><p className="text-sm font-medium">{v}</p></div>)}
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">Operations</p><button onClick={() => setStep(2)} className="text-xs text-[#0D9373] font-semibold hover:underline">Edit</button></div>
                  {[['Address', address || '—'], ['City', city || '—'], ['Workforce', workforceSize || '—'], ['Capacity', monthlyCapacity || '—']].map(([l, v]) => <div key={l as string}><p className="text-[10px] uppercase text-[#9CA3AF] font-bold">{l}</p><p className="text-sm font-medium">{v}</p></div>)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:border-[#0D9373] hover:text-[#0D9373] transition-all"><ArrowLeft className="w-4 h-4 inline mr-1" /> Back</button>}
          <div className="flex-1" />
          {step < 4 ? (
            <button onClick={handleNext} disabled={saving} className="px-8 py-3 rounded-full bg-[#0D9373] text-white font-semibold text-sm hover:bg-[#0A7A61] transition-all disabled:opacity-50">{saving ? 'Saving...' : <>Continue <ArrowRight className="w-4 h-4 inline ml-1" /></>}</button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="px-8 py-3 rounded-full bg-[#0D9373] text-white font-semibold text-sm hover:bg-[#0A7A61] transition-all hover:shadow-xl hover:shadow-[#0D9373]/20 disabled:opacity-50">{saving ? 'Submitting...' : <>Submit Application <Check className="w-4 h-4 inline ml-1" /></>}</button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
