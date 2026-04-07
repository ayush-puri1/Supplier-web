'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type BannerType = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  type: BannerType;
  message: string;
  onClose?: () => void;
}

const STYLES: Record<BannerType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />,
  },
};

export default function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  const style = STYLES[type];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border} ${style.text} animate-fade-in-down`}>
      {style.icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
