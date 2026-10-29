'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Recycle,
  ShieldCheck,
  HardHat,
  User,
  PlusCircle,
  MapPin,
  BarChart3,
  ListTodo,
  FileText,
  Menu,
  X,
  Sparkles,
  LogOut,
  Users,
  Send,
  Lock,
} from 'lucide-react';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import { BrandLogo } from '../ui/BrandLogo';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, adminSession, logoutUser, isConfiguredWithSupabase } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRoleLinks = () => {
    if (!mounted || !currentUser) {
      return [
        { href: '/', label: 'Home Gate', icon: User },
        { href: '/login', label: 'Sign In / Select Role', icon: Lock, highlight: true },
      ];
    }
    if (currentUser.role === 'admin' && adminSession) {
      return [
        { href: '/admin', label: 'Dashboard', icon: BarChart3 },
        { href: '/admin/complaints', label: 'Complaints', icon: ListTodo },
        { href: '/admin/ai-review', label: 'AI Review', icon: Sparkles },
        { href: '/admin/dispatch', label: 'Dispatch', icon: Send },
        { href: '/admin/map', label: 'GPS Map', icon: MapPin },
        { href: '/admin/workers', label: 'Fleet', icon: Users },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/audit', label: 'Audit', icon: FileText },
      ];
    }
    if (currentUser.role === 'worker') {
      return [
        { href: '/worker', label: 'My Tasks', icon: ListTodo },
        { href: '/worker/history', label: 'Task History & Proofs', icon: FileText },
      ];
    }
    // Citizen role
    return [
      { href: '/citizen', label: 'Dashboard', icon: User },
      { href: '/citizen/report', label: 'Report Waste', icon: PlusCircle, highlight: true },
      { href: '/citizen/complaints', label: 'My Complaints', icon: ListTodo },
      { href: '/citizen/track', label: 'Track Timeline', icon: MapPin },
    ];
  };

  const navLinks = getRoleLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />

            {/* Portal Badge */}
            {mounted && currentUser && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs ml-1">
                {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                {currentUser.role === 'worker' && <HardHat className="w-3.5 h-3.5 text-amber-600" />}
                {currentUser.role === 'citizen' && <User className="w-3.5 h-3.5 text-blue-600" />}
                <span className="capitalize">{currentUser.role} Portal</span>
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    link.highlight
                      ? 'bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95'
                      : isActive
                      ? 'bg-emerald-50/90 text-emerald-900 border border-emerald-200 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-white' : isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Center: Role Switcher & Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Role Switcher (Only active when logged in) */}
            {mounted && currentUser && (
              <div className="hidden sm:block">
                <RoleSwitcher />
              </div>
            )}

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Profile Avatar / Logout */}
            {mounted && currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="relative">
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/80 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">{currentUser.role}</p>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    window.location.href = '/';
                  }}
                  title="Sign Out & Return to Login Gate"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In &bull; Select Role</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-3">
          {/* Persona Switcher on Mobile (only when logged in) */}
          {currentUser && (
            <div className="py-2 border-b border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Switch Portal Persona:
              </p>
              <RoleSwitcher />
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {currentUser ? (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">{currentUser.full_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logoutUser();
                  window.location.href = '/';
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In &bull; Select Role (Citizen / Worker / Admin)</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
