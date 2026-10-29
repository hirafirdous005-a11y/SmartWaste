'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import {
  BarChart3,
  Download,
  TrendingUp,
  Recycle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { StatusDistributionChart } from '@/components/charts/StatusDistributionChart';

export default function AdminAnalyticsPage() {
  const { reports, stats } = useApp();

  // Compute analytics
  const totalReports = reports.length || 1;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;
  const resolutionRate = Math.round((resolvedCount / totalReports) * 100);

  // Recyclable count based on AI or category
  const recyclableCount = reports.filter((r) => {
    const cat = r.verified_category || r.predicted_category;
    return ['Plastic waste', 'Paper waste', 'Glass waste', 'Metal waste', 'E-waste'].includes(cat);
  }).length;
  const recyclablePercentage = Math.round((recyclableCount / totalReports) * 100);

  // Ward breakdown
  const wardCounts: Record<string, number> = {
    'Central Ward': 0,
    'Kurla & North': 0,
    'Bandra & West': 0,
    'Santacruz & Industrial': 0,
  };

  reports.forEach((r) => {
    const addr = r.address.toLowerCase();
    if (addr.includes('central') || addr.includes('mg road')) wardCounts['Central Ward'] += 1;
    else if (addr.includes('kurla') || addr.includes('north')) wardCounts['Kurla & North'] += 1;
    else if (addr.includes('bandra') || addr.includes('west')) wardCounts['Bandra & West'] += 1;
    else wardCounts['Santacruz & Industrial'] += 1;
  });

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-waste-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(`Export error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Municipal Waste Analytics & Environmental Insights
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical breakdown of urban waste stream composition, operational turnaround times, and ward density.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Analytics CSV</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Clearance Success Rate</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">{resolutionRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">Verified cleared by citizens & admins</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Recyclable Stream Share</p>
          <h3 className="text-3xl font-black text-teal-600 mt-1">{recyclablePercentage}%</h3>
          <p className="text-xs text-slate-500 mt-1">Plastic, metal, glass & paper recovery</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Avg Response Turnaround</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">4.2 hrs</h3>
          <p className="text-xs text-slate-500 mt-1">From intake to squad arrival</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Overdue Complaints</p>
          <h3 className="text-3xl font-black text-rose-600 mt-1">{stats.overdue}</h3>
          <p className="text-xs text-slate-500 mt-1">Active complaints over 24 hours</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart reports={reports} />
        <StatusDistributionChart reports={reports} />
      </div>

      {/* Ward Volume Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Ward & Zone Complaint Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Object.entries(wardCounts).map(([ward, count]) => {
            const pct = Math.round((count / totalReports) * 100);
            return (
              <div key={ward} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-800">{ward}</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{count}</span>
                  <span className="text-xs font-mono text-slate-500">({pct}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
