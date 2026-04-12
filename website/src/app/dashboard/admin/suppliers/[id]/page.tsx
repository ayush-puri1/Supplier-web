'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, Shield, Building2, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';

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
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify({ status: 'VERIFIED' }) 
      }); 
      router.push('/dashboard/admin/suppliers'); 
    } catch (err: any) { 
      alert(err?.response?.data?.message || 'Failed to approve'); 
      setActionLoading(false); 
    }
  };

  const handleReject = async () => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setActionLoading(true);
    try { 
      await fetchWithAuth(`/admin/suppliers/${id}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }) 
      }); 
      router.push('/dashboard/admin/suppliers'); 
    } catch (err: any) { 
      alert(err?.response?.data?.message || 'Failed to reject'); 
      setActionLoading(false); 
    }
  };

  if (loading) return (
    <DashboardLayout title="Supplier Detail">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" text="Fetching profile details..." />
      </div>
    </DashboardLayout>
  );

  if (!supplier) return (
    <DashboardLayout title="Supplier Detail">
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 16 }}>Supplier not found</h2>
        <button onClick={() => router.back()} style={{ color: 'var(--blue-400)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    </DashboardLayout>
  );

  const isPending = supplier.status === 'SUBMITTED' || supplier.status === 'UNDER_REVIEW';
  
  const Card = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: any }) => (
    <div style={{
      background: '#16161D',
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.06)',
      padding: 24,
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
        <Icon size={16} color="var(--blue-400)" />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{value || '—'}</p>
    </div>
  );

  return (
    <DashboardLayout title="Supplier Detail">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        
        {/* Top Header Card */}
        <div style={{
          background: '#16161D',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '32px 32px',
          marginBottom: 32,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          animation: 'fadeUp 0.5s ease-out both',
        }}>
          <div>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>
              <ArrowLeft size={14} /> Back to Directory
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                {supplier.companyName}
              </h1>
              <StatusBadge status={supplier.status} size="md" />
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Registered on {new Date(supplier.createdAt).toLocaleDateString()}</p>
          </div>

          {isPending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={handleReject} 
                disabled={actionLoading} 
                style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <XCircle size={15} /> Reject
              </button>
              <button 
                onClick={handleApprove} 
                disabled={actionLoading} 
                style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--blue-600)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}
              >
                <CheckCircle size={15} /> Approve Supplier
              </button>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, animation: 'fadeUp 0.6s 0.1s ease-out both' }}>
          
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

          <div style={{ height: '100%' }}>
            <div style={{
              background: '#16161D',
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: 24,
              height: '100%',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
                <FileText size={16} color="var(--blue-400)" />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Verification Files</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(supplier.documents || []).length > 0 ? supplier.documents.map((doc: any) => (
                  <div key={doc.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileText size={18} color="rgba(255,255,255,0.3)" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{doc.type?.replace(/_/g, ' ')}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{doc.fileName || 'document_file.pdf'}</p>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: 'var(--blue-400)', transition: 'all 0.2s' }}>
                      <Download size={14} />
                    </a>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No documents provided.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
