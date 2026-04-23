'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import AlertBanner from '@/components/ui/AlertBanner';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, User, Bell, Settings, LogOut,
  Building2, MapPin, BarChart3, Shield, Check, Save,
  AlertCircle, Lock, Send,
} from 'lucide-react';

/* ════════ SIDEBAR ════════ */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: false },
    { label: 'Business Profile', icon: <User size={16} />,            href: '/dashboard/supplier/profile',       active: true  },
    { label: 'Notifications',    icon: <Bell size={16} />,            href: '/dashboard/supplier/notifications', active: false },
    { label: 'Settings',         icon: <Settings size={16} />,        href: '/dashboard/supplier/settings',      active: false },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
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
        {user && (
          <div style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user?.companyName || user?.email || 'supplier@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'SUPPLIER'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ════════ FIELD ════════ */
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 8,
};
const baseInput: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const lockedInput: React.CSSProperties = {
  ...baseInput, color: 'rgba(255,255,255,0.35)', cursor: 'not-allowed',
  background: 'rgba(255,255,255,0.025)',
};

function Field({ label, value, onChange, type = 'text', disabled = false, uppercase = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; disabled?: boolean; uppercase?: boolean;
}) {
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none';
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} value={value} disabled={disabled}
          onChange={e => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
          style={disabled ? lockedInput : baseInput}
          onFocus={onFocus} onBlur={onBlur}
        />
        {disabled && <Lock size={12} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      </div>
    </div>
  );
}

/* ════════ STATUS BADGE ════════ */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    DRAFT:       { label: 'Draft',        color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' },
    SUBMITTED:   { label: 'Submitted',    color: '#FBBF24',              bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
    UNDER_REVIEW:{ label: 'Under Review', color: '#FBBF24',              bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
    APPROVED:    { label: 'Approved',     color: '#34D399',              bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
    REJECTED:    { label: 'Rejected',     color: '#F87171',              bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
  };
  const cfg = map[status] || map.DRAFT;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
      {cfg.label}
    </span>
  );
}

/* ════════ SECTION CARD ════════ */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.28)' }}>{icon}</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)' }}>{title}</span>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

/* ════════ MAIN PAGE ════════ */
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
    (async () => {
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
    })();
  }, []);

  const isEditable = profile?.status === 'DRAFT' || profile?.status === 'REJECTED';

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = await fetchWithAuth('/supplier/me', {
        method: 'PATCH',
        body: JSON.stringify({ companyName, gstNumber, panNumber, address, city, country, yearEstablished: parseInt(yearEstablished)||0, workforceSize: parseInt(workforceSize)||0, monthlyCapacity: parseInt(monthlyCapacity)||0, moq: parseInt(moq)||0, leadTimeDays: parseInt(leadTimeDays)||0, responseTimeHr: parseInt(responseTimeHr)||0 }),
      });
      setProfile(data);
      setSuccess('Profile saved successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try { await fetchWithAuth('/supplier/submit', { method: 'POST' }); window.location.reload(); }
    catch (err: any) { setError(err?.response?.data?.message || 'Failed to submit'); } finally { setSaving(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .anim-up { animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Business Profile</span>
            {profile && <StatusPill status={profile.status} />}
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 80px' }}>

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}

            {!loading && (
              <div className="anim-up" style={{ maxWidth: 860, margin: '0 auto' }}>
                {/* Page heading */}
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Business Profile</h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
                    {isEditable ? 'Edit your company details and submit for verification.' : 'Your profile is locked while under review.'}
                  </p>
                </div>

                {/* Alerts */}
                {error && <div style={{ marginBottom: 16 }}><AlertBanner type="error" message={error} onClose={() => setError('')} /></div>}
                {success && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={14} color="#34D399" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#34D399' }}>{success}</span>
                  </div>
                )}

                {/* Rejection reason */}
                {profile?.status === 'REJECTED' && profile?.rejectionReason && (
                  <div style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 11, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: '#F87171', marginBottom: 4 }}>Application Rejected</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.7)', fontStyle: 'italic', marginBottom: 4 }}>"{profile.rejectionReason}"</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(248,113,113,0.45)' }}>Correct the issues above and save to re-submit.</p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {/* General Info */}
                  <Section title="General Info" icon={<Building2 size={14} />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <Field label="Company Name" value={companyName} onChange={setCompanyName} disabled={!isEditable} />
                      <Field label="GST Number" value={gstNumber} onChange={setGstNumber} disabled={!isEditable} uppercase />
                      <Field label="PAN Number" value={panNumber} onChange={setPanNumber} disabled={!isEditable} uppercase />
                      <Field label="Year Established" value={yearEstablished} onChange={setYearEstablished} type="number" disabled={!isEditable} />
                    </div>
                  </Section>

                  {/* Location */}
                  <Section title="Location" icon={<MapPin size={14} />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <Field label="Business Address" value={address} onChange={setAddress} disabled={!isEditable} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="City" value={city} onChange={setCity} disabled={!isEditable} />
                        <Field label="Country" value={country} onChange={setCountry} disabled={!isEditable} />
                      </div>
                    </div>
                  </Section>
                </div>

                {/* Operational Stats */}
                <div style={{ marginBottom: 16 }}>
                  <Section title="Operational Stats" icon={<BarChart3 size={14} />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                      <Field label="Workforce Size" value={workforceSize} onChange={setWorkforceSize} type="number" disabled={!isEditable} />
                      <Field label="Monthly Capacity (units)" value={monthlyCapacity} onChange={setMonthlyCapacity} type="number" disabled={!isEditable} />
                      <Field label="Min Order (MOQ)" value={moq} onChange={setMoq} type="number" disabled={!isEditable} />
                      <Field label="Lead Time (days)" value={leadTimeDays} onChange={setLeadTimeDays} type="number" disabled={!isEditable} />
                      <Field label="Response Time (hrs)" value={responseTimeHr} onChange={setResponseTimeHr} type="number" disabled={!isEditable} />

                      {/* Trust Score */}
                      {profile?.trustScore !== undefined && (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
                          <label style={labelStyle}>Trust Score</label>
                          <div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                              <div style={{ height: '100%', width: `${profile.trustScore || 0}%`, background: 'linear-gradient(90deg, #2563EB, #34D399)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>Verified trustworthiness</span>
                              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'white' }}>{profile.trustScore ?? '—'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Section>
                </div>

                {/* Not editable notice */}
                {!isEditable && (
                  <div style={{ marginBottom: 16, padding: '13px 16px', borderRadius: 10, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.14)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={13} color="#60A5FA" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#93C5FD' }}>
                      Your profile is locked while under admin review. Fields will be editable if the application is rejected.
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                {isEditable && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: 'none', background: saving ? 'rgba(255,255,255,0.3)' : 'white', color: '#141414', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 18px rgba(255,255,255,0.12)', transition: 'all 0.2s' }}>
                      {saving ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTop: '2px solid #141414', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Saving…</> : <><Save size={14} /> Save Profile</>}
                    </button>
                    {profile?.status === 'DRAFT' && (
                      <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: 'none', background: saving ? 'rgba(37,99,235,0.5)' : '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 0 24px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}>
                        <Send size={14} /> Submit for Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
