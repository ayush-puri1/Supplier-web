'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        padding: '48px 32px',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#ef4444'
        }}>
          <ShieldAlert size={40} />
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'white',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          Access Denied
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: 'var(--text-dim)',
          marginBottom: '32px',
          lineHeight: 1.6
        }}>
          You don't have permission to access this area. If you believe this is an error, please contact your administrator or try logging in again.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}>
              <Home size={18} />
              Return to Dashboard
            </button>
          </Link>
          
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'transparent',
              color: 'var(--text-dim)',
              fontWeight: 600,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <ArrowLeft size={18} />
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
