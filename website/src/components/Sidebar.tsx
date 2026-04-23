'use client';

import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Package, FileText, Settings, 
  Briefcase, Bell, LogOut, Building, Shield, Crown, 
  BarChart3, History, UserCog, UserCheck 
} from "lucide-react";

interface SidebarProps {
  active?: string; // Optional override for active item key
}

export default function Sidebar({ active }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // COLOR PALETTE - Premium Charcoal
    const C = {
      sidebar: '#050505',
      border: 'rgba(255,255,255,0.06)',
      accent: '#3B82F6',
      text: '#F1F5F9',
      textDim: '#94A3B8',
    };

    const supplierLinks = [
        { name: 'Dashboard', href: '/dashboard/supplier', icon: LayoutDashboard, key: 'dashboard' },
        { name: 'My Products', href: '/dashboard/supplier/products', icon: Package, key: 'products' },
        { name: 'Business Profile', href: '/dashboard/supplier/profile', icon: Briefcase, key: 'profile' },
        { name: 'Notifications', href: '/dashboard/supplier/notifications', icon: Bell, key: 'notifications' },
    ];

    const adminLinks = [
        { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard, key: 'admin_home' },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3, key: 'analytics' },
        { name: 'Suppliers', href: '/dashboard/admin/suppliers', icon: Users, key: 'suppliers' },
        { name: 'Products', href: '/dashboard/admin/products', icon: Package, key: 'products' },
        { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: History, key: 'audit' },
    ];

    const superAdminLinks = [
        { name: 'Command Center', href: '/dashboard/super-admin', icon: LayoutDashboard, key: 'super_admin_home' },
        { name: 'User Control', href: '/dashboard/admin/users', icon: UserCog, key: 'users' },
        { name: 'Supplier Pipeline', href: '/dashboard/admin/suppliers', icon: Users, key: 'suppliers' },
        { name: 'Product Moderation', href: '/dashboard/admin/products', icon: Package, key: 'products' },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3, key: 'analytics' },
        { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: History, key: 'audit' },
        { name: 'System Config', href: '/dashboard/super-admin/config', icon: Settings, key: 'config' },
        { name: 'Admin Mgmt', icon: Crown, href: '/dashboard/super-admin/admin-management', key: 'admin_mgmt' },
        { name: 'Admin Portal', icon: Shield, href: '/dashboard/admin', key: 'admin_link' },
    ];

    const getLinks = () => {
      if (user?.role === 'SUPER_ADMIN') return superAdminLinks;
      if (user?.role === 'ADMIN') return adminLinks;
      return supplierLinks;
    };

    const links = getLinks();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside style={{
            width: 232,
            height: '100vh',
            background: C.sidebar,
            borderRight: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            padding: '24px 12px 20px',
            flexShrink: 0,
        }}>
            {/* LOGO SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 6 }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, #2563EB, #3B82F6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.4)', flexShrink: 0 }}>
                        {user?.role === 'SUPER_ADMIN' ? <Shield size={16} color="white" /> : <span style={{ color: 'white', fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1 }}>Delraw</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                        {user?.role?.replace('_', ' ') || 'Supplier Portal'}
                      </div>
                    </div>
                </Link>
            </div>

            {/* NAV LINKS */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = active ? active === link.key : (pathname === link.href || pathname.startsWith(link.href + '/'));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 11,
                                padding: '10px 12px',
                                borderRadius: 10,
                                textDecoration: 'none',
                                fontFamily: "var(--font-body)",
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span style={{ color: isActive ? C.accent : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                              <Icon size={16} />
                            </span>
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            {/* USER PROFILE + LOGOUT */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                {user && (
                  <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, marginBottom: 12 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.companyName || user?.email || 'user@delraw.com'}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'USER'}</p>
                  </div>
                )}
                <button 
                  onClick={handleLogout} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 9,
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: 'rgba(248,113,113,0.6)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
