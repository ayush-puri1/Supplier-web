'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ADMIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    SUPPLIER: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Create Admin form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);

    // Password reset
    const [resetPassword, setResetPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const loadUsers = async () => {
        try {
            const data = await fetchWithAuth('/admin/users');
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'SUPER_ADMIN') loadUsers();
    }, [currentUser]);

    const handleCreateAdmin = async () => {
        if (!newEmail || !newPassword) return alert('Email and password are required');
        if (newPassword.length < 6) return alert('Password must be at least 6 characters');
        setCreating(true);
        try {
            await fetchWithAuth('/admin/users', {
                method: 'POST',
                body: JSON.stringify({ email: newEmail, password: newPassword }),
            });
            setNewEmail('');
            setNewPassword('');
            setShowCreateForm(false);
            await loadUsers();
        } catch (err: any) {
            alert(err?.message || 'Failed to create admin');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateRole = async (userId: string, role: string) => {
        if (userId === currentUser?.id) return alert('Cannot change your own role');
        if (!confirm(`Change this user's role to ${role}?`)) return;
        setActionLoading(true);
        try {
            await fetchWithAuth(`/admin/users/${userId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role }),
            });
            await loadUsers();
            if (selectedUser?.id === userId) setSelectedUser((prev: any) => ({ ...prev, role }));
        } catch (err: any) {
            alert(err?.message || 'Failed to update role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentActive: boolean) => {
        if (userId === currentUser?.id) return alert('Cannot suspend your own account');
        const action = currentActive ? 'Suspend' : 'Activate';
        if (!confirm(`${action} this user?`)) return;
        setActionLoading(true);
        try {
            await fetchWithAuth(`/admin/users/${userId}/active`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !currentActive }),
            });
            await loadUsers();
            if (selectedUser?.id === userId) setSelectedUser((prev: any) => ({ ...prev, isActive: !currentActive }));
        } catch (err: any) {
            alert(err?.message || 'Failed to toggle status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleForcePasswordReset = async () => {
        if (!selectedUser || !resetPassword) return;
        if (resetPassword.length < 6) return alert('Password must be at least 6 characters');
        if (!confirm('Force reset this user\'s password?')) return;
        setActionLoading(true);
        try {
            await fetchWithAuth(`/admin/users/${selectedUser.id}/reset-password`, {
                method: 'POST',
                body: JSON.stringify({ newPassword: resetPassword }),
            });
            setResetPassword('');
            alert('Password reset successfully');
        } catch (err: any) {
            alert(err?.message || 'Failed to reset password');
        } finally {
            setActionLoading(false);
        }
    };

    if (currentUser?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <span className="text-6xl">🚫</span>
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground max-w-md">This page is restricted to Super Admin users only.</p>
            </div>
        );
    }

    if (loading) return <div className="text-center py-20 opacity-50">Loading user database...</div>;

    const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
    const suppliers = users.filter(u => u.role === 'SUPPLIER');

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-muted-foreground">Create admins, manage roles, and control account access.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    {showCreateForm ? '✕ Cancel' : '+ Create Admin'}
                </button>
            </div>

            {/* Create Admin Form */}
            {showCreateForm && (
                <div className="glass p-6 rounded-2xl border border-primary/30 animate-in slide-in-from-top-4 duration-300 bg-gradient-to-br from-primary/5 to-transparent">
                    <h3 className="text-lg font-bold mb-4">Create New Admin Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="email"
                            placeholder="admin@delraw.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none text-sm"
                        />
                        <input
                            type="password"
                            placeholder="Secure password (min 6 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none text-sm"
                        />
                        <button
                            onClick={handleCreateAdmin}
                            disabled={creating}
                            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </div>
            )}

            {/* Admin / Super Admin Users */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">👑 Admins & Super Admins ({admins.length})</h2>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <div className="glass rounded-2xl border border-border overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-secondary/50 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {admins.map((u) => (
                                        <tr
                                            key={u.id}
                                            onClick={() => { setSelectedUser(u); setResetPassword(''); }}
                                            className={`hover:bg-primary/5 transition-colors cursor-pointer ${selectedUser?.id === u.id ? 'bg-primary/10' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm">{u.email}</p>
                                                <p className="text-[10px] text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${ROLE_COLORS[u.role] || ''}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${u.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {u.isActive ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(u.id, u.isActive); }}
                                                    disabled={actionLoading || u.id === currentUser?.id}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 ${u.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                >
                                                    {u.isActive ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail Sidebar */}
                    <div>
                        {selectedUser ? (
                            <div className="glass p-6 rounded-2xl border border-border sticky top-24 animate-in fade-in zoom-in duration-300 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold">{selectedUser.email}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedUser.id}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${ROLE_COLORS[selectedUser.role] || ''}`}>
                                            {selectedUser.role.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${selectedUser.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {selectedUser.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                </div>

                                {/* Role Management */}
                                <section>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Change Role</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['SUPPLIER', 'ADMIN', 'SUPER_ADMIN'].map((role) => (
                                            <button
                                                key={role}
                                                disabled={actionLoading || selectedUser.role === role || selectedUser.id === currentUser?.id}
                                                onClick={() => handleUpdateRole(selectedUser.id, role)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border disabled:opacity-30 ${selectedUser.role === role
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                                                }`}
                                            >
                                                {role.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedUser.id === currentUser?.id && (
                                        <p className="mt-2 text-[10px] text-amber-400">⚠️ Cannot modify your own role</p>
                                    )}
                                </section>

                                {/* Force Password Reset */}
                                <section>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Force Password Reset</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            placeholder="New password"
                                            value={resetPassword}
                                            onChange={(e) => setResetPassword(e.target.value)}
                                            className="flex-1 p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none text-sm"
                                        />
                                        <button
                                            onClick={handleForcePasswordReset}
                                            disabled={actionLoading || !resetPassword}
                                            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold hover:bg-amber-500 hover:text-white transition-all disabled:opacity-30"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </section>

                                {/* Supplier Info */}
                                {selectedUser.supplier && (
                                    <section className="p-4 rounded-xl bg-secondary/30 border border-border">
                                        <p className="text-xs font-bold mb-2 uppercase tracking-widest text-muted-foreground">Supplier Profile</p>
                                        <p className="text-sm font-bold">{selectedUser.supplier.companyName}</p>
                                        <p className="text-xs text-muted-foreground">Status: {selectedUser.supplier.status}</p>
                                    </section>
                                )}
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center p-12 text-center glass rounded-2xl border border-dashed border-border text-muted-foreground italic text-sm">
                                Select a user to manage role and account.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Suppliers */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">🏢 Suppliers ({suppliers.length})</h2>
                <div className="glass rounded-2xl border border-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/50 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Supplier Status</th>
                                <th className="px-6 py-4">Account</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {suppliers.map((u) => (
                                <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm">{u.email}</p>
                                        <p className="text-[10px] text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{u.supplier?.companyName || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                            {u.supplier?.status || 'No Profile'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${u.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {u.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                                            disabled={actionLoading}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${u.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                        >
                                            {u.isActive ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
