'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Home, PlusCircle, ListTodo, MapPin, HardHat, ShieldCheck, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, adminSession } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMobileTabs = () => {
    if (!mounted) {
      return [
        { href: '/citizen', label: 'Home', icon: Home },
        { href: '/citizen/report', label: 'Report', icon: PlusCircle, isPrimary: true },
        { href: '/citizen/track', label: 'Track', icon: ListTodo },
        { href: '/citizen#nearby-map', label: 'Map', icon: MapPin },
      ];
    }
    if (currentUser?.role === 'admin' && adminSession) {
      return [
        { href: '/admin', label: 'Admin', icon: ShieldCheck },
        { href: '/admin/complaints', label: 'Complaints', icon: ListTodo },
        { href: '/admin/map', label: 'GPS Map', icon: MapPin },
        { href: '/admin/workers', label: 'Workers', icon: HardHat },
      ];
    }
    if (currentUser?.role === 'worker') {
      return [
        { href: '/worker', label: 'Tasks', icon: HardHat },
        { href: '/worker?tab=active', label: 'Active', icon: ListTodo },
        { href: '/worker?tab=history', label: 'History', icon: Home },
      ];
    }
    // Citizen tabs
    return [
      { href: '/citizen', label: 'Home', icon: Home },
      { href: '/citizen/report', label: 'Report', icon: PlusCircle, isPrimary: true },
      { href: '/citizen/track', label: 'Track', icon: ListTodo },
      { href: '/citizen#nearby-map', label: 'Map', icon: MapPin },
    ];
  };

  const tabs = getMobileTabs();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 px-3 py-1.5 shadow-xl safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isPrimary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center -mt-6 group"
              >
                <div className="w-13 h-13 rounded-full bg-linear-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 group-active:scale-95 transition-transform ring-4 ring-white">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-black text-emerald-800 mt-1">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
