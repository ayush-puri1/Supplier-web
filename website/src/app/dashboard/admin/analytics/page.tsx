'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-zinc-500',
    SUBMITTED: 'bg-amber-500',
    PENDING_APPROVAL: 'bg-amber-500',
    UNDER_REVIEW: 'bg-blue-500',
    VERIFIED: 'bg-emerald-500',
    LIVE: 'bg-emerald-500',
    CONDITIONAL: 'bg-orange-500',
    REJECTED: 'bg-red-500',
    DELISTED: 'bg-zinc-700',
    SUSPENDED: 'bg-zinc-800',
};

export default function AdminAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await fetchWithAuth('/admin/analytics');
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <div className="text-center py-20 opacity-50">Loading analytics engine...</div>;
    if (!data) return <div className="text-center py-20 text-red-500">Failed to load analytics</div>;

    const { summary, distributions, topSuppliers, recentActivity } = data;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
                <p className="text-muted-foreground">High-level overview of supplier onboarding and product catalog health.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    ['Total Users', summary.totalUsers, '👤'],
                    ['Total Suppliers', summary.totalSuppliers, '🏢'],
                    ['Active Suppliers', summary.activeSuppliers, '✅'],
                    ['Total Products', summary.totalProducts, '📦'],
                    ['Live Products', summary.liveProducts, '🚀'],
                ].map(([label, value, icon]) => (
                    <div key={label as string} className="glass p-4 rounded-2xl border border-border flex flex-col items-center text-center">
                        <span className="text-2xl mb-2">{icon}</span>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
                        <p className="text-2xl font-black mt-1">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Supplier Status Distribution */}
                <div className="glass p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Supplier Funnel</h3>
                    <div className="space-y-3">
                        {Object.entries(distributions.supplier).map(([status, count]: [string, any]) => {
                            const percent = Math.round((count / summary.totalSuppliers) * 100) || 0;
                            return (
                                <div key={status} className="flex items-center gap-4">
                                    <div className="w-24 text-xs font-bold">{status.replace('_', ' ')}</div>
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${STATUS_COLORS[status] || 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <div className="w-12 text-right text-xs text-muted-foreground">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Product Status Distribution */}
                <div className="glass p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Product Catalog Status</h3>
                    <div className="space-y-3">
                        {Object.entries(distributions.product).map(([status, count]: [string, any]) => {
                            const percent = Math.round((count / summary.totalProducts) * 100) || 0;
                            return (
                                <div key={status} className="flex items-center gap-4">
                                    <div className="w-24 text-xs font-bold">{status.replace('_', ' ')}</div>
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${STATUS_COLORS[status] || 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <div className="w-12 text-right text-xs text-muted-foreground">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 glass p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Recent System Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No recent activity found.</p>
                        ) : (
                            recentActivity.map((log: any) => (
                                <div key={log.id} className="flex gap-4 items-start p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-bold">{log.action.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{log.details || `${log.entityType} ${log.entityId}`}</p>
                                        <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase font-bold tracking-wider">
                                            {new Date(log.createdAt).toLocaleString()} • {log.actorEmail || log.actorId}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Suppliers */}
                <div className="glass p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Top Contributors</h3>
                    <div className="space-y-4">
                        {topSuppliers.map((s: any, idx: number) => (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{s.companyName}</p>
                                        <p className="text-[10px] text-muted-foreground">{s.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black">{s._count.products}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Products</p>
                                </div>
                            </div>
                        ))}
                        {topSuppliers.length === 0 && <p className="text-xs text-muted-foreground italic">No suppliers found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
