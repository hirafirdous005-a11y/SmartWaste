'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Mail,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Fingerprint,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const { adminLogin, adminSession } = useApp();

  const [email, setEmail] = useState('admin@urban.eco');
  const [password, setPassword] = useState('AdminSecure@2026');
  const [securityPin, setSecurityPin] = useState('2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // If already authenticated and not locked, allow direct jump
  if (adminSession && !adminSession.is_locked && !authSuccess) {
    // Session is already active
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await adminLogin(email, password, securityPin);

      if (result.success) {
        setAuthSuccess(true);
        setTimeout(() => {
          router.push(redirectPath);
        }, 800);
      } else {
        setError(result.error || 'Authentication rejected. Verify administrator credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillVerifiedCredentials = () => {
    setEmail('admin@urban.eco');
    setPassword('AdminSecure@2026');
    setSecurityPin('2026');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-950 text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Security Crest & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/20 border-2 border-emerald-400/40">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-950 flex items-center justify-center text-slate-950 text-[10px] font-black">
              L4
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Municipal Command Gate
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted Terminal &bull; Level 4 Security Clearance Required
            </p>
          </div>
        </div>

        {/* Login Container */}
        <div className="p-7 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-700/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">Clearance Verified! Loading Command Center...</span>
              </div>
            )}

            {/* Officer Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Officer Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@urban.eco"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Administrator Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Officer Badge 2FA Security PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2FA Officer Badge PIN
                </label>
                <span className="text-[10px] text-amber-400 font-mono">MUNI-PIN: 2026</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="2026"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-mono tracking-widest text-center"
                />
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Authenticate Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authSuccess}
              className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Validating Security Clearance...</span>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>Verify Credentials & Access Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Fill Verified Credentials */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2 relative z-10">
            <button
              type="button"
              onClick={fillVerifiedCredentials}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Verified Admin Credentials (1-Click)</span>
            </button>

            {/* Officer Security Badge Card Preview */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-left text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Dr. Priya Desai (Director)</span>
                <span className="font-mono text-emerald-400 text-[10px]">MUNI-ADM-2026-904</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Authorized Department: Municipal Cleanliness & Environmental Authority
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/60">
            Citizen or Field Worker?{' '}
            <Link href="/citizen" className="text-emerald-400 hover:underline font-semibold">
              Return to Citizen Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Loading Security Gate...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
