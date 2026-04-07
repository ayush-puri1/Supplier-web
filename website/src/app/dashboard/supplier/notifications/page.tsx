'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Bell } from 'lucide-react';

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/supplier/notifications').then((data: any) => {
      setNotifications(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetchWithAuth(`/supplier/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter(n => !n.isRead)) {
      await markAsRead(n.id);
    }
  };

  if (loading) return <DashboardLayout title="Notifications"><div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1117] mb-1">Notifications</h1>
            <p className="text-sm text-[#6B7280]">Stay updated on your application and product status.</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs font-semibold text-[#0D9373] hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-12 h-12" />}
            title="No notifications yet"
            subtitle="You'll receive updates when your application or products are reviewed."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`w-full text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                  n.isRead ? 'border-[#E5E7EB]' : 'border-l-4 border-l-[#0D9373] border-[#E5E7EB] bg-[#ECFDF5]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-[#D1D5DB]' : 'bg-[#0D9373]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F1117] mb-0.5">{n.title}</p>
                    <p className="text-sm text-[#6B7280]">{n.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-2 uppercase font-bold tracking-wider">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
