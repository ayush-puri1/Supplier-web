'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AlertBanner from '@/components/ui/AlertBanner';
import { ArrowLeft, UploadCloud, X, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('units');
  const [moq, setMoq] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [variants, setVariants] = useState<Array<{ name: string; sku: string; price: string; stock: string }>>([]);

  useEffect(() => {
    fetchWithAuth('/products/categories').then((data: any) => {
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await api.post('/products/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res?.url || res?.data?.url || res;
      if (typeof url === 'string') setImages([...images, url]);
    } catch { setError('Failed to upload image'); } finally { setUploadingImage(false); }
  };

  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));

  const addVariant = () => setVariants([...variants, { name: '', sku: '', price: '', stock: '' }]);
  const updateVariant = (i: number, field: string, val: string) => {
    const v = [...variants]; (v[i] as any)[field] = val; setVariants(v);
  };
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Product name is required'); return; }
    if (!price) { setError('Price is required'); return; }
    setLoading(true);
    try {
      await fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify({
          name, category, description,
          price: parseFloat(price), unit,
          moq: parseInt(moq) || 1,
          leadTime: parseInt(leadTime) || 7,
          images,
          variants: variants.filter(v => v.name).map(v => ({ name: v.name, sku: v.sku, price: v.price ? parseFloat(v.price) : undefined, stock: parseInt(v.stock) || 0 })),
          specs: {},
        }),
      });
      router.push('/dashboard/supplier/products');
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to create product'); } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none transition-all";

  return (
    <DashboardLayout title="Add Product">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div>
          <Link href="/dashboard/supplier/products" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0D9373] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Add New Product</h1>
          <p className="text-sm text-[#6B7280]">Add details, images, and variations for your product catalogue.</p>
        </div>

        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

        {/* Images */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <h3 className="font-semibold text-[#0F1117] mb-4 flex items-center gap-2"><UploadCloud className="w-4 h-4 text-[#6B7280]" /> Product Images</h3>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#E5E7EB] group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className={`w-32 h-32 rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#0D9373] flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
              <UploadCloud className="w-6 h-6 text-[#9CA3AF] mb-1" />
              <span className="text-[10px] text-[#9CA3AF] font-semibold">{uploadingImage ? 'Uploading...' : 'Add Image'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
          </div>
        </div>

        {/* Core Details */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <h3 className="font-semibold text-[#0F1117] mb-2">Core Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Product Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your product..." className={inputCls} /></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Price ₹ *</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Unit</label><input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="units" className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">MOQ</label><input type="number" value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="10" className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Lead Time (days)</label><input type="number" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="7" className={inputCls} /></div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0F1117] flex items-center gap-2">Variations <span className="text-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-full px-2 py-0.5 text-[#6B7280] font-bold">Optional</span></h3>
            <button onClick={addVariant} className="text-xs font-semibold text-[#0D9373] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Variant</button>
          </div>
          {variants.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] italic">No variations added. The product defaults to a single item.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 bg-[#F9FAFB] rounded-xl p-4 items-end">
                  <div><label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Name</label><input type="text" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} placeholder="Size M" className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#0D9373] outline-none" /></div>
                  <div><label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">SKU</label><input type="text" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} placeholder="SKU-001" className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#0D9373] outline-none" /></div>
                  <div><label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Price ₹</label><input type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} placeholder="—" className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#0D9373] outline-none" /></div>
                  <div><label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Stock</label><input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} placeholder="100" className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#0D9373] outline-none" /></div>
                  <button onClick={() => removeVariant(i)} className="p-2 text-red-400 hover:text-red-600 transition-colors self-end"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/supplier/products')} className="flex-1 py-3 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:border-[#0D9373] hover:text-[#0D9373] transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 rounded-full bg-[#0D9373] text-white font-semibold text-sm hover:bg-[#0A7A61] transition-all hover:shadow-xl hover:shadow-[#0D9373]/20 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Product Request'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
