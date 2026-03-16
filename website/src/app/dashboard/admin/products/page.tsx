'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

const STATUS_TABS = ['ALL', 'PENDING_APPROVAL', 'LIVE', 'REJECTED', 'DELISTED', 'DRAFT'] as const;

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    PENDING_APPROVAL: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    LIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    DELISTED: 'bg-zinc-800/50 text-zinc-300 border-zinc-600/30',
};

const TRANSITION_MAP: Record<string, { label: string; status: string; color: string }[]> = {
    PENDING_APPROVAL: [
        { label: '✅ Approve (Go Live)', status: 'LIVE', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { label: '❌ Reject', status: 'REJECTED', color: 'bg-red-500 hover:bg-red-600' },
    ],
    LIVE: [{ label: '🚫 Delist', status: 'DELISTED', color: 'bg-zinc-700 hover:bg-zinc-800' }],
    DELISTED: [{ label: '🔄 Re-list (Go Live)', status: 'LIVE', color: 'bg-emerald-500 hover:bg-emerald-600' }],
    REJECTED: [{ label: '🔄 Re-submit for Review', status: 'PENDING_APPROVAL', color: 'bg-amber-500 hover:bg-amber-600' }],
    DRAFT: [],
};

export default function AdminProducts() {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'ALL';

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialFilter);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadProducts = async () => {
        try {
            const url = activeTab === 'ALL' ? '/admin/products' : `/admin/products?status=${activeTab}`;
            const data = await fetchWithAuth(url);
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setLoading(true); loadProducts(); }, [activeTab]);

    const loadProductDetail = async (id: string) => {
        setDetailLoading(true);
        try {
            const data = await fetchWithAuth(`/admin/products/${id}`);
            setSelectedProduct(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            await fetchWithAuth(`/admin/products/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            await loadProducts();
            await loadProductDetail(id);
        } catch (err: any) {
            alert(err?.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">Product Moderation</h1>
                <p className="text-muted-foreground">Review submitted products and ensure marketplace quality.</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedProduct(null); }}
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
                <div className="text-center py-20 opacity-50">Loading products...</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Product Table */}
                    <div className="xl:col-span-2">
                        {products.length === 0 ? (
                            <div className="glass rounded-2xl border border-border p-12 text-center text-muted-foreground italic">
                                No products found with status: {activeTab.replace('_', ' ')}
                            </div>
                        ) : (
                            <div className="glass rounded-2xl border border-border overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-secondary/50 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Supplier</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {products.map((p) => (
                                            <tr
                                                key={p.id}
                                                onClick={() => loadProductDetail(p.id)}
                                                className={`hover:bg-primary/5 transition-colors cursor-pointer ${selectedProduct?.id === p.id ? 'bg-primary/10' : ''}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {p.images?.[0] ? (
                                                            <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">📦</div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-sm">{p.name}</p>
                                                            <p className="text-xs text-muted-foreground">₹{p.price?.toLocaleString() ?? '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium">{p.supplier?.companyName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-muted-foreground">{p.category}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[p.status] || ''}`}>
                                                        {p.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right: Detail Panel */}
                    <div>
                        {detailLoading ? (
                            <div className="glass rounded-2xl border border-border p-12 text-center opacity-50 animate-pulse">Loading details...</div>
                        ) : selectedProduct ? (
                            <div className="glass p-6 rounded-2xl border border-border sticky top-24 animate-in fade-in zoom-in duration-300 space-y-6">
                                {/* Images */}
                                {selectedProduct.images?.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedProduct.images.map((img: string, i: number) => (
                                            <img key={i} src={img} alt={`Product ${i}`} className="h-24 w-24 rounded-xl object-cover border border-border flex-shrink-0" />
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{selectedProduct.supplier?.companyName} • {selectedProduct.supplier?.user?.email}</p>
                                    <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[selectedProduct.status] || ''}`}>
                                        {selectedProduct.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Description */}
                                {selectedProduct.description && (
                                    <section>
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-widest">Description</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                                    </section>
                                )}

                                {/* Pricing & Logistics */}
                                <section className="p-4 rounded-xl bg-secondary/30 border border-border">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        {[
                                            ['Price', `₹${selectedProduct.price?.toLocaleString() ?? '—'}`],
                                            ['Unit', selectedProduct.unit],
                                            ['MOQ', selectedProduct.moq],
                                            ['Lead Time', `${selectedProduct.leadTime}d`],
                                            ['Category', selectedProduct.category],
                                        ].map(([label, val]) => (
                                            <div key={label as string}>
                                                <p className="opacity-50 font-bold uppercase text-[10px]">{label}</p>
                                                <p className="font-medium text-foreground">{val || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Variants */}
                                {selectedProduct.variants?.length > 0 && (
                                    <section>
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-widest">Variants ({selectedProduct.variants.length})</p>
                                        <div className="space-y-2">
                                            {selectedProduct.variants.map((v: any) => (
                                                <div key={v.id} className="p-3 rounded-lg bg-secondary/20 border border-border/50 flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="font-bold">{v.name}</span>
                                                        {v.sku && <span className="ml-2 text-muted-foreground">SKU: {v.sku}</span>}
                                                    </div>
                                                    <div className="text-right">
                                                        {v.price && <span className="font-bold">₹{v.price.toLocaleString()}</span>}
                                                        <span className="ml-2 text-muted-foreground">Stock: {v.stock}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Actions */}
                                <section>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Actions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(TRANSITION_MAP[selectedProduct.status] || []).map((t) => (
                                            <button
                                                key={t.status}
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedProduct.id, t.status)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 ${t.color}`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                        {(TRANSITION_MAP[selectedProduct.status] || []).length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">No actions available for this status.</p>
                                        )}
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center p-12 text-center glass rounded-2xl border border-dashed border-border text-muted-foreground italic text-sm">
                                Click a product to view details and moderate.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
