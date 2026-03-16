'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchWithAuth('/admin/stats');
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <div className="text-center py-20 opacity-50">Loading dashboard...</div>;
    if (!stats) return <div className="text-center py-20 text-destructive">Failed to load stats.</div>;

    const supplierCards = [
        { name: 'Total Suppliers', value: stats.suppliers.total, sub: `${stats.suppliers.pending} pending review`, color: 'from-blue-500/20 to-blue-600/20', icon: '🏢' },
        { name: 'Verified', value: stats.suppliers.verified, sub: 'Active on platform', color: 'from-emerald-500/20 to-emerald-600/20', icon: '✅' },
        { name: 'Rejected', value: stats.suppliers.rejected, sub: 'Failed verification', color: 'from-red-500/20 to-red-600/20', icon: '❌' },
        { name: 'Suspended', value: stats.suppliers.suspended, sub: 'Compliance hold', color: 'from-zinc-500/20 to-zinc-600/20', icon: '🚫' },
    ];

    const productCards = [
        { name: 'Total Products', value: stats.products.total, sub: `${stats.products.pending} pending approval`, color: 'from-indigo-500/20 to-indigo-600/20', icon: '📦' },
        { name: 'Live', value: stats.products.live, sub: 'Publicly visible', color: 'from-emerald-500/20 to-emerald-600/20', icon: '🟢' },
        { name: 'Draft', value: stats.products.draft, sub: 'Not yet submitted', color: 'from-amber-500/20 to-amber-600/20', icon: '📝' },
        { name: 'Rejected', value: stats.products.rejected, sub: 'Failed moderation', color: 'from-red-500/20 to-red-600/20', icon: '🔴' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
                <p className="text-muted-foreground">Monitor and manage the Delraw marketplace.</p>
            </div>

            {/* Supplier Stats */}
            <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs">🏢 Suppliers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {supplierCards.map((card) => (
                        <div key={card.name} className={`p-6 rounded-2xl glass border border-border bg-gradient-to-br ${card.color} relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default`}>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-muted-foreground mb-1">{card.name}</p>
                                <h3 className="text-4xl font-bold mb-2">{card.value}</h3>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">{card.sub}</p>
                            </div>
                            <div className="absolute right-[-10%] bottom-[-10%] text-7xl grayscale opacity-5 group-hover:scale-110 transition-transform">{card.icon}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Stats */}
            <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs">📦 Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {productCards.map((card) => (
                        <div key={card.name} className={`p-6 rounded-2xl glass border border-border bg-gradient-to-br ${card.color} relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default`}>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-muted-foreground mb-1">{card.name}</p>
                                <h3 className="text-4xl font-bold mb-2">{card.value}</h3>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">{card.sub}</p>
                            </div>
                            <div className="absolute right-[-10%] bottom-[-10%] text-7xl grayscale opacity-5 group-hover:scale-110 transition-transform">{card.icon}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="glass p-8 rounded-2xl border border-border">
                <h3 className="text-xl font-bold mb-2 text-gradient">Quick Actions</h3>
                <p className="text-sm text-muted-foreground mb-6">Common tasks for marketplace management.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => router.push('/dashboard/admin/suppliers?filter=SUBMITTED')} className="p-4 rounded-xl bg-amber-500/10 text-amber-400 font-semibold hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 text-sm">
                        🔍 Review Pending ({stats.suppliers.pending})
                    </button>
                    <button onClick={() => router.push('/dashboard/admin/suppliers')} className="p-4 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-white transition-all border border-primary/20 text-sm">
                        🏢 All Suppliers
                    </button>
                    <button onClick={() => router.push('/dashboard/admin/products?filter=PENDING_APPROVAL')} className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 font-semibold hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20 text-sm">
                        📦 Moderate Products ({stats.products.pending})
                    </button>
                    <button onClick={() => router.push('/dashboard/admin/products')} className="p-4 rounded-xl bg-secondary font-semibold hover:bg-accent transition-all border border-border text-sm">
                        📋 All Products
                    </button>
                </div>
            </section>
        </div>
    );
}
