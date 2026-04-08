'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import FileUpload from '@/components/ui/FileUpload';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, ArrowRight, Check, Shield, MapPin, FileText, ClipboardCheck, Lock } from 'lucide-react';
import api from '@/lib/api';

const STEPS = [
  { label: 'Business Information', icon: <Shield size={16} />, short: 'Business' },
  { label: 'Contact & Operations', icon: <MapPin size={16} />, short: 'Operations' },
  { label: 'Document Upload', icon: <FileText size={16} />, short: 'Documents' },
  { label: 'Review & Submit', icon: <ClipboardCheck size={16} />, short: 'Review' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
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
      } catch (err) { console.error(err); } finally { setLoadingData(false); }
    };
    loadProfile();
  }, [router]);

  const saveProfile = async () => {
    setSaving(true); setError('');
    try {
      await fetchWithAuth('/supplier/me', {
        method: 'PATCH',
        body: JSON.stringify({
          companyName, gstNumber, panNumber,
          yearEstablished: parseInt(yearEstablished) || 0,
          address, city, country,
          workforceSize: parseInt(workforceSize) || 0,
          monthlyCapacity: parseInt(monthlyCapacity) || 0,
        }),
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save');
      throw err;
    } finally { setSaving(false); }
  };

  const uploadFile = async (file: File, type: string) => {
    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch { setError(`Failed to upload ${type}`); } finally { setUploading(''); }
  };

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      if (!companyName.trim()) { setError('Business name is required'); return; }
      try { await saveProfile(); setStep(2); } catch {}
    } else if (step === 2) {
      try { await saveProfile(); setStep(3); } catch {}
    } else if (step === 3) { setStep(4); }
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      await fetchWithAuth('/supplier/submit', { method: 'POST' });
      router.push('/dashboard/supplier');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit');
    } finally { setSaving(false); }
  };

  if (loadingData) return (
    <DashboardLayout title="Onboarding">
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    </DashboardLayout>
  );

  const progress = (step / 4) * 100;

  return (
    <DashboardLayout title="Onboarding">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400;1,6..96,700;1,6..96,900&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        .onb-font-display { font-family: 'Bodoni Moda', serif; }
        .onb-font-heading { font-family: 'Syne', sans-serif; }
        .onb-font-body    { font-family: 'DM Sans', sans-serif; }

        @keyframes onb-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .onb-a1 { animation: onb-up 0.65s cubic-bezier(.22,1,.36,1) both; }
        .onb-a2 { animation: onb-up 0.65s 0.1s cubic-bezier(.22,1,.36,1) both; }
        .onb-a3 { animation: onb-up 0.65s 0.2s cubic-bezier(.22,1,.36,1) both; }
        .onb-a4 { animation: onb-up 0.65s 0.3s cubic-bezier(.22,1,.36,1) both; }

        .onb-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #E5E7EB;
          background: white;
          color: #111827;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .onb-input:focus {
          border-color: #0D9373;
          box-shadow: 0 0 0 3px rgba(13,147,115,0.12);
        }
        .onb-input::placeholder { color: #9CA3AF; }

        .onb-select {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }

        .onb-label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .onb-step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          position: relative;
        }

        .onb-card {
          background: white;
          border-radius: 20px;
          border: 1.5px solid #E5E7EB;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .onb-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .onb-btn-primary {
          background: #0D9373;
          color: white;
          box-shadow: 0 4px 20px rgba(13,147,115,0.3);
        }
        .onb-btn-primary:hover:not(:disabled) {
          background: #0A7A61;
          box-shadow: 0 6px 28px rgba(13,147,115,0.4);
          transform: translateY(-1px);
        }
        .onb-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .onb-btn-ghost {
          background: transparent;
          color: #6B7280;
          border: 1.5px solid #E5E7EB;
        }
        .onb-btn-ghost:hover {
          border-color: #9CA3AF;
          color: #374151;
        }

        .onb-review-card {
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
        }
        .onb-review-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 3px;
        }
        .onb-review-value {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }
      `}</style>

      <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 60 }}>

        {/* ═══ HERO HEADER ═══ */}
        <div className="onb-a1" style={{ marginBottom: 44 }}>
          {/* Step badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(13,147,115,0.08)',
            border: '1px solid rgba(13,147,115,0.2)',
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0D9373', boxShadow: '0 0 6px rgba(13,147,115,0.8)' }} />
            <span className="onb-font-body" style={{ fontSize: 11, fontWeight: 600, color: '#0D9373' }}>
              Step {step} of 4
            </span>
          </div>

          {/* Big display heading */}
          <h1 className="onb-font-display" style={{
            fontSize: 'clamp(34px, 5vw, 58px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: '#0F1117',
            marginBottom: 16,
          }}>
            Welcome to the ecosystem.
          </h1>

          {/* Sub */}
          <p className="onb-font-body" style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, maxWidth: 500 }}>
            Let&apos;s begin by establishing your business credentials. This information ensures trust within our supplier network.
          </p>
        </div>

        {/* ═══ PROGRESS + STEP CARDS ═══ */}
        <div className="onb-a2" style={{ marginBottom: 32 }}>
          {/* Step label + bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="onb-font-heading" style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '-0.01em' }}>
              {STEPS[step - 1].label}
            </p>
            <p className="onb-font-body" style={{ fontSize: 11, color: '#9CA3AF' }}>
              {Math.round(progress)}% complete
            </p>
          </div>
          <div style={{ width: '100%', height: 5, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #0D9373, #34D399)',
              borderRadius: 999,
              width: `${progress}%`,
              transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
              boxShadow: '0 0 8px rgba(13,147,115,0.5)',
            }} />
          </div>

          {/* Step indicator pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const isActive = step === idx;
              const isDone = step > idx;
              return (
                <button
                  key={s.label}
                  onClick={() => isDone && setStep(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: isActive
                      ? '1.5px solid #0D9373'
                      : isDone
                      ? '1.5px solid rgba(13,147,115,0.3)'
                      : '1.5px solid #E5E7EB',
                    background: isActive
                      ? 'rgba(13,147,115,0.06)'
                      : isDone
                      ? 'rgba(13,147,115,0.03)'
                      : '#FAFAFA',
                    boxShadow: isActive ? '0 0 16px rgba(13,147,115,0.15)' : 'none',
                    cursor: isDone ? 'pointer' : 'default',
                    transition: 'all 0.3s',
                    textAlign: 'left',
                  }}
                >
                  {/* Icon circle */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: isActive ? '#0D9373' : isDone ? 'rgba(13,147,115,0.12)' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? 'white' : isDone ? '#0D9373' : '#9CA3AF',
                    transition: 'all 0.3s',
                    boxShadow: isActive ? '0 4px 12px rgba(13,147,115,0.35)' : 'none',
                  }}>
                    {isDone ? <Check size={13} /> : s.icon}
                  </div>
                  {/* Label */}
                  <p className="onb-font-heading" style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isActive ? '#0D9373' : isDone ? '#6B7280' : '#9CA3AF',
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                  }}>
                    {s.short}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ ERROR ═══ */}
        {error && (
          <div style={{ marginBottom: 24 }}>
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* ═══ FORM CARD ═══ */}
        <div className="onb-card onb-a3">
          {/* Decorative corner accent */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(13,147,115,0.08), transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          {/* ─── Step 1: Business Information ─── */}
          {step === 1 && (
            <div className="onb-a1">
              <div style={{ marginBottom: 32 }}>
                <p className="onb-font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0D9373', marginBottom: 8 }}>
                  Business Information
                </p>
                <h2 className="onb-font-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0F1117', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Tell us about your company
                </h2>
                <p className="onb-font-body" style={{ fontSize: 13, color: '#9CA3AF' }}>
                  This helps us establish your legal identity on the platform.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {/* Business Name */}
                <div>
                  <label className="onb-label">Business Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter legal business name"
                    className="onb-input"
                  />
                </div>

                {/* GST + PAN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label className="onb-label">GST Number</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="22AAAAA0000A1Z5"
                      className="onb-input"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <label className="onb-label">PAN Number</label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="onb-input"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                {/* Business Type + Year */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label className="onb-label">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="onb-input onb-select"
                    >
                      <option value="">Select business entity</option>
                      <option value="proprietorship">Sole Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="llp">LLP</option>
                      <option value="pvt_ltd">Private Limited</option>
                      <option value="public_ltd">Public Limited</option>
                    </select>
                  </div>
                  <div>
                    <label className="onb-label">Year Established</label>
                    <input
                      type="number"
                      value={yearEstablished}
                      onChange={(e) => setYearEstablished(e.target.value)}
                      placeholder="YYYY"
                      className="onb-input"
                    />
                  </div>
                </div>
              </div>

              {/* Encrypted badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                marginTop: 28, padding: '8px 14px', borderRadius: 10,
                background: '#F9FAFB', border: '1px solid #E5E7EB',
              }}>
                <Lock size={12} color="#9CA3AF" />
                <span className="onb-font-body" style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                  Encrypted &amp; Secure Submission
                </span>
              </div>
            </div>
          )}

          {/* ─── Step 2: Contact & Operations ─── */}
          {step === 2 && (
            <div className="onb-a1">
              <div style={{ marginBottom: 32 }}>
                <p className="onb-font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0D9373', marginBottom: 8 }}>
                  Contact &amp; Operations
                </p>
                <h2 className="onb-font-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0F1117', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Where are you located?
                </h2>
                <p className="onb-font-body" style={{ fontSize: 13, color: '#9CA3AF' }}>
                  Provide your operational details for account verification.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <label className="onb-label">Business Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full business address" className="onb-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label className="onb-label">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className="onb-input" />
                  </div>
                  <div>
                    <label className="onb-label">Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="onb-input" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label className="onb-label">Workforce Size</label>
                    <input type="number" value={workforceSize} onChange={(e) => setWorkforceSize(e.target.value)} placeholder="e.g. 50" className="onb-input" />
                  </div>
                  <div>
                    <label className="onb-label">Monthly Capacity (units)</label>
                    <input type="number" value={monthlyCapacity} onChange={(e) => setMonthlyCapacity(e.target.value)} placeholder="e.g. 1000" className="onb-input" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Documents ─── */}
          {step === 3 && (
            <div className="onb-a1">
              <div style={{ marginBottom: 32 }}>
                <p className="onb-font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0D9373', marginBottom: 8 }}>
                  Document Upload
                </p>
                <h2 className="onb-font-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0F1117', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Upload your documents
                </h2>
                <p className="onb-font-body" style={{ fontSize: 13, color: '#9CA3AF' }}>
                  Upload clear copies for verification. All files are encrypted and secure.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <FileUpload label="GST Certificate" file={gstFile} onFileSelect={(f) => { setGstFile(f); uploadFile(f, 'GST_CERTIFICATE'); }} uploading={uploading === 'GST_CERTIFICATE'} />
                <FileUpload label="PAN Card" file={panFile} onFileSelect={(f) => { setPanFile(f); uploadFile(f, 'PAN_CARD'); }} uploading={uploading === 'PAN_CARD'} />
                <FileUpload label="Business Reg." file={bizFile} onFileSelect={(f) => { setBizFile(f); uploadFile(f, 'BUSINESS_REGISTRATION'); }} uploading={uploading === 'BUSINESS_REGISTRATION'} />
              </div>
            </div>
          )}

          {/* ─── Step 4: Review & Submit ─── */}
          {step === 4 && (
            <div className="onb-a1">
              <div style={{ marginBottom: 32 }}>
                <p className="onb-font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0D9373', marginBottom: 8 }}>
                  Review &amp; Submit
                </p>
                <h2 className="onb-font-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0F1117', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Confirm your details
                </h2>
                <p className="onb-font-body" style={{ fontSize: 13, color: '#9CA3AF' }}>
                  Review all information before submitting your application.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {/* Business summary */}
                <div className="onb-review-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <p className="onb-font-body" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF' }}>Business</p>
                    <button onClick={() => setStep(1)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: '#0D9373', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Edit →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {([['Company', companyName], ['GST', gstNumber || '—'], ['PAN', panNumber || '—'], ['Year', yearEstablished || '—']] as [string, string][]).map(([l, v]) => (
                      <div key={l}>
                        <p className="onb-review-label">{l}</p>
                        <p className="onb-review-value">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations summary */}
                <div className="onb-review-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <p className="onb-font-body" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF' }}>Operations</p>
                    <button onClick={() => setStep(2)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: '#0D9373', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Edit →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {([['Address', address || '—'], ['City', city || '—'], ['Workforce', workforceSize || '—'], ['Capacity', monthlyCapacity || '—']] as [string, string][]).map(([l, v]) => (
                      <div key={l}>
                        <p className="onb-review-label">{l}</p>
                        <p className="onb-review-value">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust notice */}
              <div style={{
                marginTop: 24,
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', borderRadius: 12,
                background: 'rgba(13,147,115,0.05)',
                border: '1px solid rgba(13,147,115,0.18)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'rgba(13,147,115,0.1)',
                  border: '1px solid rgba(13,147,115,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Shield size={15} color="#0D9373" />
                </div>
                <div>
                  <p className="onb-font-body" style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                    Ready to submit
                  </p>
                  <p className="onb-font-body" style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
                    Your application will be reviewed within 2–3 business days. Fully encrypted &amp; secure.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ NAVIGATION ═══ */}
        <div className="onb-a4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="onb-nav-btn onb-btn-ghost">
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button onClick={handleNext} disabled={saving} className="onb-nav-btn onb-btn-primary">
              {saving ? 'Saving…' : <><span>Continue</span> <ArrowRight size={15} /></>}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="onb-nav-btn onb-btn-primary">
              {saving ? 'Submitting…' : <><span>Submit Application</span> <Check size={15} /></>}
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
