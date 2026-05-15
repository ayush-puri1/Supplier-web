import React from 'react';
import RoleGuard from '@/components/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="SUPPLIER">
      {children}
    </RoleGuard>
  );
}
