'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { MapPin, Flame, Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/map/AdminMap').then((mod) => mod.AdminMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[640px] bg-slate-100 rounded-3xl flex items-center justify-center text-xs text-slate-400">
      Loading Citywide Interactive Map...
    </div>
  ),
});

export default function AdminFullMapPage() {
  const { reports } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Interactive Citywide GPS Waste Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial tracking of all {reports.length} waste reports and high-density hotspot clusters.
          </p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <AdminMap reports={reports} />
      </div>
    </div>
  );
}
