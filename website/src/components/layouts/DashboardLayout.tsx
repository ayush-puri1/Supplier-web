'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import TopHeader from '@/components/ui/TopHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      // DISABLED FOR UI TESTING
      // router.push('/login');
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#FFFFFF] font-[family-name:var(--font-body)]">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopHeader title={title} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
