'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import {
  Users, Shield, ShieldCheck, ShieldAlert, ShieldOff,
  UserCog, UserPlus, UserMinus, UserCheck, UserX,
  Crown, Star, Lock, Unlock,
  Search, Filter, MoreVertical, ChevronDown, ChevronRight,
  Check, X, AlertCircle, CheckCircle, Info,
  Mail, Clock, Activity, Eye, EyeOff,
  Settings, Package, BarChart3, History, Globe,
  Trash2, Edit3, RefreshCw, ArrowUpRight, Zap,
  LayoutDashboard, LogOut
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   COLOR PALETTE — Consistent with Super Admin design
══════════════════════════════════════════════════════ */

const C = {
  bg: '#0A0A0A',
  surface: '#121212',
  surfaceHover: '#181818',
  sidebar: '#050505',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
  accent: '#3B82F6',
  accentLt: '#93C5FD',
  accentDark: '#1D4ED8',
  muted: 'rgba(148,175,210,0.15)',
  text: '#F1F5F9',
  textDim: '#94A3B8',
  textMuted: 'rgba(255,255,255,0.25)',
  green: '#10B981',
  greenBg: 'rgba(16,185,129,0.08)',
  greenBorder: 'rgba(16,185,129,0.18)',
  amber: '#F59E0B',
  amberBg: 'rgba(245,158,11,0.08)',
  amberBorder: 'rgba(245,158,11,0.18)',
  red: '#EF4444',
  redBg: 'rgba(239,68,68,0.05)',
  redBorder: 'rgba(239,68,68,0.12)',
  purple: '#8B5CF6',
  purpleBg: 'rgba(139,92,246,0.08)',
  purpleBorder: 'rgba(139,92,246,0.18)',
  teal: '#06B6D4',
  gold: '#F59E0B',
};

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */

interface AdminPermission {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'moderation' | 'system';
  danger?: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  avatar?: string;
  permissions: string[];
  lastActive: string;
  joinedAt: string;
  actionsCount: number;
}

/* ══════════════════════════════════════════════════════
   PERMISSIONS REGISTRY
══════════════════════════════════════════════════════ */

const ALL_PERMISSIONS: AdminPermission[] = [
  { key: 'users.view', label: 'View Users', description: 'Access the user directory and profiles', icon: <Eye size={15} />, category: 'core' },
  { key: 'users.manage', label: 'Manage Users', description: 'Edit user roles, statuses, and details', icon: <UserCog size={15} />, category: 'core' },
  { key: 'users.delete', label: 'Delete Users', description: 'Permanently remove user accounts', icon: <UserX size={15} />, category: 'core', danger: true },
  { key: 'suppliers.review', label: 'Review Suppliers', description: 'Approve or reject supplier applications', icon: <UserCheck size={15} />, category: 'moderation' },
  { key: 'suppliers.suspend', label: 'Suspend Suppliers', description: 'Temporarily disable supplier accounts', icon: <ShieldOff size={15} />, category: 'moderation', danger: true },
  { key: 'products.moderate', label: 'Moderate Products', description: 'Approve, reject, or delist product listings', icon: <Package size={15} />, category: 'moderation' },
  { key: 'analytics.view', label: 'View Analytics', description: 'Access platform analytics and reports', icon: <BarChart3 size={15} />, category: 'core' },
  { key: 'audit.view', label: 'View Audit Logs', description: 'Read system audit trail and activity logs', icon: <History size={15} />, category: 'system' },
  { key: 'config.view', label: 'View Configuration', description: 'Read platform settings and toggles', icon: <Settings size={15} />, category: 'system' },
  { key: 'config.manage', label: 'Manage Configuration', description: 'Modify platform settings and feature flags', icon: <Settings size={15} />, category: 'system', danger: true },
  { key: 'notifications.manage', label: 'Manage Notifications', description: 'Send and manage platform-wide alerts', icon: <Mail size={15} />, category: 'system' },
  { key: 'system.maintenance', label: 'System Maintenance', description: 'Enable lockdown and maintenance modes', icon: <Lock size={15} />, category: 'system', danger: true },
];

