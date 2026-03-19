
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

export default function SupplierProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProducts = async () => {
        try {
            const data = await fetchWithAuth('/products');
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
            loadProducts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center py-20 opacity-50">Loading products...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Products</h1>
                    <p className="text-muted-foreground">Manage your product catalog and track moderation status.</p>
                </div>
                <Link href="/dashboard/supplier/products/new">
                    <button className="px-6 py-3 premium-gradient text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer">
                        + Add New Product
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass rounded-2xl border border-dashed border-border opacity-50 italic">
                        No products found. Start by adding your first product.
                    </div>
                ) : (
                    products.map((p) => (
                        <div key={p.id} className="glass rounded-2xl border border-border overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                            <div className="h-48 bg-secondary/30 relative overflow-hidden flex items-center justify-center">
                                {p.images && p.images[0] ? (
                                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl grayscale opacity-20">📦</span>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'LIVE' ? 'bg-emerald-500 text-white' :
                                        p.status === 'PENDING_APPROVAL' ? 'bg-amber-500 text-white' :
                                            p.status === 'REJECTED' ? 'bg-red-500 text-white' :
                                                'bg-zinc-800 text-white'
                                        }`}>
                                        {p.status.replace('_', ' ')}
                                    </span>
                                </div>
                                {p.status === 'REJECTED' && p.rejectionReason && (
                                    <div className="absolute bottom-2 left-4 right-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-red-500 text-white p-2 rounded-lg text-[10px] shadow-xl border border-white/20">
                                            <span className="font-bold block mb-0.5">REJECTION REASON:</span>
                                            {p.rejectionReason}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold mb-1 truncate">{p.name}</h3>
                                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{p.description || 'No description provided.'}</p>

                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-2xl font-black text-gradient">₹{p.price.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">MOQ: {p.moq || 100} units</p>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-accent transition-all">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
