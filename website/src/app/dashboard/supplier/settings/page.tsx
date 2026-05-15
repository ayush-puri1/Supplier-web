'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import {
  LayoutDashboard, Package, ShoppingCart, User, Bell, Settings, LogOut,
  Shield, BellRing, PhoneCall, Trash2, Mail, MessageCircle, AlertTriangle, Check, X, Eye, EyeOff
} from 'lucide-react';

/* ════════ SIDEBAR ════════ */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: false },
    { label: 'Orders',           icon: <ShoppingCart size={16} />,    href: '/dashboard/supplier/orders',        active: false },
    { label: 'Business Profile', icon: <User size={16} />,            href: '/dashboard/supplier/profile',       active: false },
    { label: 'Notifications',    icon: <Bell size={16} />,            href: '/dashboard/supplier/notifications', active: false },
    { label: 'Settings',         icon: <Settings size={16} />,        href: '/dashboard/supplier/settings',      active: true  },
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

/* ════════ REUSABLE UI ════════ */
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 8,
};
const baseInput: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.28)' }}>{icon}</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)' }}>{title}</span>
      </div>
      <div style={{ padding: '24px 20px' }}>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 400 }}>{description}</p>
      </div>
      <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#3B82F6' : 'rgba(255,255,255,0.1)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.3s cubic-bezier(.22,1,.36,1)' }} />
      </button>
    </div>
  );
}

/* ════════ MAIN PAGE ════════ */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Profile state (loaded from API)
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileCountry, setProfileCountry] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Notification toggles (UI-only preferences)
  const [toggles, setToggles] = useState({ email: true, sms: false, app: true });

  // Load profile from /supplier/me
  useEffect(() => {
    fetchWithAuth('/supplier/me')
      .then((data: any) => {
        setProfileEmail(data?.user?.email || user?.email || '');
        setProfileCity(data?.city || '');
        setProfileCountry(data?.country || '');
      })
      .catch(() => {
        setProfileEmail(user?.email || '');
      });
  }, [user]);

  const handleChangePassword = async () => {
    if (!currentPassword || newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true); setPwError(''); setPwSuccess('');
    try {
      await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPwSuccess('Password updated successfully.');
      setCurrentPassword(''); setNewPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .anim-up { animation:fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
        .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .settings-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:white; font-family:'DM Sans',sans-serif; font-size:14px; padding:12px 14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .settings-input:focus { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
        .settings-input:disabled { color:rgba(255,255,255,0.35); cursor:not-allowed; background:rgba(255,255,255,0.025); }
        .pw-wrap { position:relative; }
        .pw-wrap input { padding-right:44px; }
        .pw-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); display:flex; align-items:center; }
        .pw-eye:hover { color:white; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Account Settings</span>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 80px' }}>
            <div className="anim-up" style={{ maxWidth: 760, margin: '0 auto' }}>

              <div style={{ marginBottom: 26 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Settings</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Manage your account preferences, security, and support.</p>
              </div>

              {/* 1. Account Info (read-only, from API) */}
              <Section title="Account Info" icon={<User size={14} />}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input className="settings-input" value={profileEmail} disabled />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input className="settings-input" value={profileCity || '—'} disabled />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input className="settings-input" value={profileCountry || '—'} disabled />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                      To update your business details, visit the{' '}
                      <a href="/dashboard/supplier/profile" style={{ color: '#60A5FA', textDecoration: 'none' }}>Business Profile</a> page.
                    </p>
                  </div>
                </div>
              </Section>

              {/* 2. Security — live password change */}
              <Section title="Security" icon={<Shield size={14} />}>
                {pwError && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <X size={14} color="#F87171" />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#F87171' }}>{pwError}</span>
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={14} color="#34D399" />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#34D399' }}>{pwSuccess}</span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <div className="pw-wrap">
                      <input
                        className="settings-input"
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button className="pw-eye" onClick={() => setShowCurrent(p => !p)}>
                        {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div className="pw-wrap">
                      <input
                        className="settings-input"
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                      />
                      <button className="pw-eye" onClick={() => setShowNew(p => !p)}>
                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="btn-hover"
                  onClick={handleChangePassword}
                  disabled={pwLoading || !currentPassword || newPassword.length < 6}
                  style={{ padding: '12px 24px', borderRadius: 10, background: pwLoading || !currentPassword || newPassword.length < 6 ? 'rgba(255,255,255,0.06)' : '#2563EB', color: pwLoading || !currentPassword || newPassword.length < 6 ? 'rgba(255,255,255,0.3)' : 'white', fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, border: 'none', cursor: pwLoading || !currentPassword || newPassword.length < 6 ? 'not-allowed' : 'pointer', boxShadow: !pwLoading && currentPassword && newPassword.length >= 6 ? '0 0 16px rgba(37,99,235,0.3)' : 'none', transition: 'all 0.2s' }}
                >
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </Section>

              {/* 3. Notifications (UI preferences only) */}
              <Section title="Notifications" icon={<BellRing size={14} />}>
                <Toggle checked={toggles.email} onChange={() => setToggles({ ...toggles, email: !toggles.email })} label="Email Notifications" description="Receive updates on orders, product approvals, and account status." />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                <Toggle checked={toggles.sms} onChange={() => setToggles({ ...toggles, sms: !toggles.sms })} label="SMS Alerts" description="Get urgent text messages for new orders to avoid missed deadlines." />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                <Toggle checked={toggles.app} onChange={() => setToggles({ ...toggles, app: !toggles.app })} label="In-App Sounds" description="Play a notification sound when a new order arrives while the dashboard is open." />
              </Section>

              {/* 4. Support */}
              <Section title="Help & Support" icon={<MessageCircle size={14} />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <a href="mailto:ayush@delraw.com" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(96,165,250,0.1)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>Email Support</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>ayush@delraw.com</p>
                    </div>
                  </a>
                  <a href="tel:+918146729779" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneCall size={18} /></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>Call Us</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>+91 81467 29779</p>
                    </div>
                  </a>
                  <a href="https://wa.me/918146729779" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} /></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>WhatsApp</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Quick chat</p>
                    </div>
                  </a>
                </div>
              </Section>

              {/* 5. Danger Zone */}
              <div style={{ marginTop: 40, padding: '24px', borderRadius: 14, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <AlertTriangle size={16} color="#F87171" />
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#F87171' }}>Danger Zone</p>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  Take actions to manage your session or permanently remove your account from the system.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { logout?.(); router.push('/login'); }} className="btn-hover" style={{ flex: 1, padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                    <LogOut size={16} /> Sign Out of Account
                  </button>
                  <button className="btn-hover" style={{ flex: 1, padding: '14px', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                    <Trash2 size={16} /> Delete Account Permanently
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