const PERMISSION_CATEGORIES = {
  core: { label: 'Core Access', color: C.accent },
  moderation: { label: 'Moderation', color: C.amber },
  system: { label: 'System Control', color: C.purple },
};

/* ══════════════════════════════════════════════════════
   API helpers — maps backend shape → AdminUser
══════════════════════════════════════════════════════ */

function mapApiAdmin(raw: any): AdminUser {
  return {
    id: raw.id,
    name: raw.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    email: raw.email,
    role: raw.role as 'ADMIN' | 'SUPER_ADMIN',
    status: (raw.status as AdminUser['status']) || (raw.isActive ? 'ACTIVE' : 'SUSPENDED'),
    permissions: Array.isArray(raw.permissions) ? raw.permissions : (raw.adminPermissions || []),
    lastActive: raw.lastActive || 'Never',
    joinedAt: raw.joinedAt || new Date(raw.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    actionsCount: raw.actionsCount || 0,
  };
}

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════ */

/* ── Status Dot ── */
function StatusDot({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, display: 'inline-block' }} />;
}

/* ── Role Badge ── */
function RoleBadge({ role }: { role: 'ADMIN' | 'SUPER_ADMIN' }) {
  const isSA = role === 'SUPER_ADMIN';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 8,
      fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 800,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: isSA ? C.gold : C.accent,
      background: isSA ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
      border: `1px solid ${isSA ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`,
    }}>
      {isSA ? <Crown size={10} /> : <Shield size={10} />}
      {isSA ? 'Super Admin' : 'Admin'}
    </span>
  );
}

/* ── Status Badge ── */
function AdminStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; bg: string; border: string }> = {
    ACTIVE: { color: C.green, bg: C.greenBg, border: C.greenBorder },
    SUSPENDED: { color: C.red, bg: C.redBg, border: C.redBorder },
    INVITED: { color: C.amber, bg: C.amberBg, border: C.amberBorder },
  };
  const cfg = configs[status] || configs.ACTIVE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
      {status}
    </span>
  );
}

