'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Shield, BarChart3, Package, Users, User, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    showAnalytics?: boolean;
    centerText?: string;
    leftContent?: React.ReactNode;
    onNotificationClick?: () => void;
}

export default function DashboardHeader({ 
    showSearch = true, 
    showAnalytics = false, 
    centerText,
    leftContent,
    onNotificationClick
}: HeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Debounced search
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setSearchResults(null);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const data = await fetchWithAuth(`/search?q=${encodeURIComponent(value.trim())}&limit=5`);
                setSearchResults(data);
                setShowDropdown(true);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setSearchLoading(false);
            }
        }, 350);
    }, []);

    const handleResultClick = (type: string, id: string) => {
        setShowDropdown(false);
        setSearchQuery('');
        if (type === 'product') {
            const base = user?.role === 'SUPPLIER' ? '/dashboard/supplier/products' : '/dashboard/admin/products';
            router.push(base);
        } else if (type === 'supplier') {
            router.push(`/dashboard/admin/suppliers/${id}`);
        } else if (type === 'user') {
            router.push('/dashboard/admin/users');
        }
    };

    const totalResults = searchResults
        ? (searchResults.products?.length || 0) + (searchResults.suppliers?.length || 0) + (searchResults.users?.length || 0)
        : 0;

    // Theme Constants
    const C = {
        bg: '#050505',
        border: 'rgba(255,255,255,0.05)',
        accent: '#3B82F6',
        textDim: 'rgba(255,255,255,0.28)',
    };

    return (
        <header style={{ 
            height: 54, 
            background: C.bg, 
            flexShrink: 0, 
            borderBottom: `1px solid ${C.border}`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0 32px', 
            gap: 16,
            position: 'relative'
        }}>
            {/* LEFT CONTENT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {leftContent}
                {showSearch && (
                    <div ref={searchRef} style={{ position: 'relative' }}>
                        <Search size={13} color={searchLoading ? C.accent : C.textDim} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
                        <input 
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: `1px solid ${showDropdown ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`, 
                                borderRadius: showDropdown ? '8px 8px 0 0' : 8, 
                                color: 'white', 
                                fontFamily: 'var(--font-body)', 
                                fontSize: 13, 
                                padding: '7px 12px 7px 34px', 
                                outline: 'none', 
                                width: 280, 
                                transition: 'all 0.2s' 
                            }} 
                            placeholder="Search platform..." 
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => { if (totalResults > 0) setShowDropdown(true); }}
                        />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); setShowDropdown(false); setSearchResults(null); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}>
                                <X size={14} />
                            </button>
                        )}

                        {/* Search Dropdown */}
                        {showDropdown && searchResults && (
                            <div style={{ 
                                position: 'absolute', top: '100%', left: 0, right: 0, 
                                background: '#0f172a', 
                                border: '1px solid rgba(59,130,246,0.2)', borderTop: 'none',
                                borderRadius: '0 0 12px 12px', 
                                maxHeight: 340, overflowY: 'auto', 
                                zIndex: 999,
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            }}>
                                {totalResults === 0 ? (
                                    <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No results for &ldquo;{searchQuery}&rdquo;</p>
                                    </div>
                                ) : (
                                    <>
                                        {searchResults.products?.length > 0 && (
                                            <div>
                                                <p style={{ padding: '10px 14px 6px', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Products</p>
                                                {searchResults.products.map((p: any) => (
                                                    <div key={p.id} onClick={() => handleResultClick('product', p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                        <Package size={14} color="#60A5FA" />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{p.category} · {p.status}</p>
                                                        </div>
                                                        {p.price && <span style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>₹{p.price.toLocaleString()}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.suppliers?.length > 0 && (
                                            <div>
                                                <p style={{ padding: '10px 14px 6px', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Suppliers</p>
                                                {searchResults.suppliers.map((s: any) => (
                                                    <div key={s.id} onClick={() => handleResultClick('supplier', s.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                        <Users size={14} color="#A78BFA" />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.companyName}</p>
                                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.city} · {s.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.users?.length > 0 && (
                                            <div>
                                                <p style={{ padding: '10px 14px 6px', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Users</p>
                                                {searchResults.users.map((u: any) => (
                                                    <div key={u.id} onClick={() => handleResultClick('user', u.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                        <User size={14} color="#FBBF24" />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{u.role} · {u.isActive ? 'Active' : 'Inactive'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CENTER TEXT */}
            {centerText && (
                <div style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    fontFamily: 'var(--font-num)', 
                    fontSize: 14, 
                    fontWeight: 800, 
                    letterSpacing: '0.15em', 
                    color: centerText === 'SUPER ADMIN' ? C.accent : 'white' ,
                    textTransform: 'uppercase'
                }}>
                    {centerText}
                </div>
            )}

            {/* RIGHT CONTENT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {showAnalytics && (
                    <Link href="/dashboard/admin/analytics" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        padding: '7px 14px', 
                        borderRadius: 8, 
                        background: 'rgba(37,99,235,0.1)', 
                        border: '1px solid rgba(37,99,235,0.2)', 
                        color: '#60A5FA', 
                        textDecoration: 'none', 
                        fontFamily: 'var(--font-heading)', 
                        fontSize: 11, 
                        fontWeight: 700, 
                        transition: 'all 0.2s' 
                    }}>
                        <BarChart3 size={13} /> View Analytics
                    </Link>
                )}
                
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.25)', fontVariantNumeric: 'tabular-nums' }}>
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </div>

                <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
                
                <div 
                    onClick={onNotificationClick}
                    style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 8, 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.07)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer' 
                    }}
                >
                    <Bell size={14} color="rgba(255,255,255,0.65)" />
                </div>
                
                <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#60A5FA', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer', 
                    boxShadow: '0 0 10px rgba(96,165,250,0.45)' 
                }}>
                    <Shield size={14} color="white" />
                </div>
            </div>
        </header>
    );
}
