'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, Shield, Building2, MapPin, Globe, LayoutDashboard, Users, Package, LogOut, CheckCircle2 , Crown } from 'lucide-react';

/* ══════════════════════════════════════════════
   ADMIN SIDEBAR
══════════════════════════════════════════════ */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} />, href: '/dashboard/admin', active: false },
    { label: 'Suppliers', icon: <Users size={16} />, href: '/dashboard/admin/suppliers', active: true },
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: false },
    { label: 'Config', icon: <Shield size={16} />, href: '/dashboard/admin/config', active: false },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Admin Portal</div>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'admin@delraw.com'}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{user?.role?.replace('_', ' ') || 'ADMIN'}</p>
          </div>
        )}
        <button onClick={() => { logout?.(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(248,113,113,0.65)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════
   REUSABLE BADGE
══════════════════════════════════════════════ */
function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const getStyle = () => {
    switch (status) {
      case 'VERIFIED': case 'LIVE': return { dot: '#34D399', bg: 'rgba(52,211,153,0.1)', color: '#34D399', label: status };
      case 'SUBMITTED': case 'PENDING_APPROVAL': case 'UNDER_REVIEW': return { dot: '#FBBF24', bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', label: 'PENDING' };
      case 'REJECTED': case 'DELISTED': case 'SUSPENDED': return { dot: '#F87171', bg: 'rgba(248,113,113,0.1)', color: '#F87171', label: status };
      default: return { dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', label: status };
    }
  };
  const sc = getStyle();
  const px = size === 'md' ? '6px 14px' : '4px 10px';
  const fs = size === 'md' ? 11 : 9;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: px, borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: fs, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: sc.color, background: sc.bg }}>
      <span style={{ width: size === 'md' ? 6 : 4, height: size === 'md' ? 6 : 4, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 ${size === 'md' ? 8 : 5}px ${sc.dot}` }} />
      {sc.label}
    </span>
  );
}

export default function SupplierDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWithAuth(`/admin/suppliers/${id}`).then(setSupplier).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!confirm('Approve this supplier?')) return;
    setActionLoading(true);
    try { 
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'VERIFIED' }) }); 
      router.push('/dashboard/admin/suppliers'); 
    } catch (err: any) { alert(err?.response?.data?.message || 'Failed to approve'); setActionLoading(false); }
  };

  const handleReject = async () => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setActionLoading(true);
    try { 
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }) }); 
      router.push('/dashboard/admin/suppliers'); 
    } catch (err: any) { alert(err?.response?.data?.message || 'Failed to reject'); setActionLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isPending = supplier?.status === 'SUBMITTED' || supplier?.status === 'UNDER_REVIEW';
  
  const Card = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: any }) => (
    <div style={{ background: '#1E1E1E', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 24, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 14 }}>
        <Icon size={18} color="#3B82F6" />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'white' }}>{value || '—'}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-num:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#141414; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .action-btn { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; padding: 12px 24px; border-radius: 12px; display: flex; alignItems: center; gap: 8px; transition: all 0.2s; border: none; }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <AdminSidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ position: 'relative', height: 54, background: '#0A0A0A', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
             {/* CENTERED ADMIN TEXT */}
             <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 800, letterSpacing: '0.15em', color: 'white' }}>ADMIN</div>
             <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
               <ArrowLeft size={14} /> Back
             </button>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            {!supplier ? (
              <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 16 }}>Supplier not found</h2>
                <button onClick={() => router.back()} style={{ color: '#3B82F6', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Go Back</button>
              </div>
            ) : (
              <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                
                {/* Top Header Card */}
                <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '32px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                        {supplier.companyName}
                      </h1>
                      <StatusBadge status={supplier.status} size="md" />
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Registered on {new Date(supplier.createdAt).toLocaleDateString()}</p>
                  </div>

                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={handleReject} disabled={actionLoading} className="action-btn" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
                        <XCircle size={16} /> Reject
                      </button>
                      <button onClick={handleApprove} disabled={actionLoading} className="action-btn" style={{ background: '#3B82F6', color: 'white', boxShadow: '0 0 15px rgba(37,99,235,0.35)' }}>
                        <CheckCircle2 size={16} /> Approve Supplier
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                  <Card title="Business Registration" icon={Building2}>
                    <Field label="GST Number" value={supplier.gstNumber} />
                    <Field label="PAN Number" value={supplier.panNumber} />
                    <Field label="Business Type" value={supplier.businessType} />
                    <Field label="Established" value={supplier.yearEstablished} />
                  </Card>

                  <Card title="Operational Data" icon={Globe}>
                    <Field label="Workforce" value={supplier.workforceSize} />
                    <Field label="Monthly Cap" value={supplier.monthlyCapacity} />
                    <Field label="Min Order" value={supplier.moq} />
                    <Field label="Lead Time" value={supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : '—'} />
                  </Card>

                  <Card title="Contact Information" icon={Shield}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Field label="Primary Contact" value={supplier.contactName} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Field label="Email" value={supplier.user?.email} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Field label="Phone" value={supplier.phone} />
                    </div>
                  </Card>

                  <div style={{ background: '#1E1E1E', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 24, height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 14 }}>
                      <FileText size={18} color="#3B82F6" />
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'white' }}>Verification Files</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(supplier.documents || []).length > 0 ? supplier.documents.map((doc: any) => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FileText size={18} color="rgba(255,255,255,0.3)" />
                            <div>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'white' }}>{doc.type?.replace(/_/g, ' ')}</p>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{doc.fileName || 'document_file.pdf'}</p>
                            </div>
                          </div>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: '#3B82F6', transition: 'all 0.2s' }}>
                            <Download size={14} />
                          </a>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: '20px 0', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No documents provided.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
