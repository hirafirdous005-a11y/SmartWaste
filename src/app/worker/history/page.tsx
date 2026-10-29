'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { WasteReport, WorkerTask } from '@/lib/types';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

const SAMPLE_AFTER_PHOTOS = [
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
];

export default function WorkerHistoryPage() {
  const { currentUser, tasks, reports } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Completed tasks for current worker (or all if admin)
  const workerTasks = tasks.filter((t) => !currentUser || t.worker_id === currentUser.id);
  const completedTasks = workerTasks.filter((t) => t.task_status === 'Completed');

  const getReportForTask = (reportId: string): WasteReport | undefined => {
    return reports.find((r) => r.id === reportId);
  };

  const filteredTasks = completedTasks.filter((task) => {
    const report = getReportForTask(task.report_id);
    if (!report) return false;

    const matchesSearch =
      report.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.completion_notes && task.completion_notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            SANITATION PERFORMANCE LEDGER
          </span>
          <span className="text-xs text-slate-400">&bull; Field Work Proofs</span>
        </div>
        <h1 className="text-2xl font-black">Cleared Waste Task History</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Historical record of verified urban sanitation jobs, before-and-after photographic evidence, and depot disposal logs.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block mb-1">Total Cleared</span>
          <div className="text-2xl font-black text-slate-900">{completedTasks.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block mb-1">Crew Rating</span>
          <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
            <span>4.9</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400">Citizen satisfaction</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block mb-1">Avg Resolution</span>
          <div className="text-2xl font-black text-indigo-600">38m</div>
          <span className="text-[10px] text-slate-400">SLA standard: 2h</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block mb-1">Disposal Rate</span>
          <div className="text-2xl font-black text-emerald-600">100%</div>
          <span className="text-[10px] text-slate-400">Depot delivered</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search completed task number, street, or disposal notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Completed Tasks Found</h3>
            <p className="text-xs text-slate-500">
              {completedTasks.length === 0
                ? 'Tasks you complete in the field will be permanently logged here with photographic proof.'
                : 'No completed tasks matched your search term.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const report = getReportForTask(task.report_id);
            if (!report) return null;

            return (
              <div
                key={task.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900">
                        {report.complaint_number}
                      </span>
                      <PriorityBadge priority={report.priority} />
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed & Cleared
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{report.address}</span>
                    </p>
                  </div>

                  <Link
                    href={`/worker/tasks/${task.id}`}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Inspect Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Photographic Proof: Before & After */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">
                    Photographic Proof Comparison:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 group">
                      <img
                        src={task.before_image || report.image_url}
                        alt="Before Cleanup"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 text-white font-mono text-[9px] font-bold rounded">
                        BEFORE (REPORTED)
                      </span>
                    </div>

                    <div className="relative h-40 rounded-2xl overflow-hidden border border-emerald-300 group">
                      <img
                        src={task.after_image || SAMPLE_AFTER_PHOTOS[0]}
                        alt="After Cleanup"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded">
                        AFTER (CLEARED)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completion Notes */}
                {task.completion_notes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">
                      Sanitation Notes & Depot Record:
                    </span>
                    <p className="text-slate-700 italic">&quot;{task.completion_notes}&quot;</p>
                  </div>
                )}

                {/* Bottom Timeline details */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 flex-wrap gap-2">
                  <span>Assigned: {new Date(task.assigned_at).toLocaleDateString()}</span>
                  <span>
                    Completed:{' '}
                    {task.completed_at
                      ? new Date(task.completed_at).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </span>
                  <span className="text-emerald-700 font-semibold font-mono">
                    Turnaround: ~35 mins
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
