'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  Recycle,
  ShieldCheck,
  HardHat,
  User,
  Sparkles,
  MapPin,
  Camera,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  UserPlus,
  Phone,
  Mail,
  Truck,
  Check,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';

function FrontPageAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'citizen';
  const redirectTarget = searchParams.get('redirect') || '';

  const {
    currentUser,
    loginUser,
    adminLogin,
    registerUser,
    addWorker,
    logoutUser,
    switchUserRole,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Citizen credentials & registration
  const [citizenEmail, setCitizenEmail] = useState('citizen@urban.eco');
  const [citizenPassword, setCitizenPassword] = useState('citizen123');
  const [citName, setCitName] = useState('');
  const [citEmail, setCitEmail] = useState('');
  const [citPhone, setCitPhone] = useState('');
  const [citZone, setCitZone] = useState('Zone 1 - Central Ward');
  const [citPassword, setCitPassword] = useState('');

  // Worker credentials & registration
  const [workerEmail, setWorkerEmail] = useState('worker@urban.eco');
  const [workerPassword, setWorkerPassword] = useState('worker123');
  const [workerName, setWorkerName] = useState('');
  const [workerRegEmail, setWorkerRegEmail] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerZone, setWorkerZone] = useState('Zone 1 - Central Ward');
  const [workerVehicle, setWorkerVehicle] = useState('Hydraulic Compactor Truck (MH-01-EQ-4421)');
  const [workerPasswordReg, setWorkerPasswordReg] = useState('');

  // Admin credentials & registration
  const [adminEmail, setAdminEmail] = useState('admin@urban.eco');
  const [adminPassword, setAdminPassword] = useState('AdminSecure@2026');
  const [adminPin, setAdminPin] = useState('2026');
  const [adminName, setAdminName] = useState('');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminDept, setAdminDept] = useState('Municipal Environmental Directorate');
  const [adminPasswordReg, setAdminPasswordReg] = useState('AdminSecure@2026');

  // Sync role with query parameter if present
  useEffect(() => {
    const roleP = searchParams.get('role') as UserRole;
    if (roleP && ['citizen', 'worker', 'admin'].includes(roleP)) {
      setSelectedRole(roleP);
    }
  }, [searchParams]);

  // Citizen Sign-In Handler
  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = loginUser(citizenEmail.trim(), citizenPassword);
      if (success) {
        setFeedback({ type: 'success', text: 'Welcome back! Opening Citizen Portal...' });
        setTimeout(() => router.push(redirectTarget || '/citizen'), 500);
      } else {
        setIsLoading(false);
        setFeedback({
          type: 'error',
          text: 'Invalid citizen credentials. Use citizen@urban.eco or click 1-Click Demo.',
        });
      }
    }, 400);
  };

  // Citizen Registration Handler
  const handleCitizenSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    if (!citName.trim() || !citEmail.trim() || !citPhone.trim()) {
      setIsLoading(false);
      setFeedback({ type: 'error', text: 'Please fill in your name, email, and mobile number.' });
      return;
    }

    setTimeout(() => {
      const success = registerUser(citName.trim(), citEmail.trim(), citPhone.trim(), 'citizen');
      if (success) {
        setFeedback({ type: 'success', text: 'Account registered! Directing to Citizen Portal...' });
        setTimeout(() => router.push(redirectTarget || '/citizen'), 600);
      } else {
        setIsLoading(false);
        setFeedback({ type: 'error', text: 'Could not complete registration. Please try again.' });
      }
    }, 450);
  };

  // Worker Sign-In Handler
  const handleWorkerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    setTimeout(() => {
      switchUserRole('worker');
      const success = loginUser(workerEmail.trim(), workerPassword);
      if (success) {
        setFeedback({ type: 'success', text: 'Operative check-in successful! Opening Field Tasks...' });
        setTimeout(() => router.push(redirectTarget || '/worker'), 500);
      } else {
        setIsLoading(false);
        setFeedback({
          type: 'error',
          text: 'Invalid worker credentials. Use worker@urban.eco or click 1-Click Demo.',
        });
      }
    }, 400);
  };

  // Worker Registration Handler
  const handleWorkerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    if (!workerName.trim() || !workerRegEmail.trim() || !workerPhone.trim()) {
      setIsLoading(false);
      setFeedback({ type: 'error', text: 'Please fill in all operative details.' });
      return;
    }

    setTimeout(() => {
      registerUser(workerName.trim(), workerRegEmail.trim(), workerPhone.trim(), 'worker');
      addWorker({
        name: workerName.trim(),
        email: workerRegEmail.trim(),
        phone: workerPhone.trim(),
        assigned_zone: workerZone,
      });

      setFeedback({ type: 'success', text: 'Operative registered! Loading Field Console...' });
      setTimeout(() => router.push(redirectTarget || '/worker'), 600);
    }, 450);
  };

  // Admin Sign-In Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await adminLogin(adminEmail, adminPassword, adminPin);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Clearance verified! Opening Municipal Command Center...' });
        setTimeout(() => router.push(redirectTarget || '/admin'), 600);
      } else {
        setIsLoading(false);
        setFeedback({
          type: 'error',
          text: res.error || 'Access denied. Verify your Admin Email, Password, and PIN (2026).',
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: 'error', text: err?.message || 'Authentication error.' });
    }
  };

  // Admin Registration / Clearance Request
  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    if (!adminName.trim() || !adminRegEmail.trim()) {
      setIsLoading(false);
      setFeedback({ type: 'error', text: 'Please provide officer name and official email.' });
      return;
    }

    setTimeout(async () => {
      registerUser(adminName.trim(), adminRegEmail.trim(), adminPhone.trim() || '+91 98200 88888', 'admin');
      const res = await adminLogin(adminRegEmail.trim(), adminPasswordReg || 'AdminSecure@2026', '2026');
      if (res.success) {
        setFeedback({ type: 'success', text: 'Administrative access granted! Loading Command Central...' });
        setTimeout(() => router.push(redirectTarget || '/admin'), 600);
      } else {
        await adminLogin('admin@urban.eco', 'AdminSecure@2026', '2026');
        router.push(redirectTarget || '/admin');
      }
    }, 500);
  };

  // Fast 1-Click Demo Login
  const handleQuickDemo = async (role: UserRole) => {
    setFeedback(null);
    setIsLoading(true);
    setSelectedRole(role);

    if (role === 'citizen') {
      switchUserRole('citizen');
      loginUser('citizen@urban.eco', 'citizen123');
      setFeedback({ type: 'success', text: 'Logged in as Aarav Sharma (Citizen). Opening portal...' });
      setTimeout(() => router.push(redirectTarget || '/citizen'), 450);
    } else if (role === 'worker') {
      switchUserRole('worker');
      loginUser('worker@urban.eco', 'worker123');
      setFeedback({ type: 'success', text: 'Logged in as Rajesh Kumar (Worker Squad). Opening tasks...' });
      setTimeout(() => router.push(redirectTarget || '/worker'), 450);
    } else if (role === 'admin') {
      const res = await adminLogin('admin@urban.eco', 'AdminSecure@2026', '2026');
      if (res.success) {
        setFeedback({ type: 'success', text: 'Logged in as Dr. Priya Desai (Admin). Opening command hub...' });
        setTimeout(() => router.push(redirectTarget || '/admin'), 500);
      } else {
        setIsLoading(false);
        setFeedback({ type: 'error', text: 'Admin demo login error' });
      }
    }
  };

  // Role Theme Colors (Bright, Clean, Friendly)
  const getRoleTheme = () => {
    switch (selectedRole) {
      case 'citizen':
        return {
          color: 'emerald',
          gradientBtn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
          accentText: 'text-emerald-700',
          activeTab: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25',
          borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50',
          pill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          badgeText: 'Citizen Portal',
        };
      case 'worker':
        return {
          color: 'amber',
          gradientBtn: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
          accentText: 'text-amber-700',
          activeTab: 'bg-amber-600 text-white shadow-md shadow-amber-600/25',
          borderActive: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50',
          pill: 'bg-amber-100 text-amber-800 border-amber-200',
          badgeText: 'Field Sanitation Squad',
        };
      case 'admin':
        return {
          color: 'blue',
          gradientBtn: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
          accentText: 'text-blue-700',
          activeTab: 'bg-blue-600 text-white shadow-md shadow-blue-600/25',
          borderActive: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50',
          pill: 'bg-blue-100 text-blue-800 border-blue-200',
          badgeText: 'Municipal Command Center',
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="min-h-[calc(100vh-4rem)] text-slate-900 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Clean Header / Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" layout="vertical" clickable={false} showSubtitle={false} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Swachh Bharat Smart City Waste Network</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Single-page portal for residents, sanitation workers, and city administrators to report, monitor, and clear waste in real-time.
          </p>
        </div>

        {/* Active Session Card (If User is Already Logged In) */}
        {currentUser && (
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-fade-scale">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.full_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
              />
              <div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                  Active Session: {currentUser.role}
                </p>
                <p className="text-sm font-extrabold text-slate-900">
                  {currentUser.full_name}{' '}
                  <span className="text-xs font-normal text-slate-500">({currentUser.email})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'worker' ? '/worker' : '/citizen'}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setFeedback({ type: 'success', text: 'Signed out successfully.' });
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* 1-Click Fast Demo Buttons */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>1-Click Test Login:</span>
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen')}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5" />
              <span>Aarav (Citizen)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('worker')}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Rajesh (Worker)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dr. Priya (Admin)</span>
            </button>
          </div>
        </div>

        {/* Main Clean Auth Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          {/* STEP 1: Select Role Tabs (Clean, Bright, Attractive) */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Step 1: Choose Your Role
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Citizen Tab */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('citizen');
                  setFeedback(null);
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedRole === 'citizen'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedRole === 'citizen'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  {selectedRole === 'citizen' && (
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Citizen</h4>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Report Waste</p>
                </div>
              </button>

              {/* Worker Tab */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('worker');
                  setFeedback(null);
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedRole === 'worker'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedRole === 'worker'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <HardHat className="w-4 h-4" />
                  </div>
                  {selectedRole === 'worker' && (
                    <Check className="w-4 h-4 text-amber-600 font-bold" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Worker</h4>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Sanitation Squad</p>
                </div>
              </button>

              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setFeedback(null);
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedRole === 'admin'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedRole === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  {selectedRole === 'admin' && (
                    <Check className="w-4 h-4 text-blue-600 font-bold" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Admin</h4>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Command Center</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Mode Toggle (Sign In ⇄ Create Account) */}
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setFeedback(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setFeedback(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-fade-scale ${
                feedback.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span className="font-semibold">{feedback.text}</span>
            </div>
          )}

          {/* =========================================================================
              CLEAN FORMS
              ========================================================================= */}

          {/* 1. CITIZEN LOGIN */}
          {selectedRole === 'citizen' && authMode === 'login' && (
            <form onSubmit={handleCitizenLogin} className="space-y-4 animate-fade-scale">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Citizen Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="citizen@urban.eco"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCitizenEmail('citizen@urban.eco');
                      setCitizenPassword('citizen123');
                    }}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    Auto-Fill Citizen Demo
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={citizenPassword}
                    onChange={(e) => setCitizenPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Citizen Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. CITIZEN SIGNUP */}
          {selectedRole === 'citizen' && authMode === 'signup' && (
            <form onSubmit={handleCitizenSignup} className="space-y-3.5 animate-fade-scale">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={citName}
                    onChange={(e) => setCitName(e.target.value)}
                    placeholder="E.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={citEmail}
                      onChange={(e) => setCitEmail(e.target.value)}
                      placeholder="aarav@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={citPhone}
                      onChange={(e) => setCitPhone(e.target.value)}
                      placeholder="+91 98201 12345"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Ward *</label>
                  <select
                    value={citZone}
                    onChange={(e) => setCitZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Zone 1 - Central Ward">Zone 1 - Central Ward</option>
                    <option value="Zone 2 - North Sector">Zone 2 - North Sector</option>
                    <option value="Zone 3 - South Sector">Zone 3 - South Sector</option>
                    <option value="Zone 4 - East Extension">Zone 4 - East Extension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={citPassword}
                      onChange={(e) => setCitPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Citizen Account & Start Reporting</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. WORKER LOGIN */}
          {selectedRole === 'worker' && authMode === 'login' && (
            <form onSubmit={handleWorkerLogin} className="space-y-4 animate-fade-scale">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Worker Email or ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={workerEmail}
                    onChange={(e) => setWorkerEmail(e.target.value)}
                    placeholder="worker@urban.eco"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkerEmail('worker@urban.eco');
                      setWorkerPassword('worker123');
                    }}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Auto-Fill Worker Demo
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={workerPassword}
                    onChange={(e) => setWorkerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <HardHat className="w-4 h-4" />
                    <span>Check In to Worker Squad Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 4. WORKER SIGNUP */}
          {selectedRole === 'worker' && authMode === 'signup' && (
            <form onSubmit={handleWorkerSignup} className="space-y-3.5 animate-fade-scale">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operative Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    placeholder="E.g. Rajesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={workerRegEmail}
                      onChange={(e) => setWorkerRegEmail(e.target.value)}
                      placeholder="rajesh@urban.eco"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={workerPhone}
                      onChange={(e) => setWorkerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operational Zone *</label>
                  <select
                    value={workerZone}
                    onChange={(e) => setWorkerZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Zone 1 - Central Ward">Zone 1 - Central Ward</option>
                    <option value="Zone 2 - North Sector">Zone 2 - North Sector</option>
                    <option value="Zone 3 - South Sector">Zone 3 - South Sector</option>
                    <option value="Zone 4 - East Extension">Zone 4 - East Extension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Vehicle *</label>
                  <select
                    value={workerVehicle}
                    onChange={(e) => setWorkerVehicle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Hydraulic Compactor Truck (MH-01-EQ-4421)">Compactor Truck</option>
                    <option value="Mini Tipper Van (MH-01-TR-8812)">Mini Tipper Van</option>
                    <option value="Electric Trike Dump-Box (MH-01-EV-209)">Electric E-Trike</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={workerPasswordReg}
                    onChange={(e) => setWorkerPasswordReg(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Registering operative...</span>
                  </>
                ) : (
                  <>
                    <HardHat className="w-4 h-4" />
                    <span>Register as Sanitation Squad Operative</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 5. ADMIN LOGIN */}
          {selectedRole === 'admin' && authMode === 'login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-scale">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Municipal Admin Security Gate
                </span>
                <span className="text-[11px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-bold">
                  PIN: 2026
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@urban.eco"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="AdminSecure@2026"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Officer 2FA PIN</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="2026"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono tracking-widest font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@urban.eco');
                    setAdminPassword('AdminSecure@2026');
                    setAdminPin('2026');
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline"
                >
                  Auto-Fill Officer Demo (admin@urban.eco / 2026)
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Verifying clearance...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Municipal Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 6. ADMIN SIGNUP */}
          {selectedRole === 'admin' && authMode === 'signup' && (
            <form onSubmit={handleAdminSignup} className="space-y-3.5 animate-fade-scale">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Officer Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Dr. Priya Desai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={adminRegEmail}
                      onChange={(e) => setAdminRegEmail(e.target.value)}
                      placeholder="priya@urban.eco"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={adminDept}
                    onChange={(e) => setAdminDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Municipal Environmental Directorate">Environmental Directorate</option>
                    <option value="Solid Waste & Compactor Fleet Command">Solid Waste Fleet Command</option>
                    <option value="AI Vision & Automated Geolocation Audit">AI Vision & Geolocation Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={adminPasswordReg}
                    onChange={(e) => setAdminPasswordReg(e.target.value)}
                    placeholder="AdminSecure@2026"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Enrolling officer...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Register & Open Command Hub</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Guest Link & Helpdesk */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/citizen/report"
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Try Guest Waste AI Scanner &rarr;</span>
            </Link>

            <a
              href="mailto:support@urban.eco"
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              24/7 Municipal Helpdesk
            </a>
          </div>
        </div>

        {/* 3 Simple, Attractive Feature Cards Below */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold text-xs">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">AI Waste Vision</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Detects plastic, organic, paper, glass, e-waste, and hazardous waste accurately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 font-bold text-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">GPS Auto-Lock</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Precise ±4m geolocation tracks the dump and notifies the nearest squad.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 font-bold text-xs">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900">Real-Time Dispatch</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Before & after photo proof verification keeps our city clean and transparent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FrontPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Recycle className="w-5 h-5 text-emerald-600 animate-spin" />
            <span>Loading Smart Waste Monitoring System...</span>
          </div>
        </div>
      }
    >
      <FrontPageAuthContent />
    </Suspense>
  );
}
