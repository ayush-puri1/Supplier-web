'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { ArrowRight, Mail, Lock, Shield } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = res.data || res;
      localStorage.setItem('refresh_token', data.refresh_token);
      login(data.access_token, data.user);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400;1,6..96,700;1,6..96,900&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        :root {
          --font-display: 'Bodoni Moda', serif;
          --font-heading: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --blue-600: #2563EB;
          --blue-500: #3B82F6;
          --blue-400: #60A5FA;
          --blue-300: #93C5FD;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          padding: 13px 16px 13px 44px;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.2); }
        .login-input:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: var(--blue-600);
          color: white;
          font-family: var(--font-heading);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 0 28px rgba(37,99,235,0.4);
        }
        .login-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 0 40px rgba(37,99,235,0.55);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .checkbox-custom {
          width: 17px; height: 17px;
          border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .checkbox-custom.checked {
          border-color: var(--blue-500);
          background: var(--blue-600);
        }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .anim-left  { animation: fadeInLeft  0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-right { animation: fadeInRight 0.7s 0.1s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)', background: '#101014' }}>

        {/* ===== LEFT PANEL ===== */}
        <div className="anim-left" style={{
          display: 'none',
          width: '48%',
          background: 'linear-gradient(145deg, #1a3a6e 0%, #0f2147 40%, #091530 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 52px',
        }}
          // Show on lg via inline media approach — we'll use a style tag below
          id="left-panel"
        >
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: -120, right: -120, width: 420, height: 420, background: 'rgba(37,99,235,0.18)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, background: 'rgba(37,99,235,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
          {/* Dot grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

          {/* Top: Logo */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.6)' }}>
                <span style={{ color: 'white', fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Supplier Excellence</div>
              </div>
            </Link>
          </div>

          {/* Middle: Quote */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.2vw, 44px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'white',
              lineHeight: 1.25,
              marginBottom: 28,
              letterSpacing: '-0.01em',
            }}>
              &ldquo;The fastest way to verify and onboard quality suppliers.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}>Modernizing the Global Supply Chain.</span>
            </div>
          </div>

          {/* Bottom: Stats */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 48 }}>
            {[
              { value: '12k+', label: 'VERIFIED PARTNERS' },
              { value: '0.8s', label: 'AVG LATENCY' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="anim-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', background: '#111116', position: 'relative' }}>

          {/* Top-right corner badge */}
          <div style={{ position: 'absolute', top: 28, right: 28, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>Secure connection</span>
          </div>

          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} id="mobile-logo">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.5)' }}>
                <span style={{ color: 'white', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'white' }}>Delraw</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>Welcome back</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 36, lineHeight: 1.6 }}>
              Enter your credentials to access the supplier dashboard.
            </p>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 24 }}>
                <AlertBanner type="error" message={error} onClose={() => setError('')} />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--blue-400)', textDecoration: 'none', letterSpacing: '0.06em' }}
                    onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
                    onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
                  >
                    FORGOT?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, cursor: 'pointer' }} onClick={() => setRemember(!remember)}>
                <div className={`checkbox-custom${remember ? ' checked' : ''}`}>
                  {remember && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.35)', userSelect: 'none' }}>Remember this device for 30 days</span>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'Signing in…' : <>Sign in to Dashboard <ArrowRight size={15} /></>}
              </button>
            </form>

            {/* Register link */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 28 }}>
              New to Delraw?{' '}
              <Link href="/register" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--blue-400)', textDecoration: 'none' }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
              >
                Request portal access
              </Link>
            </p>

            {/* Trust badges */}
            <div style={{ marginTop: 52, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: 16 }}>
                Trusted Security Protocol
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={15} color="rgba(255,255,255,0.2)" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive: show left panel on large screens */}
        <style>{`
          @media (min-width: 1024px) {
            #left-panel { display: flex !important; }
            #mobile-logo { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}
