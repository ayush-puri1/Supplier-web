import React from 'react';
import RoleGuard from '@/components/RoleGuard';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="SUPPLIER">
      {children}
    </RoleGuard>
  );
}