/* ── Notification Toast ── */
function PortalNotification({ message, type, visible, onHide }: { message: string; type: string; visible: boolean; onHide: () => void }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 4000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, animation: 'am-slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
      <div style={{
        background: '#121212', border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
        borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minWidth: 280,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {type === 'error' ? <AlertCircle size={16} color="#EF4444" /> : <CheckCircle size={16} color="#10B981" />}
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: 'white' }}>
            {type === 'error' ? 'Action Failed' : 'Success'}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{message}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Permission Toggle ── */
function PermissionToggle({ permission, enabled, onChange, disabled }: {
  permission: AdminPermission; enabled: boolean; onChange: () => void; disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 12,
        background: enabled ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: `1px solid ${enabled ? C.borderHover : C.border}`,
        transition: 'all 0.25s ease', cursor: disabled ? 'not-allowed' : 'default',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: permission.danger
            ? (enabled ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)')
            : (enabled ? `${PERMISSION_CATEGORIES[permission.category].color}15` : 'rgba(255,255,255,0.03)'),
          border: `1px solid ${permission.danger
            ? (enabled ? 'rgba(239,68,68,0.2)' : C.border)
            : (enabled ? `${PERMISSION_CATEGORIES[permission.category].color}25` : C.border)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: permission.danger
            ? (enabled ? C.red : C.textDim)
            : (enabled ? PERMISSION_CATEGORIES[permission.category].color : C.textDim),
          transition: 'all 0.25s ease',
        }}>
          {permission.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
              color: enabled ? C.text : C.textDim, transition: 'color 0.2s',
            }}>
              {permission.label}
            </p>
            {permission.danger && (
              <span style={{
                fontFamily: "var(--font-body)", fontSize: 8, fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: C.red, background: 'rgba(239,68,68,0.1)',
                padding: '2px 6px', borderRadius: 4,
              }}>
                Elevated
              </span>
            )}
          </div>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: 11, color: C.textMuted,
            marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {permission.description}
          </p>
        </div>
      </div>

      <button
        onClick={onChange}
        disabled={disabled}
        style={{
          width: 44, height: 24, borderRadius: 22, flexShrink: 0, marginLeft: 12,
          background: enabled
            ? (permission.danger ? C.red : C.accent)
            : 'rgba(255,255,255,0.1)',
          position: 'relative', border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s ease',
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3,
          left: enabled ? 23 : 3,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PERMISSION MODAL
══════════════════════════════════════════════════════ */

function PermissionModal({ admin, onClose, onSave }: {
  admin: AdminUser;
  onClose: () => void;
  onSave: (perms: string[]) => void;
}) {
  const [perms, setPerms] = useState<string[]>([...admin.permissions]);
  const [expandedCat, setExpandedCat] = useState<string[]>(['core', 'moderation', 'system']);
  const isSA = admin.role === 'SUPER_ADMIN';

  const togglePerm = (key: string) => {
    setPerms(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleCategory = (cat: string) => {
    const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat).map(p => p.key);
    const allEnabled = catPerms.every(k => perms.includes(k));
    if (allEnabled) {
      setPerms(prev => prev.filter(k => !catPerms.includes(k)));
    } else {
      setPerms(prev => [...new Set([...prev, ...catPerms])]);
    }
  };

  const toggleCatExpand = (cat: string) => {
    setExpandedCat(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const hasChanged = JSON.stringify([...perms].sort()) !== JSON.stringify([...admin.permissions].sort());

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'am-fadeIn 0.2s ease both',
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`,
          width: '100%', maxWidth: 620,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          animation: 'am-scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: 'white', fontFamily: "var(--font-body)",
                }}>
                  {admin.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {admin.name}
                  </h2>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: C.textDim, marginTop: 3 }}>
                    {admin.email}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <RoleBadge role={admin.role} />
                <AdminStatusBadge status={admin.status} />
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
              background: 'rgba(255,255,255,0.03)', color: C.textDim, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              <X size={14} />
            </button>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Permissions', value: `${perms.length}/${ALL_PERMISSIONS.length}`, color: C.accent },
              { label: 'Actions Made', value: admin.actionsCount.toLocaleString(), color: C.green },
              { label: 'Last Active', value: admin.lastActive, color: C.textDim },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`,
              }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: C.border }} />
        </div>

        {/* Scrollable Permissions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
          {isSA && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(245,158,11,0.06)', border: `1px solid rgba(245,158,11,0.12)`,
            }}>
              <Info size={14} color={C.amber} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: C.amber }}>
                Super Admins have all permissions by default. These cannot be modified.
              </p>
            </div>
          )}

          {Object.entries(PERMISSION_CATEGORIES).map(([catKey, catInfo]) => {
            const catPerms = ALL_PERMISSIONS.filter(p => p.category === catKey);
            const enabledCount = catPerms.filter(p => perms.includes(p.key)).length;
            const isExpanded = expandedCat.includes(catKey);
            const allEnabled = enabledCount === catPerms.length;

            return (
              <div key={catKey} style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', cursor: 'pointer',
                }}
                  onClick={() => toggleCatExpand(catKey)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronRight size={14} color={C.textDim}
                      style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                    />
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.12em', color: catInfo.color,
                    }}>
                      {catInfo.label}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
                      color: C.textDim, background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px', borderRadius: 6,
                    }}>
                      {enabledCount}/{catPerms.length}
                    </span>
                  </div>
                  {!isSA && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCategory(catKey); }}
                      style={{
                        fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
                        color: allEnabled ? C.red : C.accent,
                        background: allEnabled ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
                        border: `1px solid ${allEnabled ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'}`,
                        padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {allEnabled ? 'Revoke All' : 'Grant All'}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
                    {catPerms.map(p => (
                      <PermissionToggle
                        key={p.key}
                        permission={p}
                        enabled={perms.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        disabled={isSA}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 32px', borderTop: `1px solid ${C.border}`, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim }}>
            {hasChanged ? (
              <span style={{ color: C.amber }}>⚠ Unsaved changes</span>
            ) : (
              'No changes made'
            )}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: 'transparent', color: C.textDim, fontFamily: "var(--font-body)",
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              Cancel
            </button>
            <button
              onClick={() => onSave(perms)}
              disabled={!hasChanged || isSA}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: hasChanged && !isSA ? C.accent : 'rgba(255,255,255,0.06)',
                color: hasChanged && !isSA ? 'white' : C.textDim,
                fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                cursor: hasChanged && !isSA ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: hasChanged && !isSA ? `0 0 20px rgba(59,130,246,0.3)` : 'none',
              }}
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INVITE MODAL
══════════════════════════════════════════════════════ */

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (data: { name: string; email: string; role: string }) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'am-fadeIn 0.2s ease both',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`,
          width: '100%', maxWidth: 480, padding: '32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          animation: 'am-scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={18} color={C.accent} />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: '-0.02em' }}>Invite Admin</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: C.textDim, marginTop: 3 }}>Add a new administrator to the platform</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
            background: 'rgba(255,255,255,0.03)', color: C.textDim, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Full Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Enter full name"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.03)',
                color: C.text, fontFamily: "var(--font-body)", fontSize: 13, outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Email Address</label>
            <input
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@delraw.com"
              type="email"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.03)',
                color: C.text, fontFamily: "var(--font-body)", fontSize: 13, outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Role</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['ADMIN', 'SUPER_ADMIN'] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    border: `1px solid ${role === r ? C.accent : C.border}`,
                    background: role === r ? 'rgba(59,130,246,0.08)' : 'transparent',
                    color: role === r ? C.accent : C.textDim,
                    fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  {r === 'SUPER_ADMIN' ? <Crown size={13} /> : <Shield size={13} />}
                  {r === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: `1px solid ${C.border}`,
            background: 'transparent', color: C.textDim, fontFamily: "var(--font-body)",
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={() => { if (name && email) onInvite({ name, email, role }); }}
            disabled={!name || !email}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: 'none',
              background: name && email ? C.accent : 'rgba(255,255,255,0.06)',
              color: name && email ? 'white' : C.textDim,
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
              cursor: name && email ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: name && email ? `0 0 20px rgba(59,130,246,0.3)` : 'none',
              transition: 'all 0.2s',
            }}>
            <Mail size={14} /> Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN CONTENT
══════════════════════════════════════════════════════ */

function AdminManagementContent() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; show: boolean; type: string }>({ msg: '', show: false, type: 'success' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const triggerNotify = (msg: string, type = 'success') => setNotification({ msg, type, show: true });

  // Load admins from real API
  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/admins');
      const list = Array.isArray(data) ? data : [];
      setAdmins(list.map(mapApiAdmin));
    } catch (err: any) {
      triggerNotify(err?.message || 'Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const filteredAdmins = admins.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSavePerms = async (adminId: string, newPerms: string[]) => {
    setActionLoading(adminId);
    try {
      await fetchWithAuth(`/admin/admins/${adminId}/permissions`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions: newPerms }),
      });
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: newPerms } : a));
      setSelectedAdmin(null);
      triggerNotify('Permissions updated successfully');
    } catch (err: any) {
      triggerNotify(err?.message || 'Failed to update permissions', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (!admin) return;
    const newIsActive = admin.status !== 'ACTIVE';
    setActionLoading(adminId);
    try {
      await fetchWithAuth(`/admin/users/${adminId}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: newIsActive }),
      });
      await loadAdmins();
      triggerNotify(`${admin.name} has been ${newIsActive ? 'activated' : 'suspended'}`);
    } catch (err: any) {
      triggerNotify(err?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (admin?.role === 'SUPER_ADMIN') {
      triggerNotify('Cannot remove a Super Admin', 'error');
      return;
    }
    if (!confirm(`Remove ${admin?.name} from the admin team? This cannot be undone.`)) return;
    setActionLoading(adminId);
    try {
      await fetchWithAuth(`/admin/admins/${adminId}`, { method: 'DELETE' });
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      triggerNotify(`${admin?.name} has been removed from the admin team`);
    } catch (err: any) {
      triggerNotify(err?.message || 'Failed to remove admin', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInvite = async (data: { name: string; email: string; role: string }) => {
    setActionLoading('invite');
    try {
      const raw = await fetchWithAuth('/admin/admins/invite', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, role: data.role }),
      });
      setAdmins(prev => [...prev, mapApiAdmin(raw)]);
      setShowInvite(false);
      triggerNotify(`Invitation sent to ${data.email}`);
    } catch (err: any) {
      triggerNotify(err?.message || 'Failed to send invite', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: admins.length,
    active: admins.filter(a => a.status === 'ACTIVE').length,
    suspended: admins.filter(a => a.status === 'SUSPENDED').length,
    invited: admins.filter(a => a.status === 'INVITED').length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        :root { --font-heading:'Newsreader',serif; --font-body:'DM Sans',sans-serif; }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:var(--font-body); background:${C.bg}; color:${C.text}; -webkit-font-smoothing:antialiased; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes am-fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes am-scaleIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes am-slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes am-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .am-in { animation: am-fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .admin-row { transition: all 0.2s ease; }
        .admin-row:hover { background: rgba(255,255,255,0.025) !important; }
        .action-dot:hover { background: rgba(255,255,255,0.08) !important; }
        .filter-btn { transition: all 0.2s ease; }
        .filter-btn:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar active="admin_mgmt" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* HEADER */}
          <header style={{
            height: 54, background: C.sidebar, borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusDot color={C.green} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: C.textDim, fontWeight: 500 }}>
                Governance Panel Active
              </span>
            </div>
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 900,
              color: C.accent, letterSpacing: '0.22em',
            }}>
              ADMIN GOVERNANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{
                fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700,
                color: C.textDim, fontVariantNumeric: 'tabular-nums',
              }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
            <div style={{ maxWidth: 1300, margin: '0 auto' }}>
              {/* Title */}
              <div style={{ marginBottom: 40 }} className="am-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ height: 1, width: 40, background: C.accent }} />
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.15em', color: C.accent,
                  }}>
                    Role & Access Control
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <h1 style={{
                      fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 800,
                      color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontStyle: 'italic',
                    }}>
                      Admin Management
                    </h1>
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: 15, color: C.textDim,
                      marginTop: 12, maxWidth: 500, lineHeight: 1.6,
                    }}>
                      Govern administrator access, permissions, and platform authority.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInvite(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 12, border: 'none',
                      background: C.accent, color: 'white',
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: `0 0 24px rgba(59,130,246,0.3)`,
                    }}
                  >
                    <UserPlus size={15} /> Invite Admin
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="am-in" >
                {[
                  { label: 'Total Admins', value: stats.total, icon: Users, color: C.accent, trend: null },
                  { label: 'Active', value: stats.active, icon: ShieldCheck, color: C.green, trend: null },
                  { label: 'Suspended', value: stats.suspended, icon: ShieldOff, color: C.red, trend: null },
                  { label: 'Pending Invite', value: stats.invited, icon: Mail, color: C.amber, trend: null },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
                    padding: '22px 20px', position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%',
                      background: `radial-gradient(circle, ${stat.color}10 0%, transparent 70%)`,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${stat.color}15`, border: `1px solid ${stat.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <stat.icon size={16} color={stat.color} />
                      </div>
                    </div>
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
                      color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                    }}>{stat.label}</p>
                    <p style={{
                      fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800,
                      color: C.text, lineHeight: 1, letterSpacing: '-0.02em',
                    }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Search & Filter Bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, gap: 16,
              }} className="am-in">
                <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                  <Search size={14} color={C.textDim} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search admins by name or email..."
                    style={{
                      width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                      border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.03)',
                      color: C.text, fontFamily: "var(--font-body)", fontSize: 13, outline: 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['ALL', 'ACTIVE', 'SUSPENDED', 'INVITED'].map(f => (
                    <button
                      key={f}
                      className="filter-btn"
                      onClick={() => setFilterStatus(f)}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: `1px solid ${filterStatus === f ? C.accent : C.border}`,
                        background: filterStatus === f ? 'rgba(59,130,246,0.08)' : 'transparent',
                        color: filterStatus === f ? C.accent : C.textDim,
                        fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin List */}
              <div style={{
                background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }} className="am-in">
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.2fr 0.8fr 0.6fr 60px',
                  padding: '14px 24px', borderBottom: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  {['Administrator', 'Role', 'Permissions', 'Status', 'Activity', ''].map((h, i) => (
                    <p key={i} style={{
                      fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.12em', color: C.textDim,
                    }}>{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {filteredAdmins.length === 0 ? (
                  <div style={{
                    padding: '60px 20px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  }}>
                    <Users size={32} color="rgba(255,255,255,0.1)" />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: C.textDim }}>
                      No admins match your filter
                    </p>
                  </div>
                ) : (
                  filteredAdmins.map((admin, idx) => (
                    <div
                      key={admin.id}
                      className="admin-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1.2fr 0.8fr 0.6fr 60px',
                        padding: '16px 24px', alignItems: 'center',
                        borderBottom: idx < filteredAdmins.length - 1 ? `1px solid ${C.border}` : 'none',
                        background: 'transparent', cursor: 'pointer',
                        animation: `am-fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`,
                      }}
                      onClick={() => setSelectedAdmin(admin)}
                    >
                      {/* Admin Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: admin.role === 'SUPER_ADMIN'
                            ? `linear-gradient(135deg, ${C.amber}, ${C.red})`
                            : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: 'white', fontFamily: "var(--font-body)",
                          boxShadow: admin.role === 'SUPER_ADMIN'
                            ? '0 0 16px rgba(245,158,11,0.25)'
                            : '0 0 12px rgba(59,130,246,0.2)',
                        }}>
                          {admin.name.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
                            color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {admin.name}
                            {admin.role === 'SUPER_ADMIN' && (
                              <Crown size={11} color={C.gold} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
                            )}
                          </p>
                          <p style={{
                            fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {admin.email}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <RoleBadge role={admin.role} />
                      </div>

                      {/* Permissions Display */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 10px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                        }}>
                          <Shield size={11} color={C.accent} />
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
                            color: C.text,
                          }}>
                            {admin.role === 'SUPER_ADMIN' ? 'Full' : admin.permissions.length}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 10, color: C.textDim,
                          }}>
                            / {ALL_PERMISSIONS.length}
                          </span>
                        </div>
                        {admin.permissions.some(p => ALL_PERMISSIONS.find(ap => ap.key === p)?.danger) && (
                          <span style={{
                            width: 20, height: 20, borderRadius: 6,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <AlertCircle size={10} color={C.red} />
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <AdminStatusBadge status={admin.status} />
                      </div>

                      {/* Activity */}
                      <div>
                        <p style={{
                          fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim,
                        }}>
                          {admin.lastActive}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="action-dot"
                          onClick={e => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === admin.id ? null : admin.id);
                          }}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)',
                            color: C.textDim, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <MoreVertical size={14} />
                        </button>

                        {activeMenu === admin.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute', top: 36, right: 0, zIndex: 100,
                              background: '#1A1A1A', borderRadius: 12, border: `1px solid ${C.border}`,
                              padding: '6px', minWidth: 180,
                              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                              animation: 'am-scaleIn 0.15s ease both',
                            }}
                          >
                            <button
                              onClick={() => { setSelectedAdmin(admin); setActiveMenu(null); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                padding: '10px 12px', borderRadius: 8, border: 'none',
                                background: 'transparent', color: C.text, cursor: 'pointer',
                                fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
                                transition: 'background 0.15s', textAlign: 'left',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <Shield size={13} color={C.accent} /> Edit Permissions
                            </button>
                            {admin.role !== 'SUPER_ADMIN' && (
                              <>
                                <button
                                  onClick={() => { handleToggleStatus(admin.id); setActiveMenu(null); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: '10px 12px', borderRadius: 8, border: 'none',
                                    background: 'transparent',
                                    color: admin.status === 'ACTIVE' ? C.amber : C.green,
                                    cursor: 'pointer', fontFamily: "var(--font-body)",
                                    fontSize: 12, fontWeight: 500, transition: 'background 0.15s',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  {admin.status === 'ACTIVE'
                                    ? <><ShieldOff size={13} /> Suspend</>
                                    : <><ShieldCheck size={13} /> Activate</>
                                  }
                                </button>
                                <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
                                <button
                                  onClick={() => { handleRemoveAdmin(admin.id); setActiveMenu(null); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: '10px 12px', borderRadius: 8, border: 'none',
                                    background: 'transparent', color: C.red,
                                    cursor: 'pointer', fontFamily: "var(--font-body)",
                                    fontSize: 12, fontWeight: 500, transition: 'background 0.15s',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Trash2 size={13} /> Remove Admin
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Permission Legend */}
              <div style={{
                marginTop: 32, padding: '28px 32px', borderRadius: 20,
                background: C.surface, border: `1px solid ${C.border}`,
              }} className="am-in">
                <h3 style={{
                  fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 800,
                  color: C.text, marginBottom: 20,
                }}>
                  Permission Categories
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => {
                    const catPerms = ALL_PERMISSIONS.filter(p => p.category === key);
                    return (
                      <div key={key} style={{
                        padding: '20px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: cat.color, boxShadow: `0 0 10px ${cat.color}`,
                          }} />
                          <p style={{
                            fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                            color: cat.color,
                          }}>{cat.label}</p>
                          <span style={{
                            fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
                            color: C.textDim, background: 'rgba(255,255,255,0.04)',
                            padding: '2px 6px', borderRadius: 4, marginLeft: 'auto',
                          }}>
                            {catPerms.length} perms
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {catPerms.map(p => (
                            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: C.textDim }}>{p.icon}</span>
                              <span style={{
                                fontFamily: "var(--font-body)", fontSize: 11, color: C.textDim,
                              }}>
                                {p.label}
                              </span>
                              {p.danger && (
                                <span style={{
                                  fontFamily: "var(--font-body)", fontSize: 7, fontWeight: 800,
                                  letterSpacing: '0.1em', color: C.red,
                                  background: 'rgba(239,68,68,0.1)', padding: '1px 4px', borderRadius: 3,
                                }}>
                                  ELEVATED
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedAdmin && (
        <PermissionModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
          onSave={(perms) => handleSavePerms(selectedAdmin.id, perms)}
        />
      )}
      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />
      )}

      <PortalNotification
        message={notification.msg}
        type={notification.type}
        visible={notification.show}
        onHide={() => setNotification(p => ({ ...p, show: false }))}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════ */

export default function AdminManagementPage() {
  return (
    <Suspense fallback={null}>
      <AdminManagementContent />
    </Suspense>
  );
}
