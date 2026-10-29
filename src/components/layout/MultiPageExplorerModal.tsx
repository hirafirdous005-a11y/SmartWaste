'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Compass,
  X,
  Search,
  ShieldCheck,
  User,
  HardHat,
  MapPin,
  Camera,
  ListTodo,
  FileText,
  BarChart3,
  Sparkles,
  Send,
  Users,
  Bell,
  Settings,
  Flame,
  BookOpen,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  Globe,
} from 'lucide-react';

interface MultiPageExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiPageExplorerModal: React.FC<MultiPageExplorerModalProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { currentUser, adminSession } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'citizen' | 'worker' | 'admin' | 'public'>('all');

  if (!isOpen) return null;

  const PAGE_DIRECTORY = [
    // 👤 Citizen Pages
    {
      title: 'Citizen Dashboard',
      description: 'Overview of citizen complaints, resolution stats, and neighborhood waste map.',
      href: '/citizen',
      category: 'citizen',
      role: 'Citizen',
      icon: User,
      badge: 'Portal Hub',
      color: 'blue',
    },
    {
      title: 'Report Waste & Camera Snap',
      description: 'Capture road dust or illegal dump with camera, auto-fetch GPS, AI classification & voice readout.',
      href: '/citizen/report',
      category: 'citizen',
      role: 'Citizen',
      icon: Camera,
      badge: 'AI + GPS Voice',
      color: 'emerald',
      highlight: true,
    },
    {
      title: 'My Complaints',
      description: 'Historical archive of submitted reports with status filters, photos, and tracking links.',
      href: '/citizen/complaints',
      category: 'citizen',
      role: 'Citizen',
      icon: ListTodo,
      badge: 'Table & Cards',
      color: 'blue',
    },
    {
      title: 'Live Complaint Tracking',
      description: 'Step-by-step 4-stage visual progress timeline from citizen snap to worker clearance.',
      href: '/citizen/track',
      category: 'citizen',
      role: 'Citizen',
      icon: MapPin,
      badge: 'Live Timeline',
      color: 'teal',
    },
    {
      title: 'Citizen Notifications',
      description: 'Real-time alert feed for squad dispatches, clearance verification requests, and SMS toggles.',
      href: '/citizen/notifications',
      category: 'citizen',
      role: 'Citizen',
      icon: Bell,
      badge: 'Alert Feed',
      color: 'amber',
    },
    {
      title: 'Citizen Profile Settings',
      description: 'Manage legal name, mobile phone for SMS alerts, and municipal ward zone preference.',
      href: '/citizen/profile',
      category: 'citizen',
      role: 'Citizen',
      icon: Settings,
      badge: 'Preferences',
      color: 'slate',
    },

    // 👷 Sanitation Worker Pages
    {
      title: 'Field Sanitation Tasks',
      description: 'Task feed with priority tags, Haversine GPS routing, and status transitions.',
      href: '/worker',
      category: 'worker',
      role: 'Sanitation Squad',
      icon: HardHat,
      badge: 'Field Ops',
      color: 'amber',
      highlight: true,
    },
    {
      title: 'Completed History & Proofs',
      description: 'Audit log of cleared sites with Before/After photographic proofs and tonnage diverted.',
      href: '/worker/history',
      category: 'worker',
      role: 'Sanitation Squad',
      icon: FileText,
      badge: 'Photo Proofs',
      color: 'amber',
    },

    // 🛡️ Municipal Admin Pages
    {
      title: 'Municipal Command Center',
      description: 'Citywide operational dashboard with live KPI counters, resolution rate, and emergency alerts.',
      href: '/admin',
      category: 'admin',
      role: 'Administrator',
      icon: ShieldCheck,
      badge: 'Level 4 Clearance',
      color: 'emerald',
    },
    {
      title: 'Complaints Management Queue',
      description: 'Citywide complaints database with full text search, priority filters, and worker assignment modal.',
      href: '/admin/complaints',
      category: 'admin',
      role: 'Administrator',
      icon: ListTodo,
      badge: 'Fleet Queue',
      color: 'emerald',
    },
    {
      title: 'AI Multi-Spectral Review',
      description: 'Verify ResNet-50 and Gemini Vision predictions, override confidence scores, and retrain labels.',
      href: '/admin/ai-review',
      category: 'admin',
      role: 'Administrator',
      icon: Sparkles,
      badge: 'Neural Vision',
      color: 'cyan',
    },
    {
      title: 'Nearest Worker Dispatch Engine',
      description: 'Calculate real-time Haversine GPS distances and auto-route nearest available squad truck.',
      href: '/admin/dispatch',
      category: 'admin',
      role: 'Administrator',
      icon: Send,
      badge: 'Haversine Engine',
      color: 'blue',
    },
    {
      title: 'Citywide Satellite GPS Map',
      description: 'Interactive OpenStreetMap with waste hotspot clustering, truck routes, and ward boundaries.',
      href: '/admin/map',
      category: 'admin',
      role: 'Administrator',
      icon: MapPin,
      badge: 'GIS Clustering',
      color: 'indigo',
    },
    {
      title: 'Sanitation Fleet & Squad Roster',
      description: 'Worker management, real-time availability status toggles, and zone shift allocations.',
      href: '/admin/workers',
      category: 'admin',
      role: 'Administrator',
      icon: Users,
      badge: 'Fleet Crew',
      color: 'emerald',
    },
    {
      title: 'Waste Analytics & Trends',
      description: 'Multi-stream waste generation metrics, recyclable polymer diversion ratios, and CSV exports.',
      href: '/admin/analytics',
      category: 'admin',
      role: 'Administrator',
      icon: BarChart3,
      badge: 'Analytics BI',
      color: 'teal',
    },
    {
      title: 'Municipal Audit Trail',
      description: 'Immutable security log of all dispatch approvals, category overrides, and officer logins.',
      href: '/admin/audit',
      category: 'admin',
      role: 'Administrator',
      icon: FileText,
      badge: 'Security Audit',
      color: 'rose',
    },

    // 🌐 Public & Shared Pages
    {
      title: 'Homepage & Telemetry Hub',
      description: 'Municipal platform landing page with real-time telemetry ticker and 4-step pipeline simulator.',
      href: '/',
      category: 'public',
      role: 'Public Gateway',
      icon: Globe,
      badge: 'Root Gateway',
      color: 'emerald',
    },
    {
      title: 'Unified Login Procedure Gate',
      description: 'Multi-persona authentication gate for Citizen, Sanitation Worker, or Municipal Administrator.',
      href: '/login',
      category: 'public',
      role: 'Public Gateway',
      icon: Lock,
      badge: 'Security Gate',
      color: 'blue',
    },
    {
      title: 'Public City Waste Hotspots',
      description: 'Citywide cleanliness map, ward hygiene rankings, and community cleanup milestones.',
      href: '/hotspots',
      category: 'public',
      role: 'Public Resource',
      icon: Flame,
      badge: 'Public Map',
      color: 'rose',
      highlight: true,
    },
    {
      title: 'Municipal Handbook & Rules',
      description: 'Guidelines on dry/wet/hazardous waste segregation, photography tips, and citizen reward points.',
      href: '/guide',
      category: 'public',
      role: 'Public Resource',
      icon: BookOpen,
      badge: 'Citizen Handbook',
      color: 'cyan',
    },
  ];

  const filteredPages = PAGE_DIRECTORY.filter((page) => {
    const matchesCategory = activeCategory === 'all' || page.category === activeCategory;
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl overflow-hidden text-white">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 -mt-16 w-96 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 -mt-16 w-96 h-32 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-7 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>Multi-Page Application Architecture &bull; 20 Active Routes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Platform Multi-Page Directory &amp; Navigation Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly jump to any portal page across Citizen, Worker, Administrator, and Public services.
            </p>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Multi-Page Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="relative z-10 p-4 sm:px-7 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Pages (20)', count: 20 },
              { id: 'citizen', label: 'Citizen (6)', count: 6 },
              { id: 'worker', label: 'Worker (2)', count: 2 },
              { id: 'admin', label: 'Admin (8)', count: 8 },
              { id: 'public', label: 'Public (4)', count: 4 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter pages by keyword or route..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
            />
          </div>
        </div>

        {/* Scrollable Page Grid */}
        <div className="relative z-10 p-4 sm:p-7 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPages.map((page) => {
              const Icon = page.icon;
              const isActive = pathname === page.href;

              return (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={onClose}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                    isActive
                      ? 'bg-slate-800/90 border-emerald-400/80 shadow-lg ring-1 ring-emerald-400/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  {/* Category Accent Stripe */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1 ${
                      page.category === 'citizen'
                        ? 'bg-blue-500'
                        : page.category === 'worker'
                        ? 'bg-amber-500'
                        : page.category === 'admin'
                        ? 'bg-emerald-500'
                        : 'bg-cyan-500'
                    }`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          page.category === 'citizen'
                            ? 'bg-blue-500/20 text-blue-400'
                            : page.category === 'worker'
                            ? 'bg-amber-500/20 text-amber-400'
                            : page.category === 'admin'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {page.badge}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            Current
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {page.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {page.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 truncate max-w-[170px]">{page.href}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open Page</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No pages found matching &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Clear filters and view all 20 pages
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-7 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Session: {currentUser ? `${currentUser.full_name} (${currentUser.role})` : 'Unauthenticated Gateway'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/hotspots"
              onClick={onClose}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Public Hotspots Map</span>
            </Link>
            <span>&bull;</span>
            <Link
              href="/guide"
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Segregation Guide</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
