'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { MOCK_MODE } from '@/hooks/useAuth';

export default function DevTestingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  if (!MOCK_MODE) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen && (
        <div className="mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-64 text-sm font-sans">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">UI Testing Menu</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Public</p>
              <ul className="space-y-1">
                <li><Link href="/" className="text-indigo-600 hover:underline block">Landing Page</Link></li>
                <li><Link href="/login" className="text-indigo-600 hover:underline block">Login</Link></li>
                <li><Link href="/register" className="text-indigo-600 hover:underline block">Register</Link></li>
                <li><Link href="/forgot-password" className="text-indigo-600 hover:underline block">Forgot Password</Link></li>
              </ul>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Supplier Views</p>
              <ul className="space-y-1">
                <li><Link href="/dashboard/supplier" className="text-blue-600 hover:underline block">Main Dashboard</Link></li>
                <li><Link href="/dashboard/supplier/onboarding" className="text-blue-600 hover:underline block">Onboarding Form</Link></li>
                <li><Link href="/dashboard/supplier/products" className="text-blue-600 hover:underline block">Product List</Link></li>
                <li><Link href="/dashboard/supplier/products/new" className="text-blue-600 hover:underline block">Add Product</Link></li>
                <li><Link href="/dashboard/supplier/profile" className="text-blue-600 hover:underline block">Profile</Link></li>
                <li><Link href="/dashboard/supplier/notifications" className="text-blue-600 hover:underline block">Notifications</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Admin Views</p>
              <ul className="space-y-1">
                <li><Link href="/dashboard/admin" className="text-red-600 hover:underline block">Main Dashboard</Link></li>
                <li><Link href="/dashboard/admin/suppliers" className="text-red-600 hover:underline block">Suppliers List</Link></li>
                <li><Link href="/dashboard/admin/products" className="text-red-600 hover:underline block">Product Moderation</Link></li>
                <li><Link href="/dashboard/admin/users" className="text-red-600 hover:underline block">User Management</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t text-xs text-gray-500 italic">
            Guards are disabled. You can view any page.
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
        title="Toggle Test Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
