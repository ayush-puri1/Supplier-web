
'use client';

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const adminLinks = [
        { name: 'Overview', href: '/dashboard/admin', icon: '📊' },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: '📈' },
        { name: 'Suppliers', href: '/dashboard/admin/suppliers', icon: '🏢' },
        { name: 'Products', href: '/dashboard/admin/products', icon: '📦' },
        { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: '📝' },
    ];

    const superAdminLinks = [
        ...adminLinks,
        { name: 'User Management', href: '/dashboard/admin/users', icon: '👥' },
        { name: 'System Config', href: '/dashboard/admin/config', icon: '⚙️' },
    ];

    const supplierLinks = [
        { name: 'Dashboard', href: '/dashboard/supplier', icon: '🏠' },
        { name: 'My Products', href: '/dashboard/supplier/products', icon: '📦' },
        { name: 'Business Profile', href: '/dashboard/supplier/profile', icon: '💼' },
        { name: 'Notifications', href: '/dashboard/supplier/notifications', icon: '🔔' },
    ];

    const links = user?.role === 'SUPER_ADMIN' ? superAdminLinks :
        user?.role === 'ADMIN' ? adminLinks :
            supplierLinks;

    return (
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] border-r border-border glass hidden lg:flex flex-col p-4 gap-2 overflow-y-auto">
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === link.href
                            ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                >
                    <span className="text-xl">{link.icon}</span>
                    {link.name}
                </Link>
            ))}
        </aside>
    );
}
