'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB]/50">
      {icon && <div className="mb-4 text-[#9CA3AF]">{icon}</div>}
      <h3 className="text-lg font-semibold text-[#0F1117] mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-[#6B7280] max-w-sm mb-6">{subtitle}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
