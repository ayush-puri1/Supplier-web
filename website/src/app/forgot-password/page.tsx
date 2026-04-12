'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, Shield, CheckCircle2, Eye, EyeOff, RefreshCw, ArrowLeft } from 'lucide-react';
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
          padding: 14px 16px 14px 46px;
        }
        .fp-input::placeholder { color: rgba(255,255,255,0.18); }
        .fp-input:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .fp-btn {
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
        .fp-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 0 40px rgba(37,99,235,0.55);
        }
        .fp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .fp-ghost {
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
        .fp-ghost:hover:not(:disabled) {
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
            <div style={{ marginBottom: 16 }}>
              <AlertBanner type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {/* Success */}
          {success && !error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
            }}>
              <CheckCircle2 size={15} color="#34D399" style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#34D399', lineHeight: 1.4 }}>{success}</span>
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Reset your password
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 24, lineHeight: 1.6 }}>
                Enter your email address and we'll send you a secure code to regain access to your supplier portal.
              </p>

              <form onSubmit={handleSendCode}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required className="fp-input" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="fp-btn">
                  {loading ? 'Sending code…' : <>Send Code <ArrowRight size={15} /></>}
                </button>
              </form>

              {/* Encrypted badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                <Shield size={12} color="rgba(255,255,255,0.15)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.15)' }}>
                  End-to-end encrypted connection
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 2: OTP + New Password ── */}
          {step === 2 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Reset password
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 24, lineHeight: 1.6 }}>
                Enter the code sent to{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{email}</span>{' '}
                and choose a new password.
              </p>

              <form onSubmit={handleResetPassword}>
                {/* OTP */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 12, textAlign: 'center' }}>
                    Verification Code
                  </label>
                  <div className="otp-dark" style={{ display: 'flex', justifyContent: 'center' }}>
                    <OTPInput value={otp} onChange={setOtp} />
                  </div>
                </div>

                {/* New Password */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required className="fp-input" style={{ paddingRight: 46 }} />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="fp-input" style={{ paddingRight: 46 }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="fp-btn" style={{ marginBottom: 10 }}>
                  {loading ? 'Resetting password…' : <>Reset Password <ArrowRight size={15} /></>}
                </button>
              </form>

              <button onClick={() => { setStep(1); setError(''); setSuccess(''); }} className="fp-ghost">
                <ArrowLeft size={14} />
                Back to email
              </button>
            </div>
          )}
        </div>

        {/* Footer: Sign in link */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 24, position: 'relative', zIndex: 2 }}>
          Remember your password?{' '}
          <Link href="/login" style={{ fontWeight: 700, color: 'var(--blue-400)', textDecoration: 'none' }}
            onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
            onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
          >
            Sign in
          </Link>
        </p>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, position: 'relative', zIndex: 2 }}>
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
