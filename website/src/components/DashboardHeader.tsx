'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Shield, BarChart3 } from 'lucide-react';

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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                    <div style={{ position: 'relative' }}>
                        <Search size={13} color={C.textDim} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input 
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: 8, 
                                color: 'white', 
                                fontFamily: 'var(--font-body)', 
                                fontSize: 13, 
                                padding: '7px 12px 7px 34px', 
                                outline: 'none', 
                                width: 200, 
                                transition: 'all 0.2s' 
                            }} 
                            placeholder="Search platform..." 
                        />
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
