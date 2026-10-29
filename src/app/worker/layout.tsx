'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  HardHat,
  ShieldAlert,
  ListTodo,
  FileText,
  MapPin,
  CheckCircle2,
  LogOut,
  User,
  ArrowRight,
  Sparkles,
  Truck,
  Phone,
  Navigation,
} from 'lucide-react';

function WorkerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, switchUserRole, loginUser, logoutUser, tasks } = useApp();

  const [workerEmail, setWorkerEmail] = useState('worker@urban.eco');

  // Role Gate: Only 'worker' or 'admin' can access worker portal
  const isAuthorized = currentUser?.role === 'worker' || currentUser?.role === 'admin';

  if (!currentUser || !isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-white">
        <div className="max-w-lg w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10 animate-pulse">
            <HardHat className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-widest">
              Field Sanitation Squad Portal
            </span>
            <h2 className="text-2xl font-black text-white">
              Sanitation Worker Authorization Required
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              This terminal is reserved for active field sanitation specialists assigned to municipal waste collection and street sanitation routes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Current Identity:</span>
              <span className="font-mono text-amber-400 font-bold">
                {currentUser?.full_name || 'Guest'} ({currentUser?.role || 'Unauthenticated'})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Required Role:</span>
              <span className="font-mono text-emerald-400 font-bold">Sanitation Worker / Fleet Officer</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Access Restriction:</span>
              <span className="text-rose-400 font-bold">Citizen Access Blocked</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                switchUserRole('worker');
                router.refresh();
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <HardHat className="w-4 h-4" />
              <span>Quick Check-In as Field Worker (Rajesh Kumar)</span>
            </button>

            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Return to Home Gate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Tasks Count
  const workerTasks = tasks.filter((t) => !currentUser || t.worker_id === currentUser.id);
  const activeCount = workerTasks.filter((t) => t.task_status !== 'Completed').length;

  const workerNav = [
    { href: '/worker', label: 'Assigned Tasks', icon: ListTodo, badge: activeCount },
    { href: '/worker/history', label: 'Completed History & Proofs', icon: FileText },
  ];

  return (
    <div>
      {/* Sanitation Worker Duty Status Bar */}
      <div className="bg-amber-950 border-b border-amber-900 text-amber-100 px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ON DUTY &bull; GPS ACTIVE
          </span>

          <span className="hidden sm:inline-block text-amber-800">&bull;</span>

          <div className="flex items-center gap-1.5 text-amber-200">
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">{currentUser.full_name}</span>
            <span className="text-amber-400 font-mono text-[11px]">({currentUser.zone || 'Central Ward'})</span>
          </div>
        </div>

        {/* Worker Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              logoutUser();
              router.push('/');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors cursor-pointer"
            title="Terminate worker session"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Worker Sub-Navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-13">
            <div className="flex items-center gap-2 py-1">
              {workerNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Worker Content */}
      <main>{children}</main>
    </div>
  );
}

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-400">
          Loading Worker Portal...
        </div>
      }
    >
      <WorkerLayoutContent>{children}</WorkerLayoutContent>
    </React.Suspense>
  );
}
