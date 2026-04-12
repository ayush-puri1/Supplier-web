'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import FileUpload from '@/components/ui/FileUpload';
import AlertBanner from '@/components/ui/AlertBanner';
import api from '@/lib/api';
import {
  ArrowLeft, ArrowRight, Check, Shield, MapPin, FileText,
  ClipboardCheck, Lock, Building2, Hash, Calendar, Users,
  Package, Globe, Bell, LayoutDashboard, Settings, LogOut,
  Plus, User, Clock, ChevronRight,
} from 'lucide-react';

/* ── Data ── */
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi (NCT)','Jammu & Kashmir',
  'Ladakh','Chandigarh','Puducherry','Andaman & Nicobar Islands',
  'Dadra & Nagar Haveli','Daman & Diu','Lakshadweep',
];
const BUSINESS_TYPES = [
  'Sole Proprietorship','Partnership',
  'Limited Liability Partnership (LLP)',
  'Private Limited (Pvt. Ltd.)','Public Limited (Ltd.)',
  'One Person Company (OPC)','Section 8 Company',
  'Hindu Undivided Family (HUF)',
];
const STEPS = [
  { label: 'Business Info',    icon: <Building2 size={14} /> },
  { label: 'Contact & Ops',   icon: <MapPin size={14} /> },
  { label: 'Documents',        icon: <FileText size={14} /> },
  { label: 'Review & Submit',  icon: <ClipboardCheck size={14} /> },
];

/* ════════════════ SIDEBAR ════════════════ */
function Sidebar({ onLogout }: { onLogout: () => void }) {
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: false },
    { label: 'Business Profile', icon: <User size={16} />,            href: '/dashboard/supplier/profile',       active: true  },
    { label: 'Notifications',    icon: <Bell size={16} />,            href: '/dashboard/supplier/notifications', active: false },
    { label: 'Settings',         icon: <Settings size={16} />,        href: '/dashboard/supplier/settings',      active: false },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0D0D12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>B2B Portal</div>
        </div>
      </Link>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? 'white' : 'rgba(255,255,255,0.38)', background: item.active ? 'rgba(37,99,235,0.14)' : 'transparent', borderLeft: item.active ? '2px solid #60A5FA' : '2px solid transparent', transition: 'all 0.2s' }}>
            <span style={{ color: item.active ? '#60A5FA' : 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ════════════════ LOCKED FIELD ════════════════ */
function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ padding: '12px 42px 12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', userSelect: 'none' as const }}>
          {value || '—'}
        </div>
        <Lock size={13} color="rgba(255,255,255,0.18)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
      </div>
    </div>
  );
}

