'use client';

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { Shield, Bell, Package, ArrowRight, ChevronRight, Check, Zap, Globe, BarChart3, Lock, FileCheck, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* ===== GOOGLE FONTS ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400;1,6..96,700;1,6..96,900&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');


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
          background: #101014;
          color: white;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp2 {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 0.95; transform: translateY(0); }
        }
        .anim-1 { animation: fadeInUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-2 { animation: fadeInUp 0.7s 0.18s cubic-bezier(.22,1,.36,1) both; }
        .anim-3 { animation: fadeInUp2 0.8s 0.38s cubic-bezier(.22,1,.36,1) both; }

        .dot-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0);
          background-size: 36px 36px;
        }

        .card {
          background: #16161D;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .card:hover {
          border-color: rgba(37,99,235,0.22);
          box-shadow: 0 0 32px rgba(37,99,235,0.06);
        }

        .icon-box {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.15);
          display: flex; align-items: center; justify-content: center;
          color: var(--blue-500);
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .card:hover .icon-box {
          background: var(--blue-600);
          color: white;
          box-shadow: 0 0 20px rgba(37,99,235,0.4);
        }

        .tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.04);
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: var(--blue-600);
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 30px rgba(37,99,235,0.4);
        }
        .btn-primary:hover {
          background: #1D4ED8;
          box-shadow: 0 0 48px rgba(37,99,235,0.55);
        }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.75);
        }

        .section-label {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(59,130,246,0.6);
          margin-bottom: 14px;
        }

        .display-heading {
          font-family: var(--font-display);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.01em;
        }

        .heading-syne {
          font-family: var(--font-heading);
          font-weight: 900;
          line-height: 1.25;
          letter-spacing: -0.05em;
        }

        .divider { border-top: 1px solid rgba(255,255,255,0.04); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#101014', color: 'white', fontFamily: 'var(--font-body)' }}>

        {/* ===== NAVBAR ===== */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(16,16,20,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)' }}>
                  <span style={{ color: 'white', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white' }}>Delraw</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {[['Platform', '#hero'], ['How it works', '#process'], ['Features', '#features'], ['Contact', '#cta']].map(([label, href], i) => (
                  <a key={label} href={href} style={{
                    padding: '7px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 8,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    color: i === 0 ? 'var(--blue-400)' : 'rgba(255,255,255,0.38)',
                    background: i === 0 ? 'rgba(37,99,235,0.1)' : 'transparent',
                  }}
                    onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { if (i !== 0) { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)'; } }}
                    onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { if (i !== 0) { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.38)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; } }}
                  >{label}</a>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', padding: '8px 16px', transition: 'color 0.2s' }}>Log in</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '9px 22px', fontSize: 13, borderRadius: 999 }}>Get Started →</Link>
            </div>
          </div>
        </nav>

        {/* ===== HERO ===== */}
        <section id="hero" style={{ position: 'relative', minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '136px 28px 180px', overflow: 'hidden' }}>
          {/* Dot grid */}
          <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 1 }} />
          {/* Glows */}
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, background: 'rgba(37,99,235,0.08)', borderRadius: '50%', filter: 'blur(140px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 220, right: -180, width: 380, height: 380, background: 'rgba(124,58,237,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

          <div className="anim-1" style={{ position: 'relative', zIndex: 10, maxWidth: 900, width: '100%', margin: '0 auto', textAlign: 'center' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', marginBottom: 48, boxShadow: '0 0 20px rgba(37,99,235,0.1)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-500)', boxShadow: '0 0 6px rgba(59,130,246,0.9)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue-300)', fontFamily: 'var(--font-body)' }}>Built for verified suppliers across India</span>
              <ChevronRight size={12} color="var(--blue-400)" />
            </div>

            {/* Headline */}
            <h1 className="display-heading" style={{ fontSize: 'clamp(44px, 7vw, 84px)', marginBottom: 28, color: 'white' }}>
              Connect Suppliers<br />
              to Your{' '}
              <span style={{ background: 'linear-gradient(90deg, var(--blue-500), var(--blue-400), #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 28px rgba(59,130,246,0.4))' }}>Platform</span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'rgba(255,255,255,0.3)', maxWidth: 560, margin: '0 auto 52px', fontFamily: 'var(--font-body)' }}>
              Automate due diligence, risk assessment, and identity verification for global supply chains through a single editorial-grade interface.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <Link href="/register" className="btn-primary">Start Onboarding <ArrowRight size={15} /></Link>
              <Link href="/login" className="btn-secondary">About Case Studies</Link>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="anim-3" style={{ position: 'relative', zIndex: 10, maxWidth: 1000, width: '100%', margin: '72px auto 0' }}>
            <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', background: '#16161D', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(37,99,235,0.05)', overflow: 'hidden' }}>
              {/* Browser chrome */}
              <div style={{ height: 40, background: '#111116', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#EF4444', '#F59E0B', '#22C55E'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.5 }} />)}
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ padding: '4px 24px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-body)' }}>
                    delraw.in/dashboard
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ display: 'flex', background: '#111116' }}>
                {/* Sidebar */}
                <div style={{ width: 180, borderRight: '1px solid rgba(255,255,255,0.04)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(37,99,235,0.15)', color: 'var(--blue-400)', marginBottom: 4 }}>
                    <BarChart3 size={13} />
                    <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)' }}>Dashboard</span>
                  </div>
                  {['My Products', 'Business Profile', 'Documents'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                      <Package size={13} />
                      <span style={{ fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)' }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div style={{ flex: 1, padding: 20 }}>
                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'TOTAL SUPPLIERS', value: '1,281', change: '+12%' },
                      { label: 'VERIFIED RATE', value: '98.2%', change: '+3.1%' },
                      { label: 'ACTIVE AUDIT', value: '12', change: 'Live' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#1A1A22', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', padding: '14px 16px' }}>
                        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>{stat.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'white' }}>{stat.value}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue-500)' }}>{stat.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div style={{ background: '#1A1A22', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>Recent Verifications</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue-400)', fontFamily: 'var(--font-body)' }}>View all →</span>
                    </div>
                    {[
                      { name: 'Apex Industries', sub: 'Compliance check', status: 'VERIFIED', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
                      { name: 'Lockdown Mfg', sub: 'Compliance check', status: 'PENDING', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
                      { name: 'Smith Exports', sub: 'Compliance check', status: 'VERIFIED', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
                    ].map(item => (
                      <div key={item.name} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={12} color="var(--blue-500)" />
                          </div>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-body)' }}>{item.name}</p>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>{item.sub}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 999, color: item.color, background: item.bg }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow below mockup */}
            <div style={{ position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 200, background: 'rgba(37,99,235,0.05)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
          </div>
        </section>

        {/* ===== THE PROCESS ===== */}
        <section id="process" className="divider" style={{ padding: '120px 28px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <p className="section-label">THE LEDGER PROCESS</p>
              <h2 className="heading-syne" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: 'white' }}>
                Built for High-Trust<br />Ecosystems.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
              {[
                { step: '01', title: 'Onboard', desc: 'Suppliers submit a Master Service Agreement along with identity and auditing documents for review.', icon: <Shield size={18} /> },
                { step: '02', title: 'Verify', desc: 'Our algorithms cross-checks identity, GST validation, and compliance status across global databases.', icon: <BarChart3 size={18} /> },
                { step: '03', title: 'Trust', desc: 'Auto-verified identity and trust certificates posted, cross-referenced, and verified automatically.', icon: <Globe size={18} /> },
              ].map((item, i) => (
                <div key={i} className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
                  <span className="heading-syne" style={{ fontSize: 96, color: 'rgba(255,255,255,0.02)', position: 'absolute', top: -6, right: 8, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{item.step}</span>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="icon-box" style={{ marginBottom: 24 }}>{item.icon}</div>
                    <h3 className="heading-syne" style={{ fontSize: 20, color: 'white', marginBottom: 12 }}>{item.title}</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.24)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 52 }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--blue-400)', textDecoration: 'none', transition: 'color 0.2s' }}>
                Explore Our Protocol <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" className="divider" style={{ padding: '120px 28px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 72 }}>
              <p className="section-label">CAPABILITIES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
                <h2 className="heading-syne" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: 'white', maxWidth: 520, lineHeight: 1.1 }}>
                  Security as a Competitive Advantage
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', maxWidth: 320, lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
                  Advanced features that power the world's leading supplier marketplaces and procurement platforms.
                </p>
              </div>
            </div>

            {/* Top row — 3 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
              {[
                { icon: <Shield size={18} />, title: 'Real-time Risk Intelligence', desc: 'Continuous monitoring of your entire supplier base to address supply-chain fragility and redundancy.', bullets: ['Anti-Money Laundering Checks', 'KYC Compliance Audit'] },
                { icon: <Bell size={18} />, title: 'Sentinel / Alerts', desc: 'Predictive intelligence that notifies your procurement team of potential delays before they impact customers.', bullets: ['Geopolitical Risk Updates', 'Smart Weather Routing'] },
                { icon: <Zap size={18} />, title: 'Atomic Logistics', desc: 'A headless logistics engine that integrates directly into your existing workflow via robust API endpoints.', bullets: ['Multi-Carrier Aggregation', 'Automated Custom Clearing'] },
              ].map((item, i) => (
                <div key={i} className="card" style={{ padding: 28 }}>
                  <div className="icon-box" style={{ marginBottom: 20 }}>{item.icon}</div>
                  <h3 className="heading-syne" style={{ fontSize: 17, color: 'white', marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7, marginBottom: 20, fontFamily: 'var(--font-body)' }}>{item.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {item.bullets.map(b => (
                      <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)' }}>
                        <Check size={13} color="var(--blue-500)" style={{ flexShrink: 0 }} />{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom row — 2 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {/* Global Compliance */}
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div className="icon-box"><FileCheck size={18} /></div>
                  <div>
                    <h3 className="heading-syne" style={{ fontSize: 17, color: 'white', marginBottom: 10 }}>Global Compliance</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7, marginBottom: 16, fontFamily: 'var(--font-body)' }}>
                      GST, PAN, MSME, ISO certifications — verified and filed automatically across Indian and international regulatory frameworks.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['GST Verification', 'PAN Validation', 'MSME Registry', 'ISO Audit'].map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unified API — highlighted */}
              <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, #16161D 60%)', borderRadius: 16, border: '1px solid rgba(37,99,235,0.22)', padding: 28, boxShadow: '0 0 40px rgba(37,99,235,0.07)', transition: 'border-color 0.4s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 22px rgba(37,99,235,0.45)' }}>
                    <Lock size={18} color="white" />
                  </div>
                  <div>
                    <h3 className="heading-syne" style={{ fontSize: 17, color: 'white', marginBottom: 10 }}>Unified API Gateway</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', lineHeight: 1.7, marginBottom: 20, fontFamily: 'var(--font-body)' }}>
                      Connect with the Delraw trust ledger via our RESTful API. Push supplier data, pull verification results, all through one endpoint.
                    </p>
                    <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'var(--blue-600)', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 20px rgba(37,99,235,0.32)', transition: 'background 0.2s', fontFamily: 'var(--font-body)' }}>
                      Documentation <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section id="cta" className="divider" style={{ padding: '140px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 360, background: 'rgba(37,99,235,0.07)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <h2 className="display-heading" style={{ fontSize: 'clamp(30px, 5vw, 62px)', color: 'white', marginBottom: 22, lineHeight: 1.1 }}>
              Elevate your supply chain<br />
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>from </span>
              <span style={{ background: 'linear-gradient(90deg, var(--blue-500), #818CF8, var(--blue-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic', filter: 'drop-shadow(0 0 28px rgba(59,130,246,0.35))' }}>operation to asset.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.24)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
              Join 200+ verified suppliers and enterprise platforms already using Delraw to simplify business onboarding.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <Link href="/register" className="btn-primary">Get Started Now <ArrowRight size={15} /></Link>
              <Link href="/login" className="btn-secondary">View API Docs</Link>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="divider" style={{ padding: '80px 28px 40px', background: '#0C0C10' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 36, marginBottom: 64 }}>
              {/* Brand */}
              <div style={{ gridColumn: 'span 1' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(37,99,235,0.45)' }}>
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'white' }}>Delraw</span>
                </Link>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.14)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
                  The premier verification protocol for modern B2B marketplaces. Enterprise-grade trust for everybody, since 2024.
                </p>
              </div>

              {[
                { title: 'Platform', links: ['Verification', 'Marketplace', 'Security', 'Logistics'] },
                { title: 'Company', links: ['About Us', 'Customers', 'Careers', 'Press'] },
                { title: 'Resources', links: ['Documentation', 'Help Center', 'API Reference', 'Changelog'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Licenses'] },
              ].map(col => (
                <div key={col.title}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>{col.title}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.links.map(link => (
                      <li key={link}>
                        <a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
                          onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--blue-400)')}
                          onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                        >{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="divider" style={{ paddingTop: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)', fontFamily: 'var(--font-body)' }}>© 2026 Delraw Technologies. All rights reserved.</p>
              <div style={{ display: 'flex', gap: 24 }}>
                {['Privacy Policy', 'Terms of Service'].map(item => (
                  <a key={item} href="#" style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
                    onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.14)')}
                  >{item}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
