'use client';

import React, { useState, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import AlertBanner from '@/components/ui/AlertBanner';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, UploadCloud, X, Plus, Trash2, Package,
  LayoutDashboard, User, Bell, Settings, LogOut,
  Tag, Layers, ImageIcon, Check,
} from 'lucide-react';

/* ── Sidebar ── */
function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, href: '/dashboard/supplier',              active: false },
    { label: 'My Products',      icon: <Package size={16} />,         href: '/dashboard/supplier/products',      active: true  },
    { label: 'Business Profile', icon: <User size={16} />,            href: '/dashboard/supplier/profile',       active: false },
    { label: 'Notifications',    icon: <Bell size={16} />,            href: '/dashboard/supplier/notifications', active: false },
    { label: 'Settings',         icon: <Settings size={16} />,        href: '/dashboard/supplier/settings',      active: false },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0D0D12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>B2B Portal</div>
        </div>
      </Link>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? 'white' : 'rgba(255,255,255,0.38)', background: item.active ? 'rgba(37,99,235,0.14)' : 'transparent', borderLeft: item.active ? '2px solid #60A5FA' : '2px solid transparent', transition: 'all 0.2s' }}>
            <span style={{ color: item.active ? '#60A5FA' : 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
        {user && (
          <div style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user?.email || 'supplier@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'SUPPLIER'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Section Card wrapper ── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#15151C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>{title}</h3>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

/* ── Dark field helpers ── */
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const CATEGORIES = [
    'Fabrics',
    'Trims and Accessories',
    'Threads and Yarns',
    'Interlining and Support Materials',
    'Printing and Embellishments',
    'Packaging Materials',
    'Dyes and Chemicals',
    'Leather and Synthetic Materials',
    'Technical and Specialty Fabrics',
  ];

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

  // Categories are static — no fetch needed

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
  const updateVariant = (i: number, field: string, val: string) => { const v = [...variants]; (v[i] as any)[field] = val; setVariants(v); };
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

  /* Focus ring via JS because we can't do :focus in inline styles */
  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#3B82F6';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0F0F14; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        select option { background:#1a1a24; color:white; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .anim-up { animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0F14' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <header style={{ height: 54, background: '#0D0D12', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
            <Link href="/dashboard/supplier/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, transition: 'color 0.2s' }}
              onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
              <ArrowLeft size={14} /> My Products
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Add New Product</span>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 80px' }}>
            <div className="anim-up" style={{ maxWidth: 780, margin: '0 auto' }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Add New Product</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>Fill in product details. It will go live after admin review.</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginBottom: 20 }}>
                  <AlertBanner type="error" message={error} onClose={() => setError('')} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Images */}
                <Section title="Product Images" icon={<ImageIcon size={15} />}>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 12 }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: 100, height: 100, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 6, background: 'rgba(0,0,0,0.7)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    <label style={{ width: 100, height: 100, borderRadius: 10, border: `2px dashed ${uploadingImage ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploadingImage ? 'not-allowed' : 'pointer', gap: 6, transition: 'border-color 0.2s', flexShrink: 0, opacity: uploadingImage ? 0.6 : 1 }}>
                      {uploadingImage
                        ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        : <UploadCloud size={20} color="rgba(255,255,255,0.25)" />
                      }
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>{uploadingImage ? 'Uploading' : 'Add Image'}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                    </label>
                  </div>
                </Section>

                {/* Core Details */}
                <Section title="Core Details" icon={<Tag size={15} />}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Product Name *</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Cotton Tee" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                    </div>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' as const }} onFocus={focusInput} onBlur={blurInput}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe your product — materials, use case, key features..." style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }} onFocus={focusInput} onBlur={blurInput} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Price ₹ *', value: price, onChange: setPrice, placeholder: '100', type: 'number' },
                      { label: 'Unit',       value: unit,  onChange: setUnit,  placeholder: 'units', type: 'text'   },
                      { label: 'MOQ',        value: moq,   onChange: setMoq,   placeholder: '10',    type: 'number' },
                      { label: 'Lead Time (days)', value: leadTime, onChange: setLeadTime, placeholder: '7', type: 'number' },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={labelStyle}>{f.label}</label>
                        <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Variants */}
                <Section title="Variations" icon={<Layers size={15} />}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
                      {variants.length === 0 ? 'Optional — defaults to single-item product.' : `${variants.length} variant${variants.length !== 1 ? 's' : ''} added`}
                    </p>
                    <button onClick={addVariant} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.08)', color: '#60A5FA', fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      <Plus size={12} /> Add Variant
                    </button>
                  </div>
                  {variants.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {variants.map((v, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto', gap: 10, padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'end' }}>
                          {[
                            { label: 'Variant Name', field: 'name', value: v.name, placeholder: 'Size M' },
                            { label: 'SKU',           field: 'sku',  value: v.sku,  placeholder: 'SKU-001' },
                            { label: 'Price ₹',       field: 'price',value: v.price,placeholder: '—'       },
                            { label: 'Stock',         field: 'stock',value: v.stock,placeholder: '100'     },
                          ].map(f => (
                            <div key={f.field}>
                              <label style={{ ...labelStyle, marginBottom: 6 }}>{f.label}</label>
                              <input type={f.field === 'name' || f.field === 'sku' ? 'text' : 'number'} value={f.value} onChange={e => updateVariant(i, f.field, e.target.value)} placeholder={f.placeholder}
                                style={{ ...inputStyle, padding: '10px 12px', fontSize: 13 }} onFocus={focusInput} onBlur={blurInput} />
                            </div>
                          ))}
                          <button onClick={() => removeVariant(i)} style={{ padding: '10px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.06)', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Submit */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                  <button onClick={() => router.push('/dashboard/supplier/products')} style={{ flex: 1, padding: '13px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                  >
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '13px', borderRadius: 11, border: 'none', background: loading ? 'rgba(37,99,235,0.5)' : '#2563EB', color: 'white', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 28px rgba(37,99,235,0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loading
                      ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting…</>
                      : <><Check size={14} /> Submit for Review</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
