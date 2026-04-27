'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  valueColor?: string;
}

export default function StatCard({ label, value, subtitle, icon, valueColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 relative overflow-hidden hover:shadow-md transition-shadow duration-300">
      {icon && (
        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center text-[#6B7280]">
          {icon}
        </div>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">{label}</p>
      <p className={`text-4xl font-black ${valueColor || 'text-[#0F1117]'}`}>{value}</p>
      {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
    </div>
  );
}
