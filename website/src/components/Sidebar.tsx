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
        <div className="w-60 min-h-screen bg-white border-r border-[#E5E7EB] flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
                <span className="font-display text-xl font-semibold text-[#0F1117]">Delraw</span>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                isActive 
                                ? 'bg-[#ECFDF5] text-[#0D9373] font-medium' 
                                : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#0F1117]'
                            }`}
                        >
                            <Icon size={18} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t border-[#E5E7EB]">
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-[#6B7280] hover:bg-[#FFF1F2] hover:text-[#B91C1C] transition-all">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
}
