
'use client';

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="h-16 border-b border-border glass fixed top-0 w-full z-50 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-gradient">Delraw</Link>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium lowercase">
                    {user?.role.replace('_', ' ')}
                </span>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user?.companyName || user?.email}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Verified {user?.role}</p>
                </div>
                <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
