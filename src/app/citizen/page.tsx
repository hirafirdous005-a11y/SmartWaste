'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatCard } from '@/components/ui/StatCard';
import dynamic from 'next/dynamic';

// Dynamic import for nearby map to prevent SSR issues
const NearbyMap = dynamic(
  () =>
    import('@/components/map/AdminMap').then((mod) => {
      // Wrapper for nearby view
      return function NearbyMapWrapper({ reports }: { reports: any[] }) {
        return <mod.AdminMap reports={reports} />;
      };
    }),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">Loading Community Waste Map...</div> }
);

export default function CitizenDashboardPage() {
  const { currentUser, reports, confirmResolution, reopenReport } = useApp();
  const [reopenModalReportId, setReopenModalReportId] = useState<string | null>(null);
  const [reopenReasonText, setReopenReasonText] = useState('');

  // Filter complaints filed by this citizen (or all if demo)
  const myReports = reports.filter((r) => !currentUser || r.citizen_id === currentUser.id);

  const pendingCount = myReports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
  const inProgressCount = myReports.filter((r) => r.status === 'Assigned' || r.status === 'In Progress').length;
  const resolvedCount = myReports.filter((r) => r.status === 'Resolved').length;

  // Complaints resolved that need confirmation or can be reopened
  const needsConfirmationReports = myReports.filter(
    (r) => r.status === 'Resolved' && (!r.citizen_feedback || r.citizen_feedback === null)
  );

  const handleReopenSubmit = () => {
    if (!reopenModalReportId || !reopenReasonText.trim()) return;
    reopenReport(reopenModalReportId, reopenReasonText);
    setReopenModalReportId(null);
    setReopenReasonText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Report Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-10 rounded-3xl bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-2xl border border-emerald-800/50">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30 font-mono shadow-xs">
              CITIZEN PORTAL
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Central Ward GPS Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, <span className="bg-linear-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">{currentUser?.full_name || 'Citizen'}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Keep your neighborhood clean. Snap road dust or garbage piles, get real-time AI classification with voice guidance, and track the nearest dispatched sanitation crew.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            href="/citizen/report"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-400/40"
          >
            <Camera className="w-5 h-5 text-slate-950" />
            <span>Report Waste Now</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="My Reports"
          value={myReports.length}
          subtitle="Total complaints logged"
          icon={<Layers className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Worker squads active"
          icon={<Clock className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Under Review"
          value={pendingCount}
          subtitle="Pending municipal triage"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Cleared locations"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Action Required: Confirm Resolution / Reopen Banner */}
      {needsConfirmationReports.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-sm text-amber-900">
                Action Required: Confirm Resolved Cleanups ({needsConfirmationReports.length})
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-medium">Verify your area</span>
          </div>

          <p className="text-xs text-amber-800">
            Sanitation workers have submitted cleaning completion for the following reports. Please inspect and confirm that the waste has been cleared, or reopen if residue remains.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {needsConfirmationReports.map((r) => (
              <div
                key={r.id}
                className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={r.image_url}
                    alt={r.complaint_number}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border"
                  />
                  <div className="truncate text-xs">
                    <p className="font-bold text-slate-900">{r.complaint_number}</p>
                    <p className="text-slate-500 truncate">{r.address}</p>
                    <p className="text-emerald-700 font-medium text-[11px]">{r.predicted_category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => confirmResolution(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => setReopenModalReportId(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Complaints List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">My Waste Complaints</h2>
            <p className="text-xs text-slate-500">Track current status, assigned workers, and AI classifications</p>
          </div>
          <Link
            href="/citizen/track"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View Timeline Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myReports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Camera className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium">You haven&apos;t reported any waste yet.</p>
            <Link
              href="/citizen/report"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Report Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myReports.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <img
                    src={r.image_url}
                    alt={r.complaint_number}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{r.complaint_number}</span>
                      <PriorityBadge priority={r.priority} />
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{r.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {r.address}
                      </span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-semibold">{r.predicted_category}</span>
                      <span>&bull;</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/citizen/track?id=${r.complaint_number}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Track Progress</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Waste Map (Privacy-preserved) */}
      <div id="nearby-map" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              COMMUNITY AWARENESS
            </span>
            <span className="text-xs text-slate-400">Privacy Preserved</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            Nearby Reported Waste in Central Ward
          </h2>
          <p className="text-xs text-slate-500">
            View active reports in your neighborhood. Personal citizen identities and contact numbers are masked for community safety.
          </p>
        </div>

        {/* Nearby Map container */}
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <NearbyMap reports={reports} />
        </div>
      </div>

      {/* Reopen Modal */}
      {reopenModalReportId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Reopen Waste Complaint</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please explain why the waste remains unresolved (e.g. partial cleaning, scattered debris left behind, blocked entrance).
            </p>

            <textarea
              rows={3}
              placeholder="Provide specific details for the sanitation supervisor..."
              value={reopenReasonText}
              onChange={(e) => setReopenReasonText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReopenModalReportId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenSubmit}
                disabled={!reopenReasonText.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                Reopen Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
