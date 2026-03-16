
'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function SupplierProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadProfile = async () => {
        try {
            const data = await fetchWithAuth('/supplier/me');
            setProfile(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (field: string, value: any) => {
        setProfile((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchWithAuth('/supplier/me', {
                method: 'PATCH',
                body: JSON.stringify(profile),
            });
            alert('Profile updated');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForReview = async () => {
        try {
            await fetchWithAuth('/supplier/submit', { method: 'POST' });
            loadProfile();
            alert('Submitted for review');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center py-20 opacity-50">Loading profile...</div>;

    const isEditable = profile.status === 'DRAFT' || profile.status === 'REJECTED';

    return (
        <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Business Profile</h1>
                    <p className="text-muted-foreground">Manage your company information and verification documents.</p>
                </div>
                <div className="text-right">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${profile.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        profile.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                        }`}>
                        Status: {profile.status}
                    </span>
                    {profile.status === 'DRAFT' && (
                        <button
                            onClick={handleSubmitForReview}
                            className="block mt-4 text-xs font-bold text-primary hover:underline"
                        >
                            🚀 Submit for Review
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="glass p-8 rounded-2xl border border-border space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">General Info</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold mb-2">Company Name</label>
                            <input
                                type="text"
                                disabled={!isEditable}
                                value={profile.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2">GST Number</label>
                            <input
                                type="text"
                                disabled={!isEditable}
                                value={profile.gstNumber}
                                onChange={(e) => handleChange('gstNumber', e.target.value)}
                                className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>
                </section>

                <section className="glass p-8 rounded-2xl border border-border space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Operational Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-2">Workforce Size</label>
                            <input
                                type="number"
                                disabled={!isEditable}
                                value={profile.workforceSize}
                                onChange={(e) => handleChange('workforceSize', parseInt(e.target.value))}
                                className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2">Monthly Capacity</label>
                            <input
                                type="number"
                                disabled={!isEditable}
                                value={profile.monthlyCapacity}
                                onChange={(e) => handleChange('monthlyCapacity', parseInt(e.target.value))}
                                className="w-full p-3 rounded-xl bg-background border border-border focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {isEditable && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 premium-gradient text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? 'SAVING...' : 'SAVE PROFILE'}
                    </button>
                </div>
            )}
        </div>
    );
}
