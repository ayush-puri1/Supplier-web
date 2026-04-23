'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const roleHierarchy = {
  SUPPLIER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: keyof typeof roleHierarchy;
}

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        const userValue = roleHierarchy[user.role as keyof typeof roleHierarchy] ?? -1;
        const requiredValue = roleHierarchy[requiredRole];
        if (userValue < requiredValue) {
          // Redirect lower level roles to their default dashboard
          if (user.role === 'SUPPLIER') {
            router.push('/dashboard/supplier');
          } else if (user.role === 'ADMIN') {
            router.push('/dashboard/admin');
          } else {
            router.push('/login');
          }
        }
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
      return (
          <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
      );
  }

  if (!user) return null;

  const userValue = roleHierarchy[user.role as keyof typeof roleHierarchy] ?? -1;
  const requiredValue = roleHierarchy[requiredRole];
  
  if (userValue < requiredValue) return null;

  return <>{children}</>;
}
