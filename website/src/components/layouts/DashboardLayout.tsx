'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  active?: string;
}

export default function DashboardLayout({ children, title, active = 'dashboard' }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#FFFFFF] font-[family-name:var(--font-body)]">
      <div style={{ display: 'flex' }}>
        <Sidebar active={active} />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <DashboardHeader centerText={title} />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
