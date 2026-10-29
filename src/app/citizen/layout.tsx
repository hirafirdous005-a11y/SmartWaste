'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Camera,
  MapPin,
  CheckCircle2,
  ListTodo,
  Bell,
  Settings,
  PlusCircle,
  Home,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

function CitizenLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, loginUser, registerUser, logoutUser, switchUserRole, notifications } = useApp();

  // Authentication states
  const [authTab, setAuthTab] = React.useState<'signin' | 'register'>('signin');
  const [email, setEmail] = React.useState('citizen@urban.eco');
  const [password, setPassword] = React.useState('••••••••');
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Registration states
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regZone, setRegZone] = React.useState('Zone 1 - Central Ward');

  const isCitizenAuthenticated = currentUser && currentUser.role === 'citizen';

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const success = loginUser(email.trim(), password);
    if (!success) {
      setAuthError('Invalid credentials. Use citizen@urban.eco or click 1-Click Demo Citizen.');
    }
  };

  const handleQuickDemoSignIn = () => {
    switchUserRole('citizen');
    loginUser('citizen@urban.eco');
    setAuthError(null);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setAuthError('Please fill in all required registration fields.');
      return;
    }
    const success = registerUser(regName.trim(), regEmail.trim(), regPhone.trim(), 'citizen');
    if (!success) {
      setAuthError('Could not create account. Please check your details.');
    }
  };

  // If citizen is not authenticated, display proper Sign-In / Login gate
  if (!isCitizenAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-slate-50 via-emerald-50/20 to-slate-100">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header Banner */}
          <div className="p-6 bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-widest">
                Citizen Portal Gate
              </span>
              <h1 className="text-xl font-black text-white mt-1">
                Citizen Sign-In &amp; Verification
              </h1>
              <p className="text-xs text-slate-300">
                Please authenticate with your citizen credentials to enter the reporting system, geotag waste, and track cleanups.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthTab('signin');
                setAuthError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authTab === 'signin'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setAuthError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authTab === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New Citizen Register
            </button>
          </div>

          <div className="p-6 space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {authError}
              </div>
            )}

            {/* TAB 1: Sign In */}
            {authTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Citizen Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@urban.eco"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Demo citizen account: citizen@urban.eco
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Sign In &amp; Enter Citizen Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>⚡ Instant 1-Click Citizen Login (Aarav Sharma)</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: Register New Citizen */
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Priya Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Residential Operational Zone</label>
                  <select
                    value={regZone}
                    onChange={(e) => setRegZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium bg-white"
                  >
                    <option value="Zone 1 - Central Ward">Zone 1 - Central Ward</option>
                    <option value="Zone 2 - North Sector">Zone 2 - North Sector</option>
                    <option value="Zone 3 - West Waterfront">Zone 3 - West Waterfront</option>
                    <option value="Zone 4 - East Riverfront">Zone 4 - East Riverfront</option>
                    <option value="Zone 5 - South Suburbs">Zone 5 - South Suburbs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Create Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Create Account &amp; Enter Citizen Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>GPS Geotagging &amp; AI Vision Enabled</span>
              </span>
              <Link href="/" className="text-emerald-700 font-bold hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Citizen Navigation Menu Links
  const citizenNav = [
    { href: '/citizen', label: 'Dashboard', icon: Home },
    { href: '/citizen/report', label: 'Report Waste', icon: PlusCircle, isHighlight: true },
    { href: '/citizen/complaints', label: 'My Complaints', icon: ListTodo },
    { href: '/citizen/track', label: 'Track Timeline', icon: MapPin },
    { href: '/citizen/notifications', label: 'Notifications', icon: Bell },
    { href: '/citizen/profile', label: 'Profile', icon: Settings },
  ];

  const unreadNotifs = notifications.filter(
    (n) => n.recipient_id === currentUser.id && !n.is_read
  ).length;

  return (
    <div>
      {/* Citizen Sub-Navigation Bar */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 overflow-x-auto">
            <div className="flex items-center gap-1.5 py-1">
              {citizenNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      item.isHighlight
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold'
                        : isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && unreadNotifs > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {unreadNotifs}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Authenticated Citizen Profile & Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="font-bold text-slate-800 block leading-tight">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold block">
                    Verified Citizen
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logoutUser();
                  router.push('/');
                }}
                title="Log out from citizen account"
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[11px] font-bold transition-colors flex items-center gap-1 ml-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-400">
          Loading Citizen Portal...
        </div>
      }
    >
      <CitizenLayoutContent>{children}</CitizenLayoutContent>
    </React.Suspense>
  );
}
