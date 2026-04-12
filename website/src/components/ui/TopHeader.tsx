'use client';

import React from 'react';
import { HelpCircle, User } from 'lucide-react';
import Link from 'next/link';

interface TopHeaderProps {
  title?: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  return (
    <header className="h-24 bg-transparent border-b border-[#1E293B] flex items-center justify-between px-10 sticky top-0 z-30">
      <div>
        {title ? (
          <>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl text-white tracking-tight leading-tight">
              {title}
            </h1>
            <p className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.15em] text-[#64748B] font-semibold mt-1">
              Live Infrastructure Monitor
            </p>
          </>
        ) : (
          <div className="w-32 h-6 bg-[rgba(255,255,255,0.02)] rounded animate-pulse" />
        )}
      </div>

      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center gap-6">
          {['Overview', 'Analytics', 'Reports'].map((item, i) => (
            <Link 
              key={item} 
              href="#" 
              className={`text-sm font-medium transition-colors ${
                i === 0 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4 border-l border-[#1E293B] pl-8">
          <button className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:bg-[#1E293B] hover:text-white transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:bg-[#1E293B] hover:text-white transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
