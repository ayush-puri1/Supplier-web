import React from 'react';
import RoleGuard from '@/components/RoleGuard';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="SUPPLIER">
      {children}
    </RoleGuard>
  );
}
