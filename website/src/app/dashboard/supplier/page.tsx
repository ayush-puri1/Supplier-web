'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import OnboardingForm from "@/components/supplier/OnboardingForm";
import PendingReview from "@/components/supplier/PendingReview";

export default function SupplierDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const profileRes = await fetchWithAuth('/supplier/me');
            setProfile(profileRes);

            if (profileRes.status === 'VERIFIED') {
                const result = await fetchWithAuth('/supplier/dashboard');
                setData(result);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <div className="text-center py-20 opacity-50">Loading your workspace...</div>;

    if (!profile) return <div className="text-center py-20 text-destructive">Failed to load profile.</div>;

    if (profile.status === 'DRAFT' || profile.status === 'REJECTED') {
        return <OnboardingForm profile={profile} onComplete={loadData} />;
    }

    if (profile.status === 'SUBMITTED' || profile.status === 'UNDER_REVIEW' || profile.status === 'CONDITIONAL') {
        return <PendingReview status={profile.status} />;
    }

    if (!data) return <div className="text-center py-20 opacity-50 animate-pulse">Initializing dashboard metrics...</div>;

    const cards = [
        { name: 'Total Products', value: data.productStats.total, sub: `${data.productStats.pending} pending approval`, color: 'from-blue-500/20 to-blue-600/20' },
        { name: 'Live Products', value: data.productStats.live, sub: 'Visible to buyers', color: 'from-emerald-500/20 to-emerald-600/20' },
        { name: 'Total Orders', value: data.salesStats.totalOrders, sub: 'Lifetime sales', color: 'from-indigo-500/20 to-indigo-600/20' },
        { name: 'Total Revenue', value: `₹${data.salesStats.totalRevenue.toLocaleString()}`, sub: `After ${data.commission}% commission`, color: 'from-purple-500/20 to-purple-600/20' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Supplier Dashboard</h1>
                    <p className="text-muted-foreground">Manage your products and track your growth.</p>
                </div>
                <button className="px-6 py-3 premium-gradient text-white font-bold rounded-xl shadow-lg hover:translate-y-[-2px] transition-all">
                    + Add New Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className={`p-6 rounded-2xl glass border border-border bg-gradient-to-br ${card.color} group hover:border-primary/30 transition-all`}>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{card.name}</p>
                        <h3 className="text-4xl font-bold mb-2">{card.value}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">{card.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                <div className="lg:col-span-2 glass p-8 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">Recent Notifications</h3>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {data.notifications.length === 0 ? (
                            <p className="text-center py-10 text-muted-foreground italic">No new notifications</p>
                        ) : (
                            data.notifications.map((n: any) => (
                                <div key={n.id} className={`p-4 rounded-xl border ${n.isRead ? 'bg-secondary/10 border-border/50' : 'bg-primary/5 border-primary/20'} flex items-start gap-4 transition-all hover:scale-[1.01]`}>
                                    <span className="text-2xl mt-1">{n.type === 'SUCCESS' ? '✅' : n.type === 'ALERT' ? '⚠️' : 'ℹ️'}</span>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                                        <p className="text-[10px] mt-2 opacity-50 uppercase font-bold tracking-tighter">
                                            {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass p-8 rounded-2xl border border-border bg-gradient-to-b from-transparent to-primary/5">
                    <h3 className="text-xl font-bold mb-4">Account Support</h3>
                    <p className="text-sm text-muted-foreground mb-8">Need help with your business profile or products? Our team is available 24/7.</p>
                    <div className="space-y-4">
                        <a href="tel:+911234567890" className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                            <div>
                                <p className="text-sm font-bold">Call Dedicated Manager</p>
                                <p className="text-xs text-muted-foreground">+91 1800-DELRAW</p>
                            </div>
                        </a>
                        <div className="p-4 rounded-xl bg-background border border-border text-center">
                            <p className="text-xs text-muted-foreground mb-2 italic">Current Commission Rate</p>
                            <p className="text-3xl font-black text-gradient">{data.commission}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
