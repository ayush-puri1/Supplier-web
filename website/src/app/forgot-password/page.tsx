'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';
import OTPInput from '@/components/ui/OTPInput';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchWithAuth('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStep(2);
      setSuccess("We've sent a 6-digit verification code to your email.");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await fetchWithAuth('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setSuccess('Password successfully reset! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reset password');
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
        body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; }

        .fp-input {
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
        .fp-input::placeholder { color: rgba(255,255,255,0.2); }
        .fp-input:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .fp-btn {
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
        .fp-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 0 40px rgba(37,99,235,0.55);
        }
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-logo  { animation: fadeInUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .anim-card  { animation: fadeInUp 0.6s 0.1s cubic-bezier(.22,1,.36,1) both; }
        .anim-foot  { animation: fadeInUp 0.6s 0.2s cubic-bezier(.22,1,.36,1) both; }
        .step-anim  { animation: fadeInUp 0.4s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#101014',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '52px 24px 40px',
        fontFamily: 'var(--font-body)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'rgba(37,99,235,0.06)', borderRadius: '50%', filter: 'blur(140px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 360, height: 360, background: 'rgba(37,99,235,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        {/* ── TOP: Logo ── */}
        <div className="anim-logo" style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.55)' }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white' }}>Delraw</span>
          </Link>
        </div>

        {/* ── MIDDLE: Card ── */}
        <div className="anim-card" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
          <div style={{
            background: '#16161D',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 36px 36px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
          }}>

            {/* Step 1 — Email */}
            {step === 1 && (
              <div className="step-anim">
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.02em', textAlign: 'center' }}>
                  Reset your password
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 32, lineHeight: 1.65, textAlign: 'center', maxWidth: 320, margin: '0 auto 32px' }}>
                  Enter your email address and we'll send you a secure code to regain access to your supplier portal.
                </p>

                {error && <div style={{ marginBottom: 20 }}><AlertBanner type="error" message={error} onClose={() => setError('')} /></div>}

                <form onSubmit={handleSendCode}>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                      Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        className="fp-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? 'Sending code…' : <>Send Code <ArrowRight size={15} /></>}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
                  Remember your password?{' '}
                  <Link href="/login" style={{ color: 'var(--blue-400)', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
                    onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
                  >Back to sign in</Link>
                </p>
              </div>
            )}

            {/* Step 2 — OTP + New Password */}
            {step === 2 && (
              <div className="step-anim">
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.02em', textAlign: 'center' }}>
                  Reset password
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, textAlign: 'center', marginBottom: 32 }}>
                  Enter the code sent to{' '}
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{email}</span>{' '}
                  and choose a new password.
                </p>

                {error && <div style={{ marginBottom: 20 }}><AlertBanner type="error" message={error} onClose={() => setError('')} /></div>}

                {success && !error && (
                  <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={15} color="#34D399" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#34D399' }}>{success}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  {/* OTP */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14, textAlign: 'center' }}>
                      Verification Code
                    </label>
                    <div className="otp-dark">
                      <OTPInput value={otp} onChange={setOtp} />
                    </div>
                  </div>

                  {/* New Password */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="fp-input"
                        style={{ paddingRight: 44 }}
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        {showNew ? <EyeOff size={15} color="rgba(255,255,255,0.25)" /> : <Eye size={15} color="rgba(255,255,255,0.25)" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="fp-input"
                        style={{ paddingRight: 44 }}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        {showConfirm ? <EyeOff size={15} color="rgba(255,255,255,0.25)" /> : <Eye size={15} color="rgba(255,255,255,0.25)" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? 'Resetting password…' : <>Reset Password <ArrowRight size={15} /></>}
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)', marginTop: 24 }}>
                  <Link href="/login" style={{ color: 'var(--blue-400)', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
                    onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
                  >← Back to sign in</Link>
                </p>
              </div>
            )}
          </div>

          {/* End-to-end encryption badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <Shield size={13} color="rgba(255,255,255,0.18)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
              End-to-end encryption
            </span>
          </div>
        </div>

        {/* ── BOTTOM: Footer ── */}
        <div className="anim-foot" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
            © 2026 Delraw. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Support'].map(item => (
              <a key={item} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
              >{item}</a>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
