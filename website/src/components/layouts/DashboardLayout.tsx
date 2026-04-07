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
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="ml-60">
        <TopHeader title={title} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
