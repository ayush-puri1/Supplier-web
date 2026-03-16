'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function OnboardingForm({ profile, onComplete }: { profile: any; onComplete: () => void }) {
    const [formData, setFormData] = useState({
        companyName: profile.companyName || '',
        gstNumber: profile.gstNumber || '',
        panNumber: profile.panNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        yearEstablished: profile.yearEstablished || 2024,
        workforceSize: profile.workforceSize || 1,
        monthlyCapacity: profile.monthlyCapacity || 0,
        moq: profile.moq || 0,
        leadTimeDays: profile.leadTimeDays || 0,
        responseTimeHr: profile.responseTimeHr || 24,
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // First update profile
            await fetchWithAuth('/supplier/me', {
                method: 'PATCH',
                body: JSON.stringify(formData),
            });
            // Then submit for review
            await fetchWithAuth('/supplier/submit', {
                method: 'POST',
            });
            onComplete();
        } catch (err: any) {
            setError(err.message || 'Failed to submit onboarding form');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Complete Your Business Profile</h1>
                <p className="text-muted-foreground">
                    {profile.status === 'REJECTED' 
                        ? "Your previous application was rejected. Please update your details and resubmit." 
                        : "We need a few details to verify your account before you can start selling."}
                </p>
                {profile.status === 'REJECTED' && profile.internalNotes && (
                    <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                        <strong>Reason for Rejection:</strong> {profile.internalNotes}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl shadow-xl space-y-8 border border-border">
                {/* Basic Details */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-border pb-2">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Year Established</label>
                            <input type="number" name="yearEstablished" value={formData.yearEstablished} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">GST Number</label>
                            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none uppercase" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">PAN Number</label>
                            <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none uppercase" />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-border pb-2">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-sm font-medium ml-1">Full Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium ml-1">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Country</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                    </div>
                </div>

                {/* Operational Capacity */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-border pb-2">Operational Capacity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Workforce Size</label>
                            <input type="number" name="workforceSize" value={formData.workforceSize} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Monthly Capacity (Units)</label>
                            <input type="number" name="monthlyCapacity" value={formData.monthlyCapacity} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Minimum Order Qty (MOQ)</label>
                            <input type="number" name="moq" value={formData.moq} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Avg Lead Time (Days)</label>
                            <input type="number" name="leadTimeDays" value={formData.leadTimeDays} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isLoading} className="py-3 px-8 premium-gradient text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer">
                        {isLoading ? "Submitting..." : profile.status === 'REJECTED' ? "Resubmit Application" : "Submit for Verification"}
                    </button>
                </div>
            </form>
        </div>
    );
}
