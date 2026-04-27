'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Search, Bell, Shield, BarChart3, Package, Users, ArrowRight } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    showAnalytics?: boolean;
    centerText?: string;
    leftContent?: React.ReactNode;
    notificationCount?: number;
    onNotificationClick?: () => void;
}

export default function DashboardHeader({ 
    showSearch = true, 
    showAnalytics = false, 
    centerText,
    leftContent,
    notificationCount = 0,
    onNotificationClick
}: HeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ products: any[], suppliers: any[] }>({ products: [], suppliers: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close search dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ products: [], suppliers: [] });
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const results = await fetchWithAuth(`/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(results);
                setShowResults(true);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

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
                    <div style={{ position: 'relative' }} ref={searchRef}>
                        <Search size={13} color={C.textDim} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                            onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: 8, 
                                color: 'white', 
                                fontFamily: 'var(--font-body)', 
                                fontSize: 13, 
                                padding: '7px 12px 7px 34px', 
                                outline: 'none', 
                                width: 260, 
                                transition: 'all 0.2s' 
                            }} 
                            placeholder="Search platform..." 
                        />
                        {/* SEARCH RESULTS DROPDOWN */}
                        {showResults && searchQuery.trim() !== '' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: 8,
                                width: 340,
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                padding: 12,
                                zIndex: 100,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16
                            }}>
                                {isSearching ? (
                                    <div style={{ padding: 16, textAlign: 'center', color: C.textDim, fontSize: 12 }}>Searching...</div>
                                ) : (
                                    <>
                                        {searchResults.suppliers?.length > 0 && (
                                            <div>
                                                <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: C.textDim, textTransform: 'uppercase', marginBottom: 8, padding: '0 8px' }}>Suppliers</h4>
                                                {searchResults.suppliers.map(s => (
                                                    <Link href={`/dashboard/admin/suppliers/${s.id}`} key={s.id} onClick={() => setShowResults(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8, textDecoration: 'none', color: 'white' }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={12} color="#3B82F6" /></div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.companyName}</div>
                                                        </div>
                                                        <ArrowRight size={12} color={C.textDim} />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.products?.length > 0 && (
                                            <div>
                                                <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: C.textDim, textTransform: 'uppercase', marginBottom: 8, padding: '0 8px' }}>Products</h4>
                                                {searchResults.products.map(p => (
                                                    <Link href={`/dashboard/supplier/products/${p.id}`} key={p.id} onClick={() => setShowResults(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8, textDecoration: 'none', color: 'white' }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={12} color="#34D399" /></div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                            <div style={{ fontSize: 10, color: C.textDim }}>{p.category}</div>
                                                        </div>
                                                        <ArrowRight size={12} color={C.textDim} />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.suppliers?.length === 0 && searchResults.products?.length === 0 && (
                                            <div style={{ padding: 16, textAlign: 'center', color: C.textDim, fontSize: 12 }}>No results found for "{searchQuery}"</div>
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
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <Bell size={14} color="rgba(255,255,255,0.65)" />
                    {notificationCount > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            background: '#EF4444',
                            border: '2px solid #050505',
                            color: 'white',
                            fontSize: 9,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-num)',
                            padding: '0 4px'
                        }}>
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </div>
                    )}
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
