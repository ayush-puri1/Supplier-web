'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, User, Bell, Settings, LogOut,
  Camera, Shield, BellRing, PhoneCall, Trash2, Mail, MessageCircle, AlertTriangle
} from 'lucide-react';

/* ════════ SIDEBAR ════════ */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: false },
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

function Field({ label, value, type = 'text', onChange }: { label: string; value: string; type?: string; onChange?: (v: string) => void }) {
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none';
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} style={baseInput} onFocus={onFocus} onBlur={onBlur} />
    </div>
  );
}

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
  const { logout } = useAuth();
  const router = useRouter();

  const [toggles, setToggles] = useState({
    email: true,
    sms: false,
    app: true,
  });

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
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <header style={{ height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Account Settings</span>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 80px' }}>
            <div className="anim-up" style={{ maxWidth: 760, margin: '0 auto' }}>

              {/* Page heading */}
              <div style={{ marginBottom: 26 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Settings</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Manage your account preferences, security, and support.</p>
              </div>

              {/* 1. Profile / Personal Info */}
              <Section title="Personal Info" icon={<User size={14} />}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}
                       onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#3B82F6'; }}
                       onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                    <Camera size={18} style={{ marginBottom: 4 }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Upload</span>
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Full Name" value="Store Owner" />
                    <Field label="Contact Email" value="supplier@delraw.com" />
                    <Field label="Location" value="New Delhi, India" />
                  </div>
                </div>
              </Section>

              {/* 2. Security */}
              <Section title="Security" icon={<Shield size={14} />}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
                  <Field label="Current Password" type="password" value="********" />
                  <Field label="New Password" type="password" value="" />
                  <button className="btn-hover" style={{ height: 45, width: '100%', borderRadius: 10, background: '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 0 16px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}>
                    Update Password
                  </button>
                </div>
              </Section>

              {/* 3. Notifications */}
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
                  {/* Email */}
                  <a href="mailto:support@delraw.com" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(96,165,250,0.1)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>Email Support</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>ayush@delraw.com</p>
                    </div>
                  </a>
                  {/* Call */}
                  <a href="tel:+918146729779" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneCall size={18} /></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>Call Us</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>+91 81467 29779</p>
                    </div>
                  </a>
                  {/* WhatsApp */}
                  <a href="https://wa.me/918146729779" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} /></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>WhatsApp</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Quick chat</p>
                    </div>
                  </a>
                </div>
              </Section>

              {/* 5. Danger Zone */}
              <div style={{ marginTop: 40, padding: '24px', borderRadius: 14, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <AlertTriangle size={16} color="#F87171" />
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: '#F87171' }}>Danger Zone</p>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  Take actions to manage your session or permanently remove your account from the system.
                </p>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { logout?.(); router.push('/login'); }} className="btn-hover" style={{ flex: 1, padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                    <LogOut size={16} /> Sign Out of Account
                  </button>
                  <button className="btn-hover" style={{ flex: 1, padding: '14px', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
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
