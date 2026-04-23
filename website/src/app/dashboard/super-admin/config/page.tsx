'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Check, AlertCircle, Settings, Shield, Save, Terminal, ShieldAlert } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

/* ── Typography & Styles ── */
const C = {
  bg: '#0A0A0A',
  surface: '#121212',
  border: 'rgba(255,255,255,0.06)',
  accent: '#3B82F6',
  text: '#F1F5F9',
  textDim: '#94A3B8',
  green: '#10B981',
  red: '#EF4444',
};

function ConfigToggle({ label, desc, enabled, onChange, danger = false }: any) {
  const bgColor = enabled ? (danger ? C.red : C.accent) : 'rgba(255,255,255,0.08)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim }}>{desc}</p>
      </div>
      <button 
        type="button" 
        onClick={() => onChange(!enabled)}
        style={{ width: 44, height: 24, borderRadius: 22, background: bgColor, position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: enabled ? 23 : 3, transition: 'all 0.2s' }} />
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

  const [form, setForm] = useState({
    businessCommission: '10',
    defaultTrustScore: '50',
    maxFailedLogins: '5',
    platformName: 'Delraw',
    supportEmail: 'support@delraw.com',
    maxProductsPerSupplier: '100',
    isMaintenanceMode: false,
    supplierAutoApprove: false,
    allowNewRegistrations: true,
  });

  const load = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/admin/config');
      setForm({
        businessCommission: data.businessCommission?.toString() || '10',
        defaultTrustScore: data.defaultTrustScore?.toString() || '50',
        maxFailedLogins: data.maxFailedLogins?.toString() || '5',
        platformName: data.platformName || 'Delraw',
        supportEmail: data.supportEmail || 'support@delraw.com',
        maxProductsPerSupplier: data.maxProductsPerSupplier?.toString() || '100',
        isMaintenanceMode: data.isMaintenanceMode || false,
        supplierAutoApprove: data.supplierAutoApprove || false,
        allowNewRegistrations: data.allowNewRegistrations !== false,
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await fetchWithAuth('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          ...form,
          businessCommission: parseFloat(form.businessCommission),
          defaultTrustScore: parseInt(form.defaultTrustScore),
          maxFailedLogins: parseInt(form.maxFailedLogins),
          maxProductsPerSupplier: parseInt(form.maxProductsPerSupplier),
        }),
      });
      setSuccess('Infrastructure configuration updated successfully.');
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to sync with global registry'); } finally { setSaving(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:${C.bg}; color:${C.text}; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .config-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid ${C.border}; color: white; padding: 12px 16px; border-radius: 12px; font-family: var(--font-body); font-size: 13px; font-weight: 500; outline: none; transition: all 0.2s; }
        .config-input:focus { border-color: ${C.accent}; background: rgba(255,255,255,0.05); }
        @keyframes sa-fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sa-in { animation: sa-fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar active="config" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* HEADER */}
          <header style={{ height: 54, background: '#050505', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
             <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.textDim, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color=C.textDim}>
               <ArrowLeft size={14} /> Back
             </button>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Terminal size={14} color={C.accent} />
               <span style={{ fontSize: 13, color: C.textDim, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Infra Orchestration</span>
             </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              
              <div style={{ marginBottom: 40 }} className="sa-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ height: 1, width: 40, background: C.accent }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.accent }}>System Registry</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 900, color: C.text, letterSpacing: '-0.02em', fontStyle: 'italic' }}>Platform Configuration</h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: C.textDim, marginTop: 12, maxWidth: 700, lineHeight: 1.6 }}>Adjust global thresholds, operational modes, and platform-wide commissions.</p>
              </div>

              {loading ? (
                 <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                   <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                 </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }} className="sa-in">
                  
                  {/* MAIN SETTINGS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                     <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: '32px' }}>
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 24 }}>Governance Controls</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                           <div>
                              <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 800, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform Commission (%)</label>
                              <input type="number" value={form.businessCommission} onChange={(e) => setForm(p=>({...p, businessCommission:e.target.value}))} className="config-input" />
                           </div>
                           <div>
                              <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 800, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Default Trust Score</label>
                              <input type="number" value={form.defaultTrustScore} onChange={(e) => setForm(p=>({...p, defaultTrustScore:e.target.value}))} className="config-input" />
                           </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                           <div>
                              <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 800, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Max Failed Logins</label>
                              <input type="number" value={form.maxFailedLogins} onChange={(e) => setForm(p=>({...p, maxFailedLogins:e.target.value}))} className="config-input" />
                           </div>
                           <div>
                              <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 800, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Max SKUs Per Supplier</label>
                              <input type="number" value={form.maxProductsPerSupplier} onChange={(e) => setForm(p=>({...p, maxProductsPerSupplier:e.target.value}))} className="config-input" />
                           </div>
                        </div>
                     </div>

                     <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: '32px' }}>
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 24 }}>Identity & Support</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                           <div>
                              <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 800, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Global Platform Name</label>
                              <input type="text" value={form.platformName} onChange={(e) => setForm(p=>({...p, platformName:e.target.value}))} className="config-input" />
                           </div>
                           <div>
                              <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 800, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>System Support Email</label>
                              <input type="email" value={form.supportEmail} onChange={(e) => setForm(p=>({...p, supportEmail:e.target.value}))} className="config-input" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* SIDEBAR ACTIONS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                     <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: '24px' }}>
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 20 }}>System Toggles</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                           <ConfigToggle label="Maintenance Mode" desc="Admin access only" enabled={form.isMaintenanceMode} onChange={(v:any) => setForm(p=>({...p, isMaintenanceMode:v}))} danger />
                           <ConfigToggle label="Auto-Approve" desc="Verify suppliers instantly" enabled={form.supplierAutoApprove} onChange={(v:any) => setForm(p=>({...p, supplierAutoApprove:v}))} />
                           <ConfigToggle label="Onboarding Portal" desc="Allow new registrations" enabled={form.allowNewRegistrations} onChange={(v:any) => setForm(p=>({...p, allowNewRegistrations:v}))} />
                        </div>
                     </div>

                     <div style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0))`, borderRadius: 20, border: `1px solid ${C.accent}30`, padding: '28px' }}>
                        <ShieldAlert size={32} color={C.accent} style={{ marginBottom: 20 }} />
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Commit Changes</h3>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: C.textDim, lineHeight: 1.5, marginBottom: 24 }}>System-wide settings impact all user and supplier sessions. Verification is required before applying.</p>
                        
                        {error && <p style={{ color: C.red, fontSize: 12, marginBottom: 16 }}>{error}</p>}
                        {success && <p style={{ color: C.green, fontSize: 12, marginBottom: 16 }}>{success}</p>}

                        <button 
                          onClick={handleSave} 
                          disabled={saving}
                          style={{ width: '100%', padding: '14px', borderRadius: 12, background: C.accent, color: 'white', fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(59,130,246,0.2)' }}
                        >
                          {saving ? 'SYNCING...' : 'APPLY CONFIGURATION'}
                        </button>
                     </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
