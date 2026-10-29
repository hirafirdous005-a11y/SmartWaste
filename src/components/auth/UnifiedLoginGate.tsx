'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  User,
  HardHat,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Fingerprint,
  Eye,
  EyeOff,
  UserPlus,
  Compass,
  MapPin,
  Camera,
} from 'lucide-react';
import Link from 'next/link';

interface UnifiedLoginGateProps {
  onSuccessRedirect?: string;
  defaultRole?: 'citizen' | 'worker' | 'admin';
  compact?: boolean;
  onLoginSuccess?: (role: 'citizen' | 'worker' | 'admin') => void;
}

export const UnifiedLoginGate: React.FC<UnifiedLoginGateProps> = ({
  onSuccessRedirect,
  defaultRole = 'citizen',
  compact = false,
  onLoginSuccess,
}) => {
  const router = useRouter();
  const { loginUser, adminLogin, switchUserRole, registerUser, currentUser, adminSession } = useApp();

  // Role Selection
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'worker' | 'admin'>(defaultRole);
  const [activeCitizenTab, setActiveCitizenTab] = useState<'signin' | 'register'>('signin');

  // Citizen credentials
  const [citizenEmail, setCitizenEmail] = useState('citizen@urban.eco');
  const [citizenPassword, setCitizenPassword] = useState('••••••••');

  // Citizen Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regZone, setRegZone] = useState('Zone 1 - Central Ward');
  const [regPassword, setRegPassword] = useState('');

  // Worker credentials
  const [workerEmail, setWorkerEmail] = useState('worker@urban.eco');
  const [workerPassword, setWorkerPassword] = useState('••••••••');

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('admin@urban.eco');
  const [adminPassword, setAdminPassword] = useState('AdminSecure@2026');
  const [adminPin, setAdminPin] = useState('2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status / Feedback
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Handle Citizen Sign-In
  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = loginUser(citizenEmail.trim(), citizenPassword);
    if (success) {
      setSuccessMessage('Citizen identity verified! Opening Citizen Portal...');
      if (onLoginSuccess) onLoginSuccess('citizen');
      setTimeout(() => {
        if (onSuccessRedirect !== 'none') {
          router.push(onSuccessRedirect || '/citizen');
        }
      }, 600);
    } else {
      setIsLoading(false);
      setError('Invalid citizen credentials. Please use citizen@urban.eco or click 1-Click Demo Login.');
    }
  };

  // 2. Handle Citizen Registration
  const handleCitizenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setIsLoading(false);
      setError('Please fill in all required registration fields.');
      return;
    }

    const success = registerUser(regName.trim(), regEmail.trim(), regPhone.trim(), 'citizen');
    if (success) {
      setSuccessMessage('Account registered! Opening Citizen Portal...');
      if (onLoginSuccess) onLoginSuccess('citizen');
      setTimeout(() => {
        if (onSuccessRedirect !== 'none') {
          router.push(onSuccessRedirect || '/citizen');
        }
      }, 600);
    } else {
      setIsLoading(false);
      setError('Could not complete registration. Please verify your details.');
    }
  };

  // 3. Handle Worker Sign-In
  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    switchUserRole('worker');
    const success = loginUser(workerEmail.trim(), workerPassword);
    if (success) {
      setSuccessMessage('Sanitation worker credentials verified! Opening Worker Portal...');
      if (onLoginSuccess) onLoginSuccess('worker');
      setTimeout(() => {
        if (onSuccessRedirect !== 'none') {
          router.push(onSuccessRedirect || '/worker');
        }
      }, 600);
    } else {
      setIsLoading(false);
      setError('Invalid worker credentials. Please use worker@urban.eco or click 1-Click Demo Login.');
    }
  };

  // 4. Handle Admin Sign-In (with Level 4 2FA security)
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await adminLogin(adminEmail, adminPassword, adminPin);
      if (res.success) {
        setSuccessMessage('Level 4 clearance verified! Opening Municipal Command Center...');
        if (onLoginSuccess) onLoginSuccess('admin');
        setTimeout(() => {
          if (onSuccessRedirect !== 'none') {
            router.push(onSuccessRedirect || '/admin');
          }
        }, 800);
      } else {
        setIsLoading(false);
        setError(res.error || 'Administrator access rejected.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Authentication error.');
    }
  };

  // ⚡ 1-Click Instant Demo Login Helpers
  const quickLoginAsCitizen = () => {
    setError(null);
    setIsLoading(true);
    switchUserRole('citizen');
    loginUser('citizen@urban.eco');
    setSuccessMessage('Welcome, Aarav Sharma! Opening Citizen Portal...');
    if (onLoginSuccess) onLoginSuccess('citizen');
    setTimeout(() => {
      if (onSuccessRedirect !== 'none') {
        router.push(onSuccessRedirect || '/citizen');
      }
    }, 500);
  };

  const quickLoginAsWorker = () => {
    setError(null);
    setIsLoading(true);
    switchUserRole('worker');
    loginUser('worker@urban.eco');
    setSuccessMessage('Welcome, Rajesh Kumar! Opening Field Sanitation Squad Portal...');
    if (onLoginSuccess) onLoginSuccess('worker');
    setTimeout(() => {
      if (onSuccessRedirect !== 'none') {
        router.push(onSuccessRedirect || '/worker');
      }
    }, 500);
  };

  const quickLoginAsAdmin = async () => {
    setError(null);
    setIsLoading(true);
    const res = await adminLogin('admin@urban.eco', 'AdminSecure@2026', '2026');
    if (res.success) {
      setSuccessMessage('Welcome, Dr. Priya Verma! Opening Municipal Command Center...');
      if (onLoginSuccess) onLoginSuccess('admin');
      setTimeout(() => {
        if (onSuccessRedirect !== 'none') {
          router.push(onSuccessRedirect || '/admin');
        }
      }, 600);
    } else {
      setIsLoading(false);
      setError(res.error || 'Failed to authenticate admin.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Banner with Dynamic Role Branding */}
      <div
        className={`p-6 sm:p-8 text-white transition-colors duration-500 relative overflow-hidden ${
          selectedRole === 'citizen'
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
            : selectedRole === 'worker'
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
            : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800'
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono shadow-xs ${
                selectedRole === 'citizen'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                  : selectedRole === 'worker'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Step 1: Authenticate to Open Site</span>
            </span>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {selectedRole === 'citizen' && 'Citizen Verification Gate'}
              {selectedRole === 'worker' && 'Field Sanitation Squad Check-In'}
              {selectedRole === 'admin' && 'Municipal Command Clearance'}
            </h2>

            <p className="text-xs text-slate-300 max-w-md font-normal leading-relaxed">
              {selectedRole === 'citizen' &&
                'Log in as a citizen to snap road dust, report illegal dumps, and track cleanup response.'}
              {selectedRole === 'worker' &&
                'Log in as a sanitation worker to view assigned collection tasks, GPS routes, and upload proof.'}
              {selectedRole === 'admin' &&
                'Log in as municipal admin for citywide monitoring, AI review, and proximity worker dispatch.'}
            </p>
          </div>

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-xl ${
              selectedRole === 'citizen'
                ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                : selectedRole === 'worker'
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
            }`}
          >
            {selectedRole === 'citizen' && <User className="w-7 h-7" />}
            {selectedRole === 'worker' && <HardHat className="w-7 h-7" />}
            {selectedRole === 'admin' && <ShieldCheck className="w-7 h-7" />}
          </div>
        </div>
      </div>

      {/* 3-Role Tab Selector Buttons */}
      <div className="grid grid-cols-3 p-2 bg-slate-100 border-b border-slate-200 gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('citizen');
            setError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-2 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedRole === 'citizen'
              ? 'bg-white text-blue-700 shadow-md border border-blue-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <User className="w-4 h-4 text-blue-600" />
          <span>1. Citizen</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('worker');
            setError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-2 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedRole === 'worker'
              ? 'bg-white text-amber-700 shadow-md border border-amber-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <HardHat className="w-4 h-4 text-amber-600" />
          <span>2. Worker</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('admin');
            setError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-2 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedRole === 'admin'
              ? 'bg-white text-emerald-800 shadow-md border border-emerald-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>3. Admin</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-5">
        {/* Error or Success notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* -------------------- ROLE 1: CITIZEN -------------------- */}
        {selectedRole === 'citizen' && (
          <div className="space-y-4">
            {/* Citizen Sub-tabs: Sign In vs Register */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCitizenTab('signin');
                  setError(null);
                }}
                className={`text-xs font-bold pb-1 transition-all ${
                  activeCitizenTab === 'signin'
                    ? 'text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In with Email
              </button>
              <span className="text-slate-300">&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setActiveCitizenTab('register');
                  setError(null);
                }}
                className={`text-xs font-bold pb-1 transition-all ${
                  activeCitizenTab === 'register'
                    ? 'text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                New Citizen Register
              </button>
            </div>

            {activeCitizenTab === 'signin' ? (
              <form onSubmit={handleCitizenSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Citizen Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      placeholder="citizen@urban.eco"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <span>Sign In as Citizen &amp; Open Site</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={quickLoginAsCitizen}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>⚡ 1-Click Instant Citizen Sign In (Aarav Sharma)</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCitizenRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Priya Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="priya@urban.eco"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Create Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Register &amp; Open Citizen Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* -------------------- ROLE 2: SANITATION WORKER -------------------- */}
        {selectedRole === 'worker' && (
          <form onSubmit={handleWorkerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Sanitation Crew Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={workerEmail}
                  onChange={(e) => setWorkerEmail(e.target.value)}
                  placeholder="worker@urban.eco"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Worker Route PIN / Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={workerPassword}
                  onChange={(e) => setWorkerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                <span>Default Field Crew Credentials:</span>
              </span>
              <p className="text-amber-800">
                Email: <span className="font-mono font-bold">worker@urban.eco</span> &bull; Truck: MH-01-AB-1234
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>Sign In as Worker &amp; Open Site</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={quickLoginAsWorker}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>⚡ 1-Click Instant Worker Sign In (Rajesh Kumar)</span>
              </button>
            </div>
          </form>
        )}

        {/* -------------------- ROLE 3: MUNICIPAL ADMIN -------------------- */}
        {selectedRole === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Officer Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@urban.eco"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Administrator Password</label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">2FA Officer Security PIN</label>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">MUNI-PIN: 2026</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="2026"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-mono tracking-widest text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Verify Clearance &amp; Open Admin Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={quickLoginAsAdmin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>⚡ 1-Click Instant Admin Sign In (Dr. Priya Verma)</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer info badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Waste Vision &amp; GPS Dispatch Online</span>
          </span>
          <span className="text-slate-400 font-mono text-[10px]">Smart Waste Monitoring v4.2</span>
        </div>
      </div>
    </div>
  );
};
