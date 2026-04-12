'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, LayoutDashboard, Users, Package, Shield, LogOut, BarChart3, ShieldOff, Check, AlertCircle, History, Settings } from 'lucide-react';

/* ══════════════════════════════════════════════
   ADMIN SIDEBAR
══════════════════════════════════════════════ */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} />, href: '/dashboard/admin', active: false },
    { label: 'Analytics', icon: <BarChart3 size={16} />, href: '/dashboard/admin/analytics', active: false },
    { label: 'Suppliers', icon: <Users size={16} />, href: '/dashboard/admin/suppliers', active: false },
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: false },
    { label: 'Audit Logs', icon: <History size={16} />, href: '/dashboard/admin/audit-logs', active: false },
    { label: 'Config', icon: <Shield size={16} />, href: '/dashboard/admin/config', active: true },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Admin Portal</div>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'admin@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'ADMIN'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

function DarkToggle({ label, desc, enabled, onChange, danger = false }: { label: string, desc: string, enabled: boolean, onChange: (v: boolean) => void, danger?: boolean }) {
  const bgColor = enabled ? (danger ? '#EF4444' : '#3B82F6') : 'rgba(255,255,255,0.1)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontStyle: 'normal', fontWeight: 600, color: 'white', marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
      </div>
      <button 
        type="button" 
        onClick={() => onChange(!enabled)}
        style={{ width: 44, height: 24, borderRadius: 999, background: bgColor, position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
      >
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: enabled ? 23 : 3, transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

export default function SystemConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [businessCommission, setBusinessCommission] = useState('');
  const [defaultTrustScore, setDefaultTrustScore] = useState('');
  const [maxFailedLogins, setMaxFailedLogins] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [maxProductsPerSupplier, setMaxProductsPerSupplier] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [supplierAutoApprove, setSupplierAutoApprove] = useState(false);
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/config').then((data: any) => {
      setBusinessCommission(data.businessCommission?.toString() || '10');
      setDefaultTrustScore(data.defaultTrustScore?.toString() || '50');
      setMaxFailedLogins(data.maxFailedLogins?.toString() || '5');
      setPlatformName(data.platformName || 'Delraw');
      setSupportEmail(data.supportEmail || 'support@delraw.com');
      setMaxProductsPerSupplier(data.maxProductsPerSupplier?.toString() || '100');
      setIsMaintenanceMode(data.isMaintenanceMode || false);
      setSupplierAutoApprove(data.supplierAutoApprove || false);
      setAllowNewRegistrations(data.allowNewRegistrations !== false);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await fetchWithAuth('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          businessCommission: parseFloat(businessCommission) || 10,
          defaultTrustScore: parseInt(defaultTrustScore) || 50,
          maxFailedLogins: parseInt(maxFailedLogins) || 5,
          platformName, supportEmail,
          maxProductsPerSupplier: parseInt(maxProductsPerSupplier) || 100,
          isMaintenanceMode, supplierAutoApprove, allowNewRegistrations,
        }),
      });
      setSuccess('Configuration saved successfully.');
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:border-blue-500 focus:bg-white/10 outline-none transition-all font-sans";

  if (!loading && user?.role !== 'SUPER_ADMIN') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <ShieldOff size={64} color="rgba(255,255,255,0.1)" style={{ marginBottom: 24 }} />
          <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Access Denied</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>This page is restricted to Super Admin users only.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px; height:4px;} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .config-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; padding: 12px 16px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; outline: none; transition: all 0.2s; }
        .config-input:focus { border-color: #3B82F6; background: rgba(255,255,255,0.05); box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <AdminSidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
             {/* CENTERED ADMIN TEXT */}
             <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 800, letterSpacing: '0.15em', color: 'white' }}>ADMIN</div>
             <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
               <ArrowLeft size={14} /> Back
             </button>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Settings size={14} color="rgba(255,255,255,0.3)" />
               <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Super Admin Access</span>
             </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              
              {loading ? (
                 <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                   <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                 </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>System Configuration</h1>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Adjust platform-wide thresholds, commissions, and operational mode.</p>
                    </div>
                  </div>

                  {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 24 }}>
                      <AlertCircle size={16} color="#EF4444" />
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#FCA5A5', fontWeight: 500 }}>{error}</p>
                    </div>
                  )}

                  {success && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, marginBottom: 24 }}>
                      <Check size={16} color="#10B981" />
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6EE7B7', fontWeight: 500 }}>{success}</p>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Section */}
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>Financial Controls</h3>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Platform Commission (%)</label>
                          <input type="number" value={businessCommission} onChange={(e) => setBusinessCommission(e.target.value)} className="config-input" />
                        </div>
                      </div>

                      {/* Section */}
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>Trust Thresholds</h3>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Default Trust Score</label>
                          <input type="number" value={defaultTrustScore} onChange={(e) => setDefaultTrustScore(e.target.value)} className="config-input" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Max Failed Logins</label>
                          <input type="number" value={maxFailedLogins} onChange={(e) => setMaxFailedLogins(e.target.value)} className="config-input" />
                        </div>
                      </div>

                      {/* Section */}
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>Platform Identity</h3>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Platform Name</label>
                          <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="config-input" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Support Email</label>
                          <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="config-input" />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Section */}
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>Supplier Limits</h3>
                        <div>
                          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Max Products Per Supplier</label>
                          <input type="number" value={maxProductsPerSupplier} onChange={(e) => setMaxProductsPerSupplier(e.target.value)} className="config-input" />
                        </div>
                      </div>

                      {/* Section */}
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20 }}>Critical Operations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <DarkToggle 
                            label="Maintenance Mode" 
                            desc="Blocks all non-admin traffic immediately" 
                            enabled={isMaintenanceMode} 
                            onChange={setIsMaintenanceMode} 
                            danger={true} 
                          />
                          <DarkToggle 
                            label="Supplier Auto-Approve" 
                            desc="Auto-verify incoming supplier profiles" 
                            enabled={supplierAutoApprove} 
                            onChange={setSupplierAutoApprove} 
                          />
                          <DarkToggle 
                            label="Allow Registrations" 
                            desc="Enable public supplier sign-up form" 
                            enabled={allowNewRegistrations} 
                            onChange={setAllowNewRegistrations} 
                          />
                        </div>
                      </div>

                      {/* Apply Actions */}
                      <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.02))', borderRadius: 16, border: '1px solid rgba(37,99,235,0.3)', padding: 24 }}>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>Apply Configuration</h3>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.5 }}>Changes saved here will be applied across the platform instantly. Ensure you have verified thresholds before applying.</p>
                        
                        <button 
                          onClick={handleSave} 
                          disabled={saving} 
                          style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#2563EB', color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                        >
                          {saving ? 'SAVING CHANGES...' : 'SAVE CONFIGURATION'}
                        </button>
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
