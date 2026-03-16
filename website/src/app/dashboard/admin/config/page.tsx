
'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function AdminConfig() {
    const { user: currentUser } = useAuth();
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadConfig = async () => {
        try {
            const data = await fetchWithAuth('/admin/config');
            setConfig(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'SUPER_ADMIN') {
            loadConfig();
        }
    }, [currentUser]);

    const handleUpdate = async (field: string, value: any) => {
        setConfig((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchWithAuth('/admin/config', {
                method: 'PATCH',
                body: JSON.stringify(config),
            });
            alert('Settings saved successfully');
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (currentUser?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <span className="text-6xl">🚫</span>
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground max-w-md">This page is restricted to Super Admin users only.</p>
            </div>
        );
    }

    if (loading) return <div className="text-center py-20 opacity-50">Loading platform settings...</div>;

    return (
        <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gradient">System Configuration</h1>
                <p className="text-muted-foreground">Adjust platform-wide thresholds, commissions, and operational mode.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <section className="glass p-6 rounded-2xl border border-border">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Financial Controls</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-2">Platform Commission (%)</label>
                                <input
                                    type="number"
                                    value={isNaN(config.businessCommission) ? '' : config.businessCommission}
                                    onChange={(e) => handleUpdate('businessCommission', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="glass p-6 rounded-2xl border border-border">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Trust Thresholds</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-2">Default Trust Score</label>
                                <input
                                    type="number"
                                    value={isNaN(config.defaultTrustScore) ? '' : config.defaultTrustScore}
                                    onChange={(e) => handleUpdate('defaultTrustScore', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2">Max Failed Logins Threshold</label>
                                <input
                                    type="number"
                                    value={isNaN(config.maxFailedLogins) ? '' : config.maxFailedLogins}
                                    onChange={(e) => handleUpdate('maxFailedLogins', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="glass p-6 rounded-2xl border border-border bg-gradient-to-br from-red-500/5 to-transparent">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Critical Operations</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                                <div>
                                    <p className="text-sm font-bold">Maintenance Mode</p>
                                    <p className="text-[10px] text-muted-foreground">Blocks all non-admin traffic</p>
                                </div>
                                <button
                                    onClick={() => handleUpdate('isMaintenanceMode', !config.isMaintenanceMode)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${config.isMaintenanceMode ? 'bg-red-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.isMaintenanceMode ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="p-8 rounded-2xl premium-gradient text-white shadow-xl shadow-primary/20">
                        <h3 className="text-xl font-bold mb-2">Safety Notice</h3>
                        <p className="text-xs opacity-80 leading-relaxed mb-6">Changes saved here will affect all users instantly. Ensure you have verified the new thresholds before applying.</p>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-white text-primary font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'SAVING...' : 'APPLY CHANGES NOW'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
