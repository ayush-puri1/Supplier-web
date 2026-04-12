'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, LayoutDashboard, Users, Package, Shield, LogOut, BarChart3, History, Search, Plus, X, ShieldOff , Crown } from 'lucide-react';
import { SuperAdminSidebar } from '../../super-admin/page';

/* ══════════════════════════════════════════════
   ADMIN SIDEBAR
══════════════════════════════════════════════ */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} />, href: '/dashboard/admin', active: false },
    { label: 'Analytics', icon: <BarChart3 size={16} />, href: '/dashboard/admin/analytics', active: false },
    { label: 'Suppliers', icon: <Users size={16} />, href: '/dashboard/admin/suppliers', active: false },
    { label: 'Products', icon: <Package size={16} />, href: '/dashboard/admin/products', active: false },
    { label: 'Audit Logs', icon: <History size={16} />, href: '/dashboard/admin/audit-logs', active: false },
    
    { label: 'Users', icon: <Users size={16} />, href: '/dashboard/admin/users', active: true },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#050505', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '28px 14px 24px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.55)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: "var(--font-heading)" }}>D</span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>Delraw</div>
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

function CustomAlert({ type, message, onClose }: { type: 'success' | 'error', message: string, onClose: () => void }) {
  const isErr = type === 'error';
  return (
    <div style={{ padding: '16px 20px', borderRadius: 12, background: isErr ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${isErr ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeInDown 0.3s ease-out' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: isErr ? '#FCA5A5' : '#6EE7B7' }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: isErr ? '#F87171' : '#34D399', cursor: 'pointer' }}><X size={16} /></button>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, any> = { 
    SUPER_ADMIN: { bg: 'rgba(168,85,247,0.1)', color: '#C084FC', border: 'rgba(168,85,247,0.2)' },
    ADMIN: { bg: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: 'rgba(59,130,246,0.2)' },
    SUPPLIER: { bg: 'rgba(52,211,153,0.1)', color: '#34D399', border: 'rgba(52,211,153,0.2)' }
  };
  const s = styles[role] || styles.SUPPLIER;
  return <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 6, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{role.replace('_', ' ')}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, any> = {
    VERIFIED: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34D399', border: 'rgba(52, 211, 153, 0.2)' },
    LIVE: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34D399', border: 'rgba(52, 211, 153, 0.2)' },
    PENDING_APPROVAL: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.2)' },
    UNDER_REVIEW: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.2)' },
    SUBMITTED: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.2)' },
    REJECTED: { bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171', border: 'rgba(248, 113, 113, 0.2)' },
    SUSPENDED: { bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171', border: 'rgba(248, 113, 113, 0.2)' }
  };
  const config = configs[status] || { bg: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255, 255, 255, 0.1)' };
  return (
    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 6, background: config.bg, border: `1px solid ${config.border}`, color: config.color, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function UserManagementPage() {
  const router = useRouter();
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

  // Access check (DISABLED FOR NOW)
  /*
  if (false && (!loading && currentUser?.role !== 'SUPER_ADMIN')) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <ShieldOff size={64} color="rgba(255,255,255,0.1)" style={{ marginBottom: 24 }} />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 8 }}>Access Denied</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>This page is restricted to Super Admin users only.</p>
        </div>
      </div>
    );
  }
  */

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:#0A0A0A; color:white; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px; height:4px;} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        
        .list-row { transition: all 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; }
        .list-row:hover { background: rgba(255,255,255,0.02); }
        .list-row.selected { background: rgba(37,99,235,0.05); }
        
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>
        {currentUser?.role === 'SUPER_ADMIN' ? (
          <SuperAdminSidebar active="users" />
        ) : (
          <AdminSidebar />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* HEADER */}
          <header style={{ position: 'relative', height: 54, background: '#050505', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
             {/* CENTERED ADMIN TEXT */}
              
             <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
               <ArrowLeft size={14} /> Back
             </button>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Search size={14} color="rgba(255,255,255,0.3)" />
               <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>User Access Control</span>
             </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              
              {error && <CustomAlert type="error" message={error} onClose={() => setError('')} />}
              {success && <CustomAlert type="success" message={success} onClose={() => setSuccess('')} />}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>User Management</h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Create admins, manage roles, and control account access.</p>
                </div>
                <button 
                  onClick={() => setShowCreate(!showCreate)} 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: showCreate ? '1px solid rgba(255,255,255,0.1)' : 'none', background: showCreate ? 'rgba(255,255,255,0.05)' : '#2563EB', color: 'white', transition: 'all 0.2s' }}
                >
                  {showCreate ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Create Admin</>}
                </button>
              </div>

              {showCreate && (
                <div style={{ marginBottom: 32, animation: 'fadeInDown 0.3s ease-out' }}>
                  <form onSubmit={handleCreateAdmin} style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(20,20,20,1) 100%)', borderRadius: 16, border: '1px solid rgba(37,99,235,0.2)', padding: 32 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 20 }}>Create New Admin Account</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Email</label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@delraw.com" required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} />
                      </div>
                      <button type="submit" disabled={creating} style={{ padding: '12px 16px', borderRadius: 12, background: '#2563EB', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.5 : 1 }}>
                        {creating ? 'Creating...' : 'Create Admin'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <>
                  {/* ADMINS SECTION */}
                  <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>👑 Admins & Super Admins ({admins.length})</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 32, marginBottom: 48 }}>
                    <div>
                      <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                              <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                              <th style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {admins.map(u => (
                              <tr key={u.id} onClick={() => { setSelected(u); setResetPassword(''); }} className={`list-row ${selected?.id === u.id ? 'selected' : ''}`}>
                                <td style={{ padding: '16px 20px' }}>
                                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 2 }}>{u.email}</p>
                                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                  <RoleBadge role={u.role} />
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: u.isActive !== false ? '#34D399' : '#F87171' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive !== false ? '#34D399' : '#F87171' }} />
                                    {u.isActive !== false ? 'Active' : 'Suspended'}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                  <button disabled={actionLoading || u.id === currentUser?.id} onClick={e => { e.stopPropagation(); handleToggleActive(u.id, u.isActive === false); }} style={{ padding: '6px 12px', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: u.isActive !== false ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', color: u.isActive !== false ? '#EF4444' : '#34D399', opacity: (actionLoading || u.id === currentUser?.id) ? 0.3 : 1 }}>
                                    {u.isActive !== false ? 'Suspend' : 'Activate'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ADMIN DETAIL */}
                    <div>
                      {selected && (selected.role === 'ADMIN' || selected.role === 'SUPER_ADMIN') ? (
                        <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24, position: 'sticky', top: 32 }}>
                          <div style={{ marginBottom: 24 }}>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{selected.email}</p>
                            <p style={{ fontFamily: 'var(--font-num)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{selected.id}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <RoleBadge role={selected.role} />
                              <span style={{ fontSize: 11, fontWeight: 700, color: selected.isActive !== false ? '#34D399' : '#F87171' }}>
                                {selected.isActive !== false ? '● Active' : '● Suspended'}
                              </span>
                            </div>
                          </div>

                          <div style={{ marginBottom: 24 }}>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Change Role</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {['SUPPLIER', 'ADMIN', 'SUPER_ADMIN'].map(r => (
                                <button key={r} disabled={actionLoading || selected.id === currentUser?.id} onClick={() => handleChangeRole(selected.id, r)} style={{ padding: '8px 12px', borderRadius: 8, border: selected.role === r ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)', background: selected.role === r ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', color: selected.role === r ? '#60A5FA' : 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', opacity: (actionLoading || selected.id === currentUser?.id) ? 0.3 : 1 }}>
                                  {r.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Force Password Reset</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="New password" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none' }} />
                              <button disabled={actionLoading || !resetPassword} onClick={() => handleResetPassword(selected.id)} style={{ padding: '10px 20px', borderRadius: 10, background: '#F59E0B', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, cursor: (!resetPassword || actionLoading) ? 'not-allowed' : 'pointer', opacity: (!resetPassword || actionLoading) ? 0.5 : 1 }}>
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.05)', height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Select an admin to manage roles and passwords.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SUPPLIERS SECTION */}
                  <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>🏢 Suppliers ({suppliers.length})</h2>
                  <div style={{ background: '#1E1E1E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline Status</th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</th>
                          <th style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {suppliers.map(u => (
                          <tr key={u.id} className="list-row">
                            <td style={{ padding: '16px 20px' }}>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 2 }}>{u.email}</p>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{new Date(u.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td style={{ padding: '16px 20px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{u.supplier?.companyName || '—'}</td>
                            <td style={{ padding: '16px 20px' }}>{u.supplier ? <StatusBadge status={u.supplier.status} /> : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>—</span>}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: u.isActive !== false ? '#34D399' : '#F87171' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive !== false ? '#34D399' : '#F87171' }} />
                                {u.isActive !== false ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                              <button disabled={actionLoading} onClick={() => handleToggleActive(u.id, u.isActive === false)} style={{ padding: '6px 12px', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: u.isActive !== false ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', color: u.isActive !== false ? '#EF4444' : '#34D399', opacity: actionLoading ? 0.3 : 1 }}>
                                {u.isActive !== false ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {suppliers.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No supplier accounts found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
