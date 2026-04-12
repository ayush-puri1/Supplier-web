'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-blue-50 text-blue-600 border-blue-200',
  VERIFIED: 'bg-blue-50 text-emerald-700 border-emerald-200',
  CONDITIONAL: 'bg-orange-50 text-orange-600 border-orange-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  SUSPENDED: 'bg-zinc-200 text-zinc-600 border-zinc-300',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
  LIVE: 'bg-blue-50 text-emerald-700 border-emerald-200',
  DELISTED: 'bg-zinc-200 text-zinc-600 border-zinc-300',
  ACTIVE: 'bg-blue-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'bg-zinc-100 text-zinc-500 border-zinc-200';
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-bold uppercase tracking-wider border rounded-full ${style} ${sizeClasses}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
