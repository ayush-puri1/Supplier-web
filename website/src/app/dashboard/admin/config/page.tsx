'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ShieldOff } from 'lucide-react';

export default function SystemConfigPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [businessCommission, setBusinessCommission] = useState('');
  const [defaultTrustScore, setDefaultTrustScore] = useState('');
  const [maxFailedLogins, setMaxFailedLogins] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [maxProductsPerSupplier, setMaxProductsPerSupplier] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [supplierAutoApprove, setSupplierAutoApprove] = useState(false);
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/config').then((data: any) => {
      setConfig(data);
      setBusinessCommission(data.businessCommission?.toString() || '10');
      setDefaultTrustScore(data.defaultTrustScore?.toString() || '50');
      setMaxFailedLogins(data.maxFailedLogins?.toString() || '5');
      setPlatformName(data.platformName || 'Delraw');
      setSupportEmail(data.supportEmail || 'support@delraw.com');
      setMaxProductsPerSupplier(data.maxProductsPerSupplier?.toString() || '100');
      setIsMaintenanceMode(data.isMaintenanceMode || false);
      setSupplierAutoApprove(data.supplierAutoApprove || false);
      setAllowNewRegistrations(data.allowNewRegistrations !== false);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Access check
  if (!loading && user?.role !== 'SUPER_ADMIN') {
    return (
      <DashboardLayout title="System Config">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
          <ShieldOff className="w-16 h-16 text-[#D1D5DB] mb-4" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1117] mb-2">Access Denied</h1>
          <p className="text-sm text-[#6B7280]">This page is restricted to Super Admin users only.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await fetchWithAuth('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          businessCommission: parseFloat(businessCommission) || 10,
          defaultTrustScore: parseInt(defaultTrustScore) || 50,
          maxFailedLogins: parseInt(maxFailedLogins) || 5,
          platformName, supportEmail,
          maxProductsPerSupplier: parseInt(maxProductsPerSupplier) || 100,
          isMaintenanceMode, supplierAutoApprove, allowNewRegistrations,
        }),
      });
      setSuccess('Configuration saved successfully.');
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="System Config"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none transition-all";

  return (
    <DashboardLayout title="System Config">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold bg-gradient-to-r from-[#0D9373] to-[#065F46] bg-clip-text text-transparent mb-1">System Configuration</h1>
          <p className="text-sm text-[#6B7280]">Adjust platform-wide thresholds, commissions, and operational mode.</p>
        </div>

        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h3 className="font-semibold text-[#0F1117]">Financial Controls</h3>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Platform Commission (%)</label><input type="number" value={businessCommission} onChange={(e) => setBusinessCommission(e.target.value)} className={inputCls} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h3 className="font-semibold text-[#0F1117]">Trust Thresholds</h3>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Default Trust Score</label><input type="number" value={defaultTrustScore} onChange={(e) => setDefaultTrustScore(e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Max Failed Logins</label><input type="number" value={maxFailedLogins} onChange={(e) => setMaxFailedLogins(e.target.value)} className={inputCls} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h3 className="font-semibold text-[#0F1117]">Platform Identity</h3>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Platform Name</label><input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Support Email</label><input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={inputCls} /></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h3 className="font-semibold text-[#0F1117]">Supplier Limits</h3>
              <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Max Products Per Supplier</label><input type="number" value={maxProductsPerSupplier} onChange={(e) => setMaxProductsPerSupplier(e.target.value)} className={inputCls} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
              <h3 className="font-semibold text-[#0F1117]">Critical Operations</h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div><p className="text-sm font-semibold text-[#0F1117]">Maintenance Mode</p><p className="text-xs text-[#6B7280]">Blocks all non-admin traffic</p></div>
                <ToggleSwitch enabled={isMaintenanceMode} onChange={setIsMaintenanceMode} color="bg-red-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div><p className="text-sm font-semibold text-[#0F1117]">Supplier Auto-Approve</p><p className="text-xs text-[#6B7280]">Auto-verify new profiles</p></div>
                <ToggleSwitch enabled={supplierAutoApprove} onChange={setSupplierAutoApprove} color="bg-[#0D9373]" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div><p className="text-sm font-semibold text-[#0F1117]">Allow Registrations</p><p className="text-xs text-[#6B7280]">Enable public supplier sign-up</p></div>
                <ToggleSwitch enabled={allowNewRegistrations} onChange={setAllowNewRegistrations} color="bg-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0D9373] to-[#065F46] rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Safety Notice</h3>
              <p className="text-sm text-white/70 mb-5">Changes saved here will affect all users instantly. Ensure you have verified the new thresholds before applying.</p>
              <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-white text-[#0D9373] font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'APPLY CHANGES NOW'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
