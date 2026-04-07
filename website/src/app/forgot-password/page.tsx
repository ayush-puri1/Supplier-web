'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, Shield, CheckCircle2 } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';
import OTPInput from '@/components/ui/OTPInput';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
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

        body {
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        .auth-input {
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
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: var(--blue-500);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .auth-btn {
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
        .auth-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 0 40px rgba(37,99,235,0.55);
        }
        .auth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-left  { animation: fadeInLeft  0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-right { animation: fadeInRight 0.7s 0.1s cubic-bezier(.22,1,.36,1) both; }
        .anim-up    { animation: fadeInUp    0.6s cubic-bezier(.22,1,.36,1) both; }
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

          {/* Middle: Brand Message */}
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
              &ldquo;Security and trust are at the core of every connection.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}>Advanced Encryption Standard.</span>
            </div>
          </div>

          {/* Bottom: Support Link */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
              Need help? <Link href="/support" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>Contact Security Team</Link>
            </p>
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="anim-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', background: '#111116', position: 'relative' }}>

          {/* Top-right corner badge */}
          <div style={{ position: 'absolute', top: 28, right: 28, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>Secure session</span>
          </div>

          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} id="mobile-logo">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.5)' }}>
                <span style={{ color: 'white', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'white' }}>Delraw</span>
            </div>

            {step === 1 ? (
              <div key="step-1" className="anim-up">
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>Forgot password?</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 36, lineHeight: 1.6 }}>
                  No worries, enter your email and we'll send you a 6-digit code to reset your password.
                </p>

                {error && <div style={{ marginBottom: 24 }}><AlertBanner type="error" message={error} onClose={() => setError('')} /></div>}

                <form onSubmit={handleSendCode}>
                  <div style={{ marginBottom: 28 }}>
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
                        className="auth-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? 'Sending code…' : <>Send Reset Code <ArrowRight size={15} /></>}
                  </button>
                </form>
              </div>
            ) : (
              <div key="step-2" className="anim-up">
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>Reset password</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, lineHeight: 1.6 }}>
                  Enter the code we sent to <span style={{ color: 'white', fontWeight: 600 }}>{email}</span> and choose a new password.
                </p>

                {error && <div style={{ marginBottom: 24 }}><AlertBanner type="error" message={error} onClose={() => setError('')} /></div>}
                {success && !error && (
                  <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} color="#34D399" />
                    <span style={{ fontSize: 13, color: '#34D399' }}>{success}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16, textAlign: 'center' }}>
                      Verification Code
                    </label>
                    <OTPInput value={otp} onChange={setOtp} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="auth-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="auth-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? 'Resetting password…' : <>Reset Password <ArrowRight size={15} /></>}
                  </button>
                </form>
              </div>
            )}

            {/* Back to login */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 28 }}>
              Remembered your password?{' '}
              <Link href="/login" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--blue-400)', textDecoration: 'none' }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-300)')}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
              >
                Back to sign in
              </Link>
            </p>

            {/* Trust badges */}
            <div style={{ marginTop: 52, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: 16 }}>
                Secure Reset Protocol
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <Shield size={18} color="rgba(255,255,255,0.1)" />
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
