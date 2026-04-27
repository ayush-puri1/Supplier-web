'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

type BannerType = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  type: BannerType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const STYLES: Record<BannerType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
    text: '#34D399',
    icon: <CheckCircle2 size={15} color="#34D399" />,
  },
  error: {
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.2)',
    text: '#F87171',
    icon: <XCircle size={15} color="#F87171" />,
  },
  warning: {
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.2)',
    text: '#FBBF24',
    icon: <AlertTriangle size={15} color="#FBBF24" />,
  },
  info: {
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    text: '#60A5FA',
    icon: <Info size={15} color="#60A5FA" />,
  },
};

export default function AlertBanner({ type, message, onClose, className }: AlertBannerProps) {
  const style = STYLES[type];

  return (
    <div className={className} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      borderRadius: 12,
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.text,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      animation: 'fadeUp 0.4s cubic-bezier(.22,1,.36,1) both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {style.icon}
      </div>
      <p style={{ flex: 1, lineHeight: 1.4 }}>{message}</p>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 4, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'inherit',
            opacity: 0.5,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