/* ════════════════ PENDING VIEW ════════════════ */
function PendingView({ profile }: { profile: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
      {/* Left */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* General Info */}
        <div style={{ background: '#15151C', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 19, fontWeight: 700, color: 'white', marginBottom: 2 }}>General Info</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Business details & registration</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24', boxShadow: '0 0 6px rgba(251,191,36,0.7)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#FBBF24' }}>Under Review</span>
            </span>
          </div>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <LockedField label="Company Name" value={profile?.companyName || ''} />
            <LockedField label="Business Type" value={profile?.businessType || ''} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <LockedField label="GST Number" value={profile?.gstNumber || ''} />
              <LockedField label="PAN Number" value={profile?.panNumber || ''} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <LockedField label="Year Est." value={profile?.yearEstablished?.toString() || ''} />
              <LockedField label="HQ City" value={profile?.city || ''} />
            </div>
          </div>
          {/* Notice */}
          <div style={{ margin: '0 22px 22px', padding: '13px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={13} color="#FBBF24" />
            </div>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: '#FBBF24', marginBottom: 3 }}>Pending Verification</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(251,191,36,0.5)', lineHeight: 1.6 }}>Your details are locked while our compliance team reviews your application. Estimated time: 24–48 business hours.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>Operational Stats</p>
        {[
          { label: 'Workforce', value: profile?.workforceSize?.toLocaleString() || '—', unit: 'FTEs',      icon: <Users size={16} /> },
          { label: 'Capacity',  value: profile?.monthlyCapacity ? '85%' : '—',           unit: 'Utilization', icon: <Package size={16} /> },
          { label: 'Trust Score', value: '—', unit: 'Pending', icon: <Shield size={16} /> },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#15151C', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{stat.value}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{stat.unit}</span>
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
              {stat.icon}
            </div>
          </div>
        ))}
        {/* Audit card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.16) 0%, #15151C 65%)', borderRadius: 12, border: '1px solid rgba(37,99,235,0.2)', padding: '18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -16, right: -16, opacity: 0.06, pointerEvents: 'none' }}>
            <Shield size={80} strokeWidth={1} color="#60A5FA" />
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 6 }}>Request Audit</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 12 }}>Get a certified compliance audit to boost your trust score above 99%.</p>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.22)' }}>Available after verification →</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ MAIN PAGE ════════════════ */
export default function OnboardingPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const [profileStatus, setProfileStatus] = useState<string>('DRAFT');
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  /* Form state */
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessTypeVal] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [hqLocation, setHqLocation] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [workforceSize, setWorkforceSize] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState('');
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bizFile, setBizFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/supplier/me');
        setProfile(data);
        setProfileStatus(data.status || 'DRAFT');
        setCompanyName(data.companyName === 'Pending Setup' ? '' : data.companyName || '');
        setBusinessTypeVal(data.businessType || '');
        setGstNumber(data.gstNumber || '');
        setPanNumber(data.panNumber || '');
        setHqLocation(data.city || '');
        setYearEstablished(data.yearEstablished?.toString() || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setWorkforceSize(data.workforceSize?.toString() || '');
        setMonthlyCapacity(data.monthlyCapacity?.toString() || '');
      } catch (e) { console.error(e); }
      finally { setLoadingData(false); }
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true); setError('');
    try {
      await fetchWithAuth('/supplier/me', {
        method: 'PATCH',
        body: JSON.stringify({
          companyName, gstNumber, panNumber, businessType,
          yearEstablished: parseInt(yearEstablished) || 0,
          address, city: hqLocation, country: 'India',
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
    const fd = new FormData();
    fd.append('file', file); fd.append('type', type);
    try { await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); }
    catch { setError(`Failed to upload ${type}`); }
    finally { setUploading(''); }
  };

  const goToStep = (next: number, dir: 'forward' | 'back') => {
    if (animating) return;
    setAnimDir(dir); setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 260);
  };

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      if (!companyName.trim()) { setError('Business name is required'); return; }
      try { await saveProfile(); goToStep(2, 'forward'); } catch { }
    } else if (step === 2) {
      try { await saveProfile(); goToStep(3, 'forward'); } catch { }
    } else if (step === 3) { goToStep(4, 'forward'); }
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

  const progress = (step / 4) * 100;
  const isPending = profileStatus === 'SUBMITTED' || profileStatus === 'UNDER_REVIEW';
  const cardClass = animating
    ? (animDir === 'forward' ? 'card-exit-fwd' : 'card-exit-bck')
    : (animDir === 'forward' ? 'card-enter-fwd' : 'card-enter-bck');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0F0F14; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        select option { background:#1a1a24; color:white; }

        .onb-label {
          display:block; font-family:var(--font-body); font-size:10px; font-weight:700;
          letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.32); margin-bottom:8px;
        }
        .onb-input, .onb-select {
          width:100%; padding:12px 14px; border-radius:10px;
          border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04);
          color:white; font-family:var(--font-body); font-size:14px;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .onb-input:focus, .onb-select:focus {
          border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,0.12);
        }
        .onb-input::placeholder { color:rgba(255,255,255,0.2); }
        .onb-select {
          appearance:none; -webkit-appearance:none; cursor:pointer;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.28)' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 14px center; padding-right:40px;
        }

        @keyframes enterFwd { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes enterBck { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes exitFwd  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-24px)} }
        @keyframes exitBck  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(24px)} }
        .card-enter-fwd { animation:enterFwd 0.3s cubic-bezier(.22,1,.36,1) both; }
        .card-enter-bck { animation:enterBck 0.3s cubic-bezier(.22,1,.36,1) both; }
        .card-exit-fwd  { animation:exitFwd  0.22s ease-in both; pointer-events:none; }
        .card-exit-bck  { animation:exitBck  0.22s ease-in both; pointer-events:none; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .anim-up { animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0F14' }}>
        <Sidebar onLogout={() => { logout?.(); router.push('/login'); }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* Header */}
          <header style={{ height: 54, background: '#0D0D12', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Business Profile</span>
              <ChevronRight size={13} color="rgba(255,255,255,0.15)" />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: isPending ? '#FBBF24' : 'rgba(255,255,255,0.6)' }}>
                {isPending ? 'Under Review' : 'Onboarding'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 10px rgba(37,99,235,0.45)' }}>
                <User size={14} color="white" />
              </div>
            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>

            {/* Loading */}
            {loadingData && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}

            {!loadingData && (
              <>
                {/* Page title */}
                <div className="anim-up" style={{ marginBottom: 24 }}>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {isPending ? 'Business Profile' : 'Supplier Onboarding'}
                  </h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
                    {isPending ? 'Your application is under review by our compliance team.' : 'Complete all steps to get verified and start selling on Delraw.'}
                  </p>
                </div>

                {/* ── PENDING VIEW ── */}
                {isPending && <PendingView profile={profile} />}

                {/* ── FORM VIEW ── */}
                {!isPending && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

                    {/* Left: Step form card */}
                    <div>
                      {/* Step indicator (pill row) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, background: '#15151C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '4px', overflow: 'hidden' }}>
                        {STEPS.map((s, i) => {
                          const idx = i + 1;
                          const done = idx < step;
                          const active = idx === step;
                          return (
                            <button
                              key={s.label}
                              onClick={() => idx < step ? goToStep(idx, 'back') : undefined}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                padding: '9px 10px', borderRadius: 9, border: 'none', cursor: idx < step ? 'pointer' : 'default',
                                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 600 : 400,
                                color: active ? 'white' : done ? '#60A5FA' : 'rgba(255,255,255,0.28)',
                                background: active ? 'rgba(37,99,235,0.18)' : 'transparent',
                                transition: 'all 0.2s',
                              }}
                            >
                              {done
                                ? <Check size={13} color="#60A5FA" />
                                : <span style={{ width: 18, height: 18, borderRadius: 6, border: `1.5px solid ${active ? '#3B82F6' : 'rgba(255,255,255,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: active ? '#3B82F6' : 'rgba(255,255,255,0.22)', fontFamily: "'Syne', sans-serif" }}>{idx}</span>
                              }
                              <span style={{ display: window?.innerWidth > 900 ? 'block' : 'none' }}>{s.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #2563EB, #60A5FA)', borderRadius: 2, transition: 'width 0.4s cubic-bezier(.22,1,.36,1)' }} />
                      </div>

                      {/* Error */}
                      {error && (
                        <div style={{ marginBottom: 16 }}>
                          <AlertBanner type="error" message={error} onClose={() => setError('')} />
                        </div>
                      )}

                      {/* Step card */}
                      <div className={cardClass} style={{ background: '#15151C', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        {/* Card header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', flexShrink: 0 }}>
                              {STEPS[step - 1]?.icon}
                            </div>
                            <div>
                              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{STEPS[step - 1]?.label}</h2>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>Step {step} of {STEPS.length}</p>
                            </div>
                          </div>
                        </div>

                        {/* ── Step 1: Business Info ── */}
                        {step === 1 && (
                          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label className="onb-label">Company / Business Name *</label>
                                <input className="onb-input" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Puri Textiles Pvt. Ltd." />
                              </div>
                              <div>
                                <label className="onb-label">Business Type</label>
                                <select className="onb-select" value={businessType} onChange={e => setBusinessTypeVal(e.target.value)}>
                                  <option value="">Select type</option>
                                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="onb-label">Year Established</label>
                                <input className="onb-input" type="number" value={yearEstablished} onChange={e => setYearEstablished(e.target.value)} placeholder="e.g. 2005" min="1900" max={new Date().getFullYear()} />
                              </div>
                              <div>
                                <label className="onb-label">GST Number</label>
                                <input className="onb-input" type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="22AAAAA0000A1Z5" maxLength={15} style={{ textTransform: 'uppercase' as const }} />
                              </div>
                              <div>
                                <label className="onb-label">PAN Number</label>
                                <input className="onb-input" type="text" value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="AAAAA9999A" maxLength={10} style={{ textTransform: 'uppercase' as const }} />
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label className="onb-label">HQ State / UT</label>
                                <select className="onb-select" value={hqLocation} onChange={e => setHqLocation(e.target.value)}>
                                  <option value="">Select state / UT</option>
                                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── Step 2: Contact & Ops ── */}
                        {step === 2 && (
                          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label className="onb-label">Business Address</label>
                                <input className="onb-input" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full business address" />
                              </div>
                              <div>
                                <label className="onb-label">City</label>
                                <input className="onb-input" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Mumbai" />
                              </div>
                              <div>
                                <label className="onb-label">Country</label>
                                <input className="onb-input" value="India" readOnly style={{ color: 'rgba(255,255,255,0.35)', cursor: 'not-allowed' }} />
                              </div>
                              <div>
                                <label className="onb-label">Workforce Size</label>
                                <input className="onb-input" type="number" value={workforceSize} onChange={e => setWorkforceSize(e.target.value)} placeholder="e.g. 50" />
                              </div>
                              <div>
                                <label className="onb-label">Monthly Capacity (units)</label>
                                <input className="onb-input" type="number" value={monthlyCapacity} onChange={e => setMonthlyCapacity(e.target.value)} placeholder="e.g. 1000" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── Step 3: Documents ── */}
                        {step === 3 && (
                          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)', lineHeight: 1.7 }}>
                              Upload clear copies for verification. All files are AES-256 encrypted and only accessible to our compliance team.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                              <FileUpload label="GST Certificate" file={gstFile} onFileSelect={f => { setGstFile(f); uploadFile(f, 'GST_CERTIFICATE'); }} uploading={uploading === 'GST_CERTIFICATE'} />
                              <FileUpload label="PAN Card" file={panFile} onFileSelect={f => { setPanFile(f); uploadFile(f, 'PAN_CARD'); }} uploading={uploading === 'PAN_CARD'} />
                              <FileUpload label="Business Reg." file={bizFile} onFileSelect={f => { setBizFile(f); uploadFile(f, 'BUSINESS_REGISTRATION'); }} uploading={uploading === 'BUSINESS_REGISTRATION'} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 9, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.14)' }}>
                              <Lock size={12} color="#60A5FA" />
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#93C5FD' }}>PDF, JPG or PNG · Max 10 MB per file · AES-256 encrypted</span>
                            </div>
                          </div>
                        )}

                        {/* ── Step 4: Review ── */}
                        {step === 4 && (
                          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                              {[
                                { title: 'Business', goTo: 1, rows: [['Name', companyName||'—'],['Type', businessType||'—'],['GST', gstNumber||'—'],['PAN', panNumber||'—'],['Est.', yearEstablished||'—'],['HQ', hqLocation||'—']] },
                                { title: 'Operations', goTo: 2, rows: [['Address', address||'—'],['City', city||'—'],['Country','India'],['Workforce', workforceSize?`${workforceSize} people`:'—'],['Capacity', monthlyCapacity?`${monthlyCapacity} units/mo`:'—']] },
                              ].map(panel => (
                                <div key={panel.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>{panel.title}</p>
                                    <button onClick={() => goToStep(panel.goTo, 'back')} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit →</button>
                                  </div>
                                  {panel.rows.map(([l, v]) => (
                                    <div key={l} style={{ marginBottom: 10 }}>
                                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', marginBottom: 2 }}>{l}</p>
                                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{v}</p>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                            {/* Docs status */}
                            <div style={{ display: 'flex', gap: 10 }}>
                              {[['GST Certificate', gstFile], ['PAN Card', panFile], ['Business Reg.', bizFile]].map(([l, f]) => (
                                <div key={l as string} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 9, background: f ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${f ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.06)'}` }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: f ? '#34D399' : 'rgba(255,255,255,0.14)', flexShrink: 0, boxShadow: f ? '0 0 5px rgba(52,211,153,0.7)' : 'none' }} />
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: f ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.22)', fontWeight: 500 }}>{l as string}</span>
                                </div>
                              ))}
                            </div>
                            {/* Submit notice */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 11, background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.16)' }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(37,99,235,0.14)', border: '1px solid rgba(37,99,235,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Shield size={13} color="#60A5FA" />
                              </div>
                              <div>
                                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>Ready to submit</p>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>Reviewed in 2–3 business days. End-to-end encrypted.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Card nav */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          {step > 1
                            ? <button onClick={() => goToStep(step - 1, 'back')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                <ArrowLeft size={14} /> Back
                              </button>
                            : <div />
                          }
                          {step < 4
                            ? <button onClick={handleNext} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 24px', borderRadius: 9, border: 'none', background: saving ? 'rgba(255,255,255,0.5)' : 'white', color: '#0F0F14', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 18px rgba(255,255,255,0.12)' }}>
                                {saving ? 'Saving…' : <> Continue <ArrowRight size={14} /></>}
                              </button>
                            : <button onClick={handleSubmit} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 24px', borderRadius: 9, border: 'none', background: saving ? 'rgba(37,99,235,0.5)' : '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 0 24px rgba(37,99,235,0.4)' }}>
                                {saving ? 'Submitting…' : <><Check size={14} /> Submit Application</>}
                              </button>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Right sidebar: guide */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Step guide */}
                      <div style={{ background: '#15151C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)' }}>Progress</p>
                        </div>
                        {STEPS.map((s, i) => {
                          const idx = i + 1;
                          const done = idx < step;
                          const active = idx === step;
                          return (
                            <div key={s.label} style={{ padding: '12px 18px', borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'rgba(52,211,153,0.1)' : active ? 'rgba(37,99,235,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${done ? 'rgba(52,211,153,0.25)' : active ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                                {done ? <Check size={12} color="#34D399" /> : <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, color: active ? '#60A5FA' : 'rgba(255,255,255,0.22)' }}>{idx}</span>}
                              </div>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, color: done ? 'rgba(52,211,153,0.7)' : active ? 'white' : 'rgba(255,255,255,0.28)' }}>{s.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Compliance notice */}
                      <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, #15151C 70%)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 14, padding: '18px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', bottom: -14, right: -14, opacity: 0.05, pointerEvents: 'none' }}>
                          <Shield size={72} strokeWidth={1} color="#60A5FA" />
                        </div>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 6 }}>End-to-End Encrypted</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.65, marginBottom: 12 }}>Your business data and documents are encrypted at rest and in transit.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Lock size={11} color="#60A5FA" />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: '#60A5FA', letterSpacing: '0.06em' }}>AES-256 · TLS 1.3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
