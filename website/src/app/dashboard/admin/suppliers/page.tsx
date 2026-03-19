'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

const STATUS_TABS = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CONDITIONAL', 'SUSPENDED', 'DRAFT'] as const;

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    SUBMITTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    UNDER_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    VERIFIED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    CONDITIONAL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    SUSPENDED: 'bg-zinc-800/50 text-zinc-300 border-zinc-600/30',
};

const TRANSITION_MAP: Record<string, { label: string; status: string; color: string }[]> = {
    SUBMITTED: [{ label: 'Start Review', status: 'UNDER_REVIEW', color: 'bg-blue-500 hover:bg-blue-600' }],
    UNDER_REVIEW: [
        { label: '✅ Verify', status: 'VERIFIED', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { label: '❌ Reject', status: 'REJECTED', color: 'bg-red-500 hover:bg-red-600' },
        { label: '⚠️ Conditional', status: 'CONDITIONAL', color: 'bg-orange-500 hover:bg-orange-600' },
    ],
    VERIFIED: [{ label: '🚫 Suspend', status: 'SUSPENDED', color: 'bg-zinc-700 hover:bg-zinc-800' }],
    CONDITIONAL: [
        { label: '🔄 Re-Review', status: 'UNDER_REVIEW', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: '❌ Reject', status: 'REJECTED', color: 'bg-red-500 hover:bg-red-600' },
    ],
    REJECTED: [{ label: '↩️ Reset to Draft', status: 'DRAFT', color: 'bg-zinc-600 hover:bg-zinc-700' }],
    SUSPENDED: [{ label: '🔄 Re-Review', status: 'UNDER_REVIEW', color: 'bg-blue-500 hover:bg-blue-600' }],
    DRAFT: [],
};

export default function AdminSuppliers() {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'ALL';

    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialFilter);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [internalNote, setInternalNote] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const loadSuppliers = async () => {
        try {
            const url = activeTab === 'ALL' ? '/admin/suppliers' : `/admin/suppliers?status=${activeTab}`;
            const data = await fetchWithAuth(url);
            setSuppliers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setLoading(true); loadSuppliers(); }, [activeTab]);

    const handleUpdateStatus = async (id: string, status: string) => {
        let rejectionReason = "";
        if (status === 'REJECTED') {
            rejectionReason = prompt("Please provide a reason for rejection:") || "";
            if (!rejectionReason) {
                alert("Rejection reason is required.");
                return;
            }
        }

        setActionLoading(true);
        try {
            await fetchWithAuth(`/admin/suppliers/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, rejectionReason }),
            });
            await loadSuppliers();
            if (selectedSupplier?.id === id) {
                const updated = await fetchWithAuth(`/admin/suppliers/${id}`);
                setSelectedSupplier(updated);
            }
        } catch (err: any) {
            alert(err?.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedSupplier) return;
        try {
            await fetchWithAuth(`/admin/suppliers/${selectedSupplier.id}/notes`, {
                method: 'PATCH',
                body: JSON.stringify({ internalNotes: internalNote }),
            });
            await loadSuppliers();
            setSelectedSupplier((prev: any) => ({ ...prev, internalNotes: internalNote }));
        } catch (err) {
            alert('Failed to save note');
        }
    };

    const selectSupplier = (s: any) => {
        setSelectedSupplier(s);
        setInternalNote(s.internalNotes || "");
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">Supplier Verification</h1>
                <p className="text-muted-foreground">Review registrations, manage compliance, and control platform trust.</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedSupplier(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === tab
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                            : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                        }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 opacity-50">Loading suppliers...</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Supplier Table */}
                    <div className="xl:col-span-2 space-y-4">
                        {suppliers.length === 0 ? (
                            <div className="glass rounded-2xl border border-border p-12 text-center text-muted-foreground italic">
                                No suppliers found with status: {activeTab}
                            </div>
                        ) : (
                            <div className="glass rounded-2xl border border-border overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-secondary/50 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                                            <th className="px-6 py-4">Company</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Trust</th>
                                            <th className="px-6 py-4">Products</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {suppliers.map((s) => (
                                            <tr
                                                key={s.id}
                                                onClick={() => selectSupplier(s)}
                                                className={`hover:bg-primary/5 transition-colors cursor-pointer ${selectedSupplier?.id === s.id ? 'bg-primary/10' : ''}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-sm">{s.companyName}</p>
                                                    <p className="text-xs text-muted-foreground">{s.user?.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[s.status] || ''}`}>
                                                        {s.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary transition-all" style={{ width: `${s.trustScore || 0}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold">{s.trustScore ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold">{s._count?.products || 0}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right: Detail Sidebar */}
                    <div className="space-y-6">
                        {selectedSupplier ? (
                            <div className="glass p-6 rounded-2xl border border-border sticky top-24 animate-in fade-in zoom-in duration-300 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{selectedSupplier.companyName}</h3>
                                    <p className="text-xs text-muted-foreground">ID: {selectedSupplier.id}</p>
                                    <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[selectedSupplier.status] || ''}`}>
                                        {selectedSupplier.status.replace('_', ' ')}
                                    </span>
                                    {selectedSupplier.status === 'REJECTED' && selectedSupplier.rejectionReason && (
                                        <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-left animate-in fade-in zoom-in duration-300">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Rejection Reason</p>
                                            <p className="text-sm text-red-700/80 italic">"{selectedSupplier.rejectionReason}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status Actions */}
                                <section>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Actions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(TRANSITION_MAP[selectedSupplier.status] || []).map((t) => (
                                            <button
                                                key={t.status}
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedSupplier.id, t.status)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 ${t.color}`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                        {(TRANSITION_MAP[selectedSupplier.status] || []).length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">No actions available for this status.</p>
                                        )}
                                    </div>
                                </section>

                                {/* Business Details */}
                                <section className="p-4 rounded-xl bg-secondary/30 border border-border">
                                    <p className="text-xs font-bold mb-3 uppercase tracking-widest text-muted-foreground">Business Details</p>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        {[
                                            ['GST', selectedSupplier.gstNumber],
                                            ['PAN', selectedSupplier.panNumber],
                                            ['City', selectedSupplier.city],
                                            ['Country', selectedSupplier.country],
                                            ['Est.', selectedSupplier.yearEstablished],
                                            ['Workforce', selectedSupplier.workforceSize],
                                            ['Capacity', `${selectedSupplier.monthlyCapacity}/mo`],
                                            ['MOQ', selectedSupplier.moq],
                                            ['Lead Time', `${selectedSupplier.leadTimeDays}d`],
                                            ['Response', `${selectedSupplier.responseTimeHr}h`],
                                        ].map(([label, val]) => (
                                            <div key={label as string}>
                                                <p className="opacity-50 font-bold uppercase text-[10px]">{label}</p>
                                                <p className="font-medium text-foreground">{val || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Internal Notes */}
                                <section>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Internal Notes <span className="text-destructive">(Admin Only)</span></p>
                                    <textarea
                                        className="w-full h-28 p-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none transition-all text-sm resize-none"
                                        placeholder="Add compliance notes, fraud flags, etc..."
                                        value={internalNote}
                                        onChange={(e) => setInternalNote(e.target.value)}
                                    />
                                    <button
                                        onClick={handleSaveNote}
                                        className="mt-2 w-full py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-white transition-all"
                                    >
                                        Save Note
                                    </button>
                                </section>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center p-12 text-center glass rounded-2xl border border-dashed border-border text-muted-foreground italic text-sm">
                                Select a supplier from the table to view details and take action.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
