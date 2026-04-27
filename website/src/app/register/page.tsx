'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { ArrowRight, Check, Mail, Lock, RefreshCw, Building2, Eye, EyeOff, Shield } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';
import OTPInput from '@/components/ui/OTPInput';

export default function RegisterPage() {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2
  const [otp, setOtp] = useState('');

  // Step 3
  const [companyName, setCompanyName] = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await fetchWithAuth('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await fetchWithAuth('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, password, companyName: 'Pending Setup' }),
      });
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid code');
    } finally { setLoading(false); }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!companyName.trim()) { setError('Business name is required'); return; }
    setLoading(true);
    try {
      const res: any = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = res.data || res;
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      await fetchWithAuth('/supplier/me', { method: 'PATCH', body: JSON.stringify({ companyName }) });
      login(data.access_token, data.user);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to complete registration');
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await fetchWithAuth('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend code');
    } finally { setLoading(false); }
  };

  const stepLabels = ['Account', 'Verify', 'Business'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        :root {
          --font-display: 'Newsreader', serif;
          --font-heading: 'Newsreader', serif;
          --font-num: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --blue-600: #2563EB;
          --blue-500: #3B82F6;
          --blue-400: #60A5FA;
          --blue-300: #93C5FD;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; }

        .reg-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          padding: 14px 16px 14px 46px;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.18); }
        .reg-input:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .reg-btn {
          width: 100%;
          padding: 15px;
          background: var(--blue-600);
          color: white;
          font-family: var(--font-num);
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
        .reg-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 0 40px rgba(37,99,235,0.55);
        }
        .reg-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ghost-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .ghost-btn:hover:not(:disabled) {
          color: white;
          border-color: rgba(255,255,255,0.2);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-up { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }

        .otp-dark input {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
          color: white !important;
          font-family: var(--font-num) !important;
          font-size: 22px !important;
          font-weight: 700 !important;
          width: 50px !important;
          height: 58px !important;
          text-align: center !important;
          outline: none !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .otp-dark input:focus {
          border-color: var(--blue-500) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#111116', fontFamily: 'var(--font-body)',
        padding: '24px 24px', position: 'relative', overflow: 'hidden',
      }}>

        {/* Background effects */}
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, background: 'rgba(37,99,235,0.06)', borderRadius: '50%', filter: 'blur(140px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, background: 'rgba(37,99,235,0.03)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10, position: 'relative', zIndex: 2 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.55)' }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-num)' }}>D</span>
          </div>
          <span style={{ fontFamily: 'var(--font-num)', fontSize: 18, fontWeight: 700, color: 'white' }}>Delraw</span>
        </Link>

        {/* Step Indicator */}
        <div className="anim-up" style={{ display: 'flex', alignItems: 'center', marginBottom: 10, position: 'relative', zIndex: 2 }}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && (
                <div style={{
                  width: 56, height: 2, margin: '0 10px',
                  background: step > i ? 'var(--blue-500)' : 'rgba(255,255,255,0.07)',
                  borderRadius: 2,
                  transition: 'background 0.4s',
                  boxShadow: step > i ? '0 0 8px rgba(59,130,246,0.5)' : 'none',
                }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 700,
                  transition: 'all 0.3s',
                  ...(step > s
                    ? { background: 'var(--blue-500)', color: 'white' }
                    : step === s
                      ? { background: 'var(--blue-600)', color: 'white', border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 0 20px rgba(59,130,246,0.45)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.07)' }
                  ),
                }}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase' as const,
                  color: step >= s ? 'var(--blue-400)' : 'rgba(255,255,255,0.18)',
                  transition: 'color 0.3s',
                }}>
                  {stepLabels[i]}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="anim-up" style={{
          width: '100%', maxWidth: 440,
          background: '#161820', borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 20px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02)',
          position: 'relative', zIndex: 2,
        }}>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 24 }}>
              <AlertBanner type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Create your account
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 32, lineHeight: 1.6 }}>
                Join the elite network of verified suppliers and global buyers on the industry ledger.
              </p>

              <form onSubmit={handleStep1}>
                {/* Email */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required className="reg-input" />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="reg-input" style={{ paddingRight: 46 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="reg-input" style={{ paddingRight: 46 }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="reg-btn">
                  {loading ? 'Initializing...' : <>Continue <ArrowRight size={15} /></>}
                </button>
              </form>

              {/* Encrypted badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <Shield size={12} color="rgba(255,255,255,0.15)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.15)' }}>
                  End-to-end encrypted connection
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 2: OTP Verify ── */}
          {step === 2 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Verify identity
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 36, lineHeight: 1.6 }}>
                We sent a 6-digit access code to{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{email}</span>
              </p>

              <form onSubmit={handleStep2}>
                <div className="otp-dark" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                  <OTPInput value={otp} onChange={setOtp} />
                </div>
                <button type="submit" disabled={loading} className="reg-btn" style={{ marginBottom: 12 }}>
                  {loading ? 'Authenticating...' : <>Verify Code <ArrowRight size={15} /></>}
                </button>
              </form>

              <button onClick={handleResendOTP} disabled={loading} className="ghost-btn">
                <RefreshCw size={14} />
                Request new code
              </button>
            </div>
          )}

          {/* ── STEP 3: Business ── */}
          {step === 3 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Entity Designation
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 36, lineHeight: 1.6 }}>
                Supply your initial corporation identity. Full details can be added during dashboard onboarding.
              </p>

              <form onSubmit={handleStep3}>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    Corporate Entity Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Industries Ltd." required className="reg-input" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="reg-btn">
                  {loading ? 'Configuring Ledger...' : <>Access Workspace <ArrowRight size={15} /></>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer: Sign in link */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 32, position: 'relative', zIndex: 2 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 700, color: 'var(--blue-400)', textDecoration: 'none' }}
            onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
            onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
          >
            Sign in
          </Link>
        </p>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: 24, marginTop: 28, position: 'relative', zIndex: 2 }}>
          {['Privacy Policy', 'Terms of Service', 'Help Center'].map(item => (
            <a key={item} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.15)', textDecoration: 'none', textTransform: 'uppercase' as const, transition: 'color 0.2s' }}
              onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.15)')}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
