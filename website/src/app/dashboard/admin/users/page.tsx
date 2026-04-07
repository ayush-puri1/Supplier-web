'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, X, ShieldOff } from 'lucide-react';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Detail sidebar
  const [resetPassword, setResetPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    try { const data = await fetchWithAuth('/admin/users'); setUsers(Array.isArray(data) ? data : []); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  // Access check
  if (!loading && currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <DashboardLayout title="User Management">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
          <ShieldOff className="w-16 h-16 text-[#D1D5DB] mb-4" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1117] mb-2">Access Denied</h1>
          <p className="text-sm text-[#6B7280]">This page is restricted to Super Admin users only.</p>
        </div>
      </DashboardLayout>
    );
  }

  const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
  const suppliers = users.filter(u => u.role === 'SUPPLIER');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setCreating(true);
    try {
      await fetchWithAuth('/admin/users', { method: 'POST', body: JSON.stringify({ email: newEmail, password: newPassword }) });
      setNewEmail(''); setNewPassword(''); setShowCreate(false);
      setSuccess('Admin account created successfully');
      await loadUsers();
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to create admin'); } finally { setCreating(false); }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); await loadUsers(); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); } finally { setActionLoading(false); }
  };

  const handleChangeRole = async (id: string, role: string) => {
    if (!confirm(`Change role to ${role}?`)) return;
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }); await loadUsers(); if (selected?.id === id) setSelected({ ...selected, role }); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); } finally { setActionLoading(false); }
  };

  const handleResetPassword = async (id: string) => {
    if (resetPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    setActionLoading(true);
    try { await fetchWithAuth(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword: resetPassword }) }); setResetPassword(''); setSuccess('Password reset successfully'); } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); } finally { setActionLoading(false); }
  };

  if (loading) return <DashboardLayout title="User Management"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = { SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200', ADMIN: 'bg-blue-50 text-blue-600 border-blue-200', SUPPLIER: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${styles[role] || styles.SUPPLIER}`}>{role.replace('_', ' ')}</span>;
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-8 animate-fade-in-up">
        {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="flex items-center justify-between">
          <div><h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">User Management</h1><p className="text-sm text-[#6B7280]">Create admins, manage roles, and control account access.</p></div>
          <button onClick={() => setShowCreate(!showCreate)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${showCreate ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' : 'bg-[#0D9373] text-white hover:bg-[#0A7A61] shadow-lg shadow-[#0D9373]/20'}`}>
            {showCreate ? <><X className="w-4 h-4 inline mr-1" /> Cancel</> : <><Plus className="w-4 h-4 inline mr-1" /> Create Admin</>}
          </button>
        </div>

        {showCreate && (
          <div className="animate-fade-in-down">
            <form onSubmit={handleCreateAdmin} className="bg-gradient-to-r from-[#ECFDF5] to-white rounded-2xl border border-[#0D9373]/30 p-6">
              <h3 className="font-semibold text-[#0F1117] mb-4">Create New Admin Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@delraw.com" required className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-[#374151] mb-1.5">Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] focus:ring-2 focus:ring-[#0D9373]/20 outline-none" /></div>
                <button type="submit" disabled={creating} className="py-3 rounded-xl bg-[#0D9373] text-white font-semibold text-sm hover:bg-[#0A7A61] transition-all disabled:opacity-50">{creating ? 'Creating...' : 'Create Admin'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Admins & Super Admins */}
        <div>
          <h2 className="text-lg font-bold text-[#0F1117] mb-4">👑 Admins & Super Admins ({admins.length})</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#6B7280]"><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-[#E5E7EB]/50">
                    {admins.map((u) => (
                      <tr key={u.id} onClick={() => { setSelected(u); setResetPassword(''); }} className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors ${selected?.id === u.id ? 'bg-[#ECFDF5]/50' : ''}`}>
                        <td className="px-6 py-4"><p className="text-sm font-semibold">{u.email}</p><p className="text-[10px] text-[#9CA3AF]">Joined {new Date(u.createdAt).toLocaleDateString()}</p></td>
                        <td className="px-6 py-4">{roleBadge(u.role)}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${u.isActive !== false ? 'text-emerald-600' : 'text-red-600'}`}><span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />{u.isActive !== false ? 'Active' : 'Suspended'}</span></td>
                        <td className="px-6 py-4 text-right"><button disabled={actionLoading || u.id === currentUser?.id} onClick={(e) => { e.stopPropagation(); handleToggleActive(u.id, u.isActive === false); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-30 ${u.isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>{u.isActive !== false ? 'Suspend' : 'Activate'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              {selected && (selected.role === 'ADMIN' || selected.role === 'SUPER_ADMIN') ? (
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] sticky top-24 animate-scale-in space-y-6">
                  <div><p className="text-lg font-bold">{selected.email}</p><p className="text-[10px] text-[#9CA3AF] font-mono">{selected.id}</p><div className="flex items-center gap-2 mt-2">{roleBadge(selected.role)}<span className={`text-[10px] font-bold ${selected.isActive !== false ? 'text-emerald-500' : 'text-red-500'}`}>{selected.isActive !== false ? '● Active' : '● Suspended'}</span></div></div>

                  <section>
                    <p className="text-xs font-bold uppercase text-[#6B7280] mb-3 tracking-widest">Change Role</p>
                    <div className="flex gap-2">{['SUPPLIER', 'ADMIN', 'SUPER_ADMIN'].map(r => (<button key={r} disabled={actionLoading || selected.id === currentUser?.id} onClick={() => handleChangeRole(selected.id, r)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selected.role === r ? 'bg-[#0D9373] text-white border-[#0D9373]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0D9373] hover:text-[#0D9373]'} disabled:opacity-30`}>{r.replace('_', ' ')}</button>))}</div>
                  </section>

                  <section>
                    <p className="text-xs font-bold uppercase text-[#6B7280] mb-3 tracking-widest">Force Password Reset</p>
                    <div className="flex gap-2">
                      <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="New password" className="flex-1 px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm focus:border-[#0D9373] outline-none" />
                      <button disabled={actionLoading || !resetPassword} onClick={() => handleResetPassword(selected.id)} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all disabled:opacity-50">Reset</button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] text-[#9CA3AF] italic text-sm">Select an admin to manage.</div>
              )}
            </div>
          </div>
        </div>

        {/* Suppliers */}
        <div>
          <h2 className="text-lg font-bold text-[#0F1117] mb-4">🏢 Suppliers ({suppliers.length})</h2>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#6B7280]"><th className="px-6 py-4">User</th><th className="px-6 py-4">Company</th><th className="px-6 py-4">Supplier Status</th><th className="px-6 py-4">Account</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E5E7EB]/50">
                {suppliers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4"><p className="text-sm font-semibold">{u.email}</p><p className="text-[10px] text-[#9CA3AF]">{new Date(u.createdAt).toLocaleDateString()}</p></td>
                    <td className="px-6 py-4 text-sm">{u.supplier?.companyName || '—'}</td>
                    <td className="px-6 py-4">{u.supplier ? <StatusBadge status={u.supplier.status} /> : <span className="text-xs text-[#9CA3AF]">—</span>}</td>
                    <td className="px-6 py-4"><span className={`text-[10px] font-bold ${u.isActive !== false ? 'text-emerald-500' : 'text-red-500'}`}>{u.isActive !== false ? '● Active' : '● Suspended'}</span></td>
                    <td className="px-6 py-4 text-right"><button disabled={actionLoading} onClick={() => handleToggleActive(u.id, u.isActive === false)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-30 ${u.isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>{u.isActive !== false ? 'Suspend' : 'Activate'}</button></td>
                  </tr>
                ))}
                {suppliers.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#9CA3AF] italic">No supplier accounts.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
