'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, Building2, Bell, Users, FileText,
  BarChart3, Settings, LogOut, Landmark
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const SUPPLIER_LINKS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/supplier', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'My Products', href: '/dashboard/supplier/products', icon: <Package className="w-4 h-4" /> },
  { label: 'Business Profile', href: '/dashboard/supplier/profile', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Notifications', href: '/dashboard/supplier/notifications', icon: <Bell className="w-4 h-4" /> },
];

const ADMIN_LINKS: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Suppliers', href: '/dashboard/admin/suppliers', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Products', href: '/dashboard/admin/products', icon: <Package className="w-4 h-4" /> },
  { label: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: <FileText className="w-4 h-4" /> },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
];

const SUPER_ADMIN_LINKS: NavItem[] = [
  { label: 'User Management', href: '/dashboard/admin/users', icon: <Users className="w-4 h-4" /> },
  { label: 'System Config', href: '/dashboard/admin/config', icon: <Settings className="w-4 h-4" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSupplier = user?.role === 'SUPPLIER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const links = isSupplier ? SUPPLIER_LINKS : [
    ...ADMIN_LINKS,
    ...(isSuperAdmin ? SUPER_ADMIN_LINKS : []),
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/supplier' || href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-transparent border-r border-[#1E293B] flex flex-col z-40 font-[family-name:var(--font-body)]">
      {/* Brand */}
      <div className="h-24 flex flex-col justify-center px-8 border-b border-transparent">
        <Link href="/" className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 rounded bg-[#E2E8F0] text-[#0F1117] flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white tracking-tight">
            Delraw
          </span>
        </Link>
        <span className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold ml-1">
          B2B Portal
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {isAdmin && !isSupplier && (
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </p>
        )}

        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'text-white'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {active && (
                <div className="absolute inset-0 bg-[#1E293B] rounded-lg opacity-40 pointer-events-none" />
              )}
              {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#3B82F6] rounded-l-full shadow-[0_0_8px_#3B82F6]" />
              )}
              
              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className={active ? 'text-[#3B82F6]' : 'opacity-70'}>
                  {link.icon}
                </div>
                <span className="flex-1 text-[13px] tracking-wide">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-[#1E293B]">
        <div className="px-4 py-3 mb-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <p className="text-xs font-semibold text-white truncate mb-1">{user?.email}</p>
          <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:bg-[rgba(239,68,68,0.1)] hover:text-red-400 transition-all border border-transparent hover:border-[rgba(239,68,68,0.2)]"
        >
          <LogOut className="w-3 h-3" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
}
