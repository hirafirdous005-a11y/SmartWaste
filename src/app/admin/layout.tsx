'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  LogOut,
  KeyRound,
  ArrowRight,
  User,
  AlertTriangle,
  Building2,
  Clock,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Send,
  MapPin,
  Users,
  BarChart3,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminSession, currentUser, adminLogout, lockAdminSession, unlockAdminSession } = useApp();

  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Allow unrestricted access to the admin login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 1. Check if user is authenticated with a valid administrator session
  if (!adminSession || currentUser?.role !== 'admin' || new Date(adminSession.expires_at).getTime() <= Date.now()) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-white">
        <div className="max-w-lg w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-widest">
              Security Clearance Violation
            </span>
            <h2 className="text-2xl font-black text-white">
              Municipal Administrator Access Restricted
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              This terminal is reserved exclusively for municipal officers with Level 4 administrative credentials and valid session authorization.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Current Identity:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {currentUser?.full_name || 'Unauthenticated'} ({currentUser?.role || 'Guest'})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Required Authorization:</span>
              <span className="font-mono text-amber-400 font-bold">Level 4 Admin Clearance</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Terminal Status:</span>
              <span className="text-rose-400 font-bold">Gate Locked</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`)}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate as Administrator</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Return to Home Gate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. If workstation terminal is locked
  if (adminSession.is_locked) {
    const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      const success = unlockAdminSession(unlockPin);
      if (success) {
        setUnlockPin('');
        setUnlockError(null);
      } else {
        setUnlockError('Invalid security PIN. Use default authorization PIN: 2026.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Terminal Workstation Locked</h3>
            <p className="text-xs text-slate-400 mt-1">
              Officer <span className="text-white font-bold">{adminSession.officer_name}</span> &bull; Badge{' '}
              <span className="font-mono text-emerald-400">{adminSession.badge_id}</span>
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            {unlockError && (
              <p className="p-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-200 text-xs font-medium">
                {unlockError}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Enter 4-Digit Security PIN to Resume
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="2026"
                  value={unlockPin}
                  onChange={(e) => setUnlockPin(e.target.value)}
                  className="w-full text-center tracking-widest font-mono text-lg py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Unlock Workstation
              </button>
              <button
                type="button"
                onClick={adminLogout}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Sign Out
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-500">
            Hint: Municipal officer bypass PIN is <span className="font-mono text-amber-400">2026</span>
          </p>
        </div>
      </div>
    );
  }

  // 3. User is authorized & terminal is active -> Render Security Status Bar + Portal Content
  return (
    <div>
      {/* High-Security Administrator Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LEVEL 4 SECURE
          </span>

          <span className="hidden sm:inline-block text-slate-600">&bull;</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">{adminSession.officer_name}</span>
            <span className="text-slate-400 font-mono text-[11px]">({adminSession.badge_id})</span>
          </div>

          <span className="hidden md:inline-block text-slate-600">&bull;</span>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Shift Expires: {new Date(adminSession.expires_at).toLocaleTimeString()}</span>
          </span>
        </div>

        {/* Workstation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={lockAdminSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
            title="Lock screen while away from desk"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>

          <button
            onClick={() => {
              adminLogout();
              router.push('/');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors cursor-pointer"
            title="Terminate administrator session"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Operations Sub-Navigation Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 overflow-x-auto">
            <div className="flex items-center gap-1.5 py-1">
              {[
                { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/admin/complaints', label: 'Complaints Queue', icon: ListTodo },
                { href: '/admin/ai-review', label: 'AI Review', icon: Sparkles, isAi: true },
                { href: '/admin/dispatch', label: 'Task Dispatch', icon: Send },
                { href: '/admin/map', label: 'Live GPS Map', icon: MapPin },
                { href: '/admin/workers', label: 'Sanitation Squad', icon: Users },
                { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
                { href: '/admin/audit', label: 'Audit Trail', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      item.isAi
                        ? isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'text-indigo-300 hover:text-white hover:bg-indigo-950/60 border border-indigo-500/30'
                        : isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Route Content */}
      <main>{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading Security Console...
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </React.Suspense>
  );
}
