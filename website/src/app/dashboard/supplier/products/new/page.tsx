'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { Trash2, Plus, UploadCloud, X } from "lucide-react";

export default function NewProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        moq: "100",
        leadTime: "7",
        unit: "units",
    });

    const [images, setImages] = useState<string[]>([]);
    const [variants, setVariants] = useState([{ name: '', sku: '', price: '', stock: '0' }]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchWithAuth('/products/categories');
                setCategories(data);
                if (data.length > 0) setForm(f => ({ ...f, category: data[0] }));
            } catch (err) {
                console.error("Failed to load categories", err);
            } finally {
                setFetchingCategories(false);
            }
        };
        loadCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleVariantChange = (index: number, field: string, value: string) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const addVariant = () => setVariants([...variants, { name: '', sku: '', price: '', stock: '0' }]);
    const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
    const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingImage(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const accessToken = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            });
            
            if (!res.ok) throw new Error("Image upload failed");
            const data = await res.json();
            
            setImages(prev => [...prev, data.url]);
        } catch (err: any) {
            setError(err.message || "Failed to upload image");
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await fetchWithAuth('/products', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    moq: parseInt(form.moq),
                    leadTime: parseInt(form.leadTime),
                    images,
                    variants,
                    specs: {} 
                }),
            });
            router.push('/dashboard/supplier/products');
        } catch (err: any) {
            setError(err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCategories) return <div className="text-center py-20 opacity-50">Preparing workspace...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <button onClick={() => router.back()} className="text-sm font-bold opacity-50 hover:opacity-100 transition-all flex items-center mb-6">
                    ← Back to Products
                </button>
                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">Post New Product ✨</h1>
                <p className="text-muted-foreground">Add details, images, and variations for your product catalogue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Images Section */}
                <div className="glass p-8 rounded-3xl border border-border/50 shadow-xl space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2"><UploadCloud className="w-5 h-5 text-primary"/> Product Images</h2>
                    
                    <div className="flex flex-wrap gap-4">
                        {images.map((url, idx) => (
                            <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-border group bg-secondary/20">
                                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-contain" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-destructive/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        <label className="w-32 h-32 rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all group">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                            {uploadingImage ? (
                                <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 text-primary/50 group-hover:text-primary mb-2 transition-colors" />
                                    <span className="text-xs font-semibold text-primary/70 group-hover:text-primary">Add Image</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {/* Core Details */}
                <div className="glass p-8 rounded-3xl border border-border/50 shadow-xl space-y-6">
                    <h2 className="text-xl font-bold border-b border-border pb-2">Core Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Product Name</label>
                            <input required name="name" value={form.name} onChange={handleChange} placeholder="e.g. Premium Cotton Yarn" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Category</label>
                            <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Description</label>
                        <textarea required name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your product's quality, material, and uniqueness..." className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Base Price (₹)</label>
                            <input required name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Unit</label>
                            <input required name="unit" value={form.unit} onChange={handleChange} placeholder="units/kg/meters" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Min Order (MOQ)</label>
                            <input required name="moq" type="number" value={form.moq} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Lead Time (Days)</label>
                            <input required name="leadTime" type="number" value={form.leadTime} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* Variations */}
                <div className="glass p-8 rounded-3xl border border-border/50 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">Variations <span className="text-xs font-normal opacity-50 bg-secondary px-2 py-1 rounded-full">Optional</span></h2>
                        <button type="button" onClick={addVariant} className="text-sm text-primary font-bold flex items-center gap-1 hover:brightness-110 transition-all">
                            <Plus size={16} /> Add Variant
                        </button>
                    </div>

                    {variants.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground italic text-sm">No variations added. The product defaults to a single item.</p>
                    ) : (
                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all group">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase font-bold opacity-60 ml-1">Variant Name</label>
                                        <input placeholder="e.g. Size M, Red" required value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                                    </div>
                                    <div className="w-full md:w-32 space-y-1">
                                        <label className="text-[10px] uppercase font-bold opacity-60 ml-1">SKU</label>
                                        <input placeholder="Optional" value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                                    </div>
                                    <div className="w-full md:w-32 space-y-1">
                                        <label className="text-[10px] uppercase font-bold opacity-60 ml-1">Price Override (₹)</label>
                                        <input type="number" placeholder="Optional" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                                    </div>
                                    <div className="w-full md:w-24 space-y-1">
                                        <label className="text-[10px] uppercase font-bold opacity-60 ml-1">Stock</label>
                                        <input type="number" required value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                                    </div>
                                    <button type="button" onClick={() => removeVariant(index)} className="mt-5 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Remove Variation">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className="text-destructive font-bold text-center bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in zoom-in">{error}</p>}

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="flex-1 py-4 rounded-xl bg-secondary font-bold hover:bg-secondary/80 transition-all border border-border">
                        Cancel Let Me Re-Think
                    </button>
                    <button disabled={loading} type="submit" className="flex-[2] py-4 rounded-xl premium-gradient text-white font-black shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                        {loading ? "Publishing Catalog..." : "Submit Product Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}
