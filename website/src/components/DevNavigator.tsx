'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Navigation, X, Search, Layout, User, Shield, 
  Settings, Package, ShoppingCart, Users, History, 
  BarChart3, Bell, UserCog, Crown, Home, 
  LogIn, UserPlus, HelpCircle, ExternalLink, ShieldAlert
} from 'lucide-react';

const ROUTES = {
  Public: [
    { name: 'Landing Page', href: '/', icon: Home },
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Register', href: '/register', icon: UserPlus },
    { name: 'Forgot Password', href: '/forgot-password', icon: HelpCircle },
    { name: 'Unauthorized', href: '/unauthorized', icon: ShieldAlert },
  ],
  Supplier: [
    { name: 'Dashboard', href: '/dashboard/supplier', icon: Layout },
    { name: 'Onboarding', href: '/dashboard/supplier/onboarding', icon: User },
    { name: 'Products', href: '/dashboard/supplier/products', icon: Package },
    { name: 'Add Product', href: '/dashboard/supplier/products/new', icon: Package },
    { name: 'Orders', href: '/dashboard/supplier/orders', icon: ShoppingCart },
    { name: 'Profile', href: '/dashboard/supplier/profile', icon: User },
    { name: 'Notifications', href: '/dashboard/supplier/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/supplier/settings', icon: Settings },
  ],
  Admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Layout },
    { name: 'User Control', href: '/dashboard/admin/users', icon: UserCog },
    { name: 'Supplier Pipeline', href: '/dashboard/admin/suppliers', icon: Users },
    { name: 'Product Moderation', href: '/dashboard/admin/products', icon: Package },
    { name: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: History },
  ],
  'Super Admin': [
    { name: 'Command Center', href: '/dashboard/super-admin', icon: Layout },
    { name: 'Admin Mgmt', href: '/dashboard/super-admin/admin-management', icon: Crown },
    { name: 'System Config', href: '/dashboard/super-admin/config', icon: Settings },
  ]
};

export default function DevNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Toggle with Keyboard: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRoutes = Object.entries(ROUTES).map(([category, items]) => {
    return {
      category,
      items: items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.href.toLowerCase().includes(search.toLowerCase())
      )
    };
  }).filter(group => group.items.length > 0);

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'scale(0) rotate(180deg)' : 'scale(1) rotate(0deg)',
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 99, 235, 0.5), inset 0 2px 0 rgba(255,255,255,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)';
        }}
      >
        <Navigation size={24} />
      </button>

      {/* Overlay Backdrop */}
      <div 
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
          zIndex: 10000
        }}
      />

      {/* Navigation Modal */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, ${isOpen ? '-50%' : '-40%'}) scale(${isOpen ? 1 : 0.95})`,
          width: '90%',
          maxWidth: 800,
          maxHeight: '80vh',
          background: 'rgba(20, 20, 22, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          boxShadow: '0 32px 128px rgba(0,0,0,0.8)',
          zIndex: 10001,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 8, borderRadius: 12, background: 'rgba(37, 99, 235, 0.1)', color: '#3B82F6' }}>
              <Navigation size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>Site Navigator</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Jump to any page in the application</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 32px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 48, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
          <input 
            type="text" 
            placeholder="Search pages, routes, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
          />
          <div style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
            <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}>⌘</span>
            <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}>K</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
          {filteredRoutes.map((group) => (
            <div key={group.category}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                {group.category}
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.03)' }} />
              </h3>
              <div style={{ display: 'grid', gap: 4 }}>
                {group.items.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 12,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = 'white';
                      (e.currentTarget.querySelector('.nav-icon') as any).style.color = '#3B82F6';
                      (e.currentTarget.querySelector('.arrow-icon') as any).style.opacity = '1';
                      (e.currentTarget.querySelector('.arrow-icon') as any).style.transform = 'translateX(0)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                      (e.currentTarget.querySelector('.nav-icon') as any).style.color = 'currentColor';
                      (e.currentTarget.querySelector('.arrow-icon') as any).style.opacity = '0';
                      (e.currentTarget.querySelector('.arrow-icon') as any).style.transform = 'translateX(-4px)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}>
                        <item.icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'inherit' }}>{item.name}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.href}</div>
                      </div>
                    </div>
                    <ExternalLink className="arrow-icon" size={12} style={{ opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s' }} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {filteredRoutes.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>No pages found matching "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 32px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
              <span style={{ padding: '2px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>Esc</span> Close
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
              <span style={{ padding: '2px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>↵</span> Select
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Delraw Platform v2.0
          </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </>
  );
}
