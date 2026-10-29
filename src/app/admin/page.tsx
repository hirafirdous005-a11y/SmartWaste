'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  ShieldCheck,
  ListTodo,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Download,
  Users,
  MapPin,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  HardHat,
  Filter,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { StatusDistributionChart } from '@/components/charts/StatusDistributionChart';
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/map/AdminMap').then((mod) => mod.AdminMap), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">
      Loading Citywide Waste Hotspot Map...
    </div>
  ),
});

export default function AdminDashboardPage() {
  const { stats, reports, workers, assignWorkerToReport, updateReportStatus, verifyReportCategory } = useApp();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [assignModalReport, setAssignModalReport] = useState<any | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // CSV Export handler
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
      a.download = `smart-waste-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(`Export error: ${e.message}`);
    }
  };

  const handleAssignSubmit = () => {
    if (!assignModalReport || !selectedWorkerId) return;
    assignWorkerToReport(assignModalReport.id, selectedWorkerId);
    setAssignModalReport(null);
    setSelectedWorkerId('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-10 rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl border border-slate-800/80">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              MUNICIPAL ADMINISTRATION
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Central Operations Command Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            City Waste Command <span className="bg-linear-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
            Real-time urban waste monitoring, AI classification verification, automated nearest-squad dispatching, and hotspot mitigation.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>

          <Link
            href="/admin/dispatch"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg transition-all active:scale-95"
          >
            <span>⚡ Proximity Dispatch</span>
          </Link>

          <Link
            href="/admin/complaints"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-xl shadow-emerald-500/25 transition-all active:scale-95 hover:scale-105"
          >
            <ListTodo className="w-4 h-4" />
            <span>Manage All Complaints</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Reports"
          value={stats.total}
          subtitle="All complaints"
          icon={<ListTodo className="w-4 h-4" />}
          color="slate"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          subtitle="Needs triage"
          icon={<AlertTriangle className="w-4 h-4" />}
          color="amber"
        />
        <StatCard
          title="Assigned"
          value={stats.assigned}
          subtitle="Queued to squads"
          icon={<HardHat className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Active cleaning"
          icon={<Clock className="w-4 h-4" />}
          color="indigo"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Cleaned & verified"
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="emerald"
        />
        <StatCard
          title="Critical / Overdue"
          value={stats.overdue}
          subtitle=">24 hrs pending"
          icon={<Flame className="w-4 h-4" />}
          color="rose"
        />
      </div>

      {/* Interactive Admin Map & Hotspot Density */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Citywide Waste Hotspots & GPS Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Click any complaint marker to inspect AI predictions, photographic proof, and assigned squads.
            </p>
          </div>
          <Link
            href="/admin/map"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Full Screen Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <AdminMap reports={reports} />
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart reports={reports} />
        <StatusDistributionChart reports={reports} />
      </div>

      {/* Recent Complaints Table & Fast Dispatch */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Recent Complaints Queue</h2>
            <p className="text-xs text-slate-500">Review AI labels, verify categories, and dispatch sanitation workers</p>
          </div>
          <Link
            href="/admin/complaints"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All ({reports.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Complaint</th>
                <th className="py-3 px-3">AI Prediction</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Worker</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.slice(0, 6).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={r.image_url}
                        alt={r.complaint_number}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border"
                      />
                      <div className="truncate max-w-[180px]">
                        <span className="font-bold text-slate-900 font-mono">{r.complaint_number}</span>
                        <p className="text-[11px] text-slate-500 truncate">{r.address}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div>
                      <span className="font-semibold text-emerald-800">
                        {r.verified_category || r.predicted_category}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {r.ai_confidence}% Confidence
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <PriorityBadge priority={r.priority} />
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge status={r.status} size="sm" />
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700">
                      {r.assigned_worker_name || (
                        <span className="text-amber-600 italic">Unassigned</span>
                      )}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setAssignModalReport(r);
                          setSelectedWorkerId(r.assigned_worker_id || workers[0]?.id || '');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition-colors"
                      >
                        {r.assigned_worker_id ? 'Reassign' : 'Assign'}
                      </button>

                      <Link
                        href={`/admin/complaints?id=${r.complaint_number}`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Assignment Modal */}
      {assignModalReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Assign Sanitation Worker</h3>
              <span className="font-mono text-xs text-slate-500">
                {assignModalReport.complaint_number}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>
                <span className="font-bold text-slate-700">Location: </span>
                {assignModalReport.address}
              </p>
              <p>
                <span className="font-bold text-slate-700">Category: </span>
                {assignModalReport.predicted_category} ({assignModalReport.priority} Priority)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Frontline Sanitation Worker
              </label>
              <div className="space-y-2">
                {workers.map((w) => (
                  <label
                    key={w.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedWorkerId === w.id
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="worker"
                        checked={selectedWorkerId === w.id}
                        onChange={() => setSelectedWorkerId(w.id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{w.name}</p>
                        <p className="text-slate-500">{w.assigned_zone}</p>
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {w.active_tasks_count} Active
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setAssignModalReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
