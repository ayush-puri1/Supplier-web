'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, Building2, Bell, Users, FileText,
  BarChart3, Settings, Shield, LogOut, ChevronRight
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
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#E5E7EB] flex flex-col z-40">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0D9373] flex items-center justify-center">
            <span className="text-white text-xs font-black">D</span>
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[#0F1117]">
            Delraw
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {isAdmin && !isSupplier && (
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </p>
        )}

        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-[#ECFDF5] text-[#0D9373]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#0F1117]'
              }`}
            >
              {link.icon}
              <span className="flex-1">{link.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-[#0F1117] truncate">{user?.email}</p>
          <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
