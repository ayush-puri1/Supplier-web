'use client';

import React from 'react';

interface TopHeaderProps {
  title?: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-8 sticky top-0 z-30">
      {title && (
        <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">{title}</h2>
      )}
    </header>
  );
}
