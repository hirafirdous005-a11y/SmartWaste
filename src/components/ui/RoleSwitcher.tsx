'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { User, ShieldCheck, HardHat, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, adminSession, switchUserRole } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    if (!currentUser) {
      router.push(`/login?role=${role}`);
      return;
    }
    if (role === 'admin') {
      if (!adminSession || new Date(adminSession.expires_at).getTime() <= Date.now()) {
        router.push('/admin/login');
        return;
      }
      switchUserRole('admin');
      router.push('/admin');
      return;
    }
    switchUserRole(role);
    if (role === 'citizen') router.push('/citizen');
    if (role === 'worker') router.push('/worker');
  };

  const isCitizen = mounted && currentUser?.role === 'citizen';
  const isWorker = mounted && currentUser?.role === 'worker';
  const isAdminActive = mounted && currentUser?.role === 'admin' && Boolean(adminSession);

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => handleRoleSelect('citizen')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isCitizen
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        title="Switch to Citizen Persona"
      >
        <User className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Citizen</span>
      </button>

      <button
        type="button"
        onClick={() => handleRoleSelect('worker')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isWorker
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        title="Switch to Sanitation Worker Persona"
      >
        <HardHat className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Worker</span>
      </button>

      <button
        type="button"
        onClick={() => handleRoleSelect('admin')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isAdminActive
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        title="Authenticate as Administrator"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Admin</span>
        {!adminSession && <Lock className="w-2.5 h-2.5 text-slate-400 -ml-0.5" />}
      </button>
    </div>
  );
};
