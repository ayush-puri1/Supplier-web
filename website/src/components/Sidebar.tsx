'use client';

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Package, FileText, Settings, Briefcase, Bell, LogOut, Building } from "lucide-react";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const adminLinks = [
        { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Suppliers', href: '/dashboard/admin/suppliers', icon: Building },
        { name: 'Products', href: '/dashboard/admin/products', icon: Package },
        { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: FileText },
    ];

    const superAdminLinks = [
        ...adminLinks,
        { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
        { name: 'System Config', href: '/dashboard/admin/config', icon: Settings },
    ];

    const supplierLinks = [
        { name: 'Dashboard', href: '/dashboard/supplier', icon: LayoutDashboard },
        { name: 'My Products', href: '/dashboard/supplier/products', icon: Package },
        { name: 'Business Profile', href: '/dashboard/supplier/profile', icon: Briefcase },
        { name: 'Notifications', href: '/dashboard/supplier/notifications', icon: Bell },
    ];

    const links = user?.role === 'SUPER_ADMIN' ? superAdminLinks :
                  user?.role === 'ADMIN' ? adminLinks : 
                  supplierLinks;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div style={{
            width: 240,
            minHeight: '100vh',
            background: '#0D0D12',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-body)',
        }}>
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(37,99,235,0.4)' }}>
                        <span style={{ color: 'white', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>D</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Delraw</span>
                </Link>
            </div>

            <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 16px',
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 500,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
                                color: isActive ? 'var(--blue-400)' : 'rgba(255,255,255,0.3)',
                                border: isActive ? '1px solid rgba(37,99,235,0.15)' : '1px solid transparent',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                                }
                            }}
                        >
                            <Icon size={18} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button 
                  onClick={handleLogout} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 500,
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                    e.currentTarget.style.color = '#F87171';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.25)';
                  }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
}
