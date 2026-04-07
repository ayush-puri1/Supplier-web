'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { ArrowRight, Check, Mail, Lock, RefreshCw, Building2, Eye, EyeOff } from 'lucide-react';
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
          padding: 13px 16px 13px 44px;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.2); }
        .reg-input:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .reg-input-plain {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          padding: 13px 16px;
        }
        .reg-input-plain::placeholder { color: rgba(255,255,255,0.2); }
        .reg-input-plain:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .reg-btn {
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
        .reg-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 0 40px rgba(37,99,235,0.55);
        }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ghost-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: rgba(255,255,255,0.3);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .ghost-btn:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.55);
        }
        .ghost-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-anim { animation: fadeInUp 0.4s cubic-bezier(.22,1,.36,1) both; }

        /* OTP override for dark theme */
        .otp-dark input {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
          color: white !important;
          font-family: var(--font-heading) !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          width: 48px !important;
          height: 56px !important;
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
        minHeight: '100vh',
        background: '#101014',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: 'var(--font-body)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'rgba(37,99,235,0.06)', borderRadius: '50%', filter: 'blur(140px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -150, right: -100, width: 400, height: 400, background: 'rgba(37,99,235,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.55)' }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white' }}>Delraw</span>
        </Link>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && (
                <div style={{ width: 72, height: 1, background: step > i ? 'var(--blue-600)' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s', position: 'relative' }}>
                  {step > i && <div style={{ position: 'absolute', inset: 0, background: 'var(--blue-500)', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }} />}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700,
                  transition: 'all 0.3s',
                  background: step > s ? 'var(--blue-600)' : step === s ? 'var(--blue-600)' : 'rgba(255,255,255,0.05)',
                  color: step >= s ? 'white' : 'rgba(255,255,255,0.25)',
                  border: step === s ? '1px solid rgba(59,130,246,0.4)' : step > s ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: step === s ? '0 0 20px rgba(37,99,235,0.45)' : 'none',
                }}>
                  {step > s ? <Check size={15} /> : s}
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: step >= s ? 'var(--blue-400)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.3s',
                }}>
                  {stepLabels[i]}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 460,
          background: '#16161D',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '36px 36px 32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
          position: 'relative', zIndex: 1,
        }}>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20 }}>
              <AlertBanner type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="step-anim">
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Create your account
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 28, lineHeight: 1.6 }}>
                Join the elite network of verified suppliers and global buyers.
              </p>

              <form onSubmit={handleStep1}>
                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" required className="reg-input" />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="reg-input" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showPassword ? <EyeOff size={15} color="rgba(255,255,255,0.25)" /> : <Eye size={15} color="rgba(255,255,255,0.25)" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="reg-input" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showConfirm ? <EyeOff size={15} color="rgba(255,255,255,0.25)" /> : <Eye size={15} color="rgba(255,255,255,0.25)" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="reg-btn">
                  {loading ? 'Sending code…' : <>Continue <ArrowRight size={15} /></>}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>Security Verified</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--blue-400)', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
                  onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
                >Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="step-anim">
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Check your email
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 32, lineHeight: 1.6 }}>
                We sent a 6-digit code to{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{email}</span>
              </p>

              <form onSubmit={handleStep2}>
                <div className="otp-dark" style={{ marginBottom: 28 }}>
                  <OTPInput value={otp} onChange={setOtp} />
                </div>
                <button type="submit" disabled={loading} className="reg-btn" style={{ marginBottom: 12 }}>
                  {loading ? 'Verifying…' : <>Verify Code <ArrowRight size={15} /></>}
                </button>
              </form>

              <button onClick={handleResendOTP} disabled={loading} className="ghost-btn">
                <RefreshCw size={13} />
                Resend code
              </button>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="step-anim">
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Tell us about your business
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 28, lineHeight: 1.6 }}>
                You can add more details from your supplier dashboard later.
              </p>

              <form onSubmit={handleStep3}>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Business Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" required className="reg-input" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="reg-btn">
                  {loading ? 'Setting up…' : <>Go to Dashboard <ArrowRight size={15} /></>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: 28, marginTop: 32, position: 'relative', zIndex: 1 }}>
          {['Privacy Policy', 'Terms of Service', 'Help Center'].map(item => (
            <a key={item} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.18)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
            >{item}</a>
          ))}
        </div>
      </div>
    </>
  );
}
