'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { WasteReport, WorkerTask } from '@/lib/types';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  HardHat,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import Link from 'next/link';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const { reports, tasks, workers, confirmResolution, reopenReport } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialId || '');
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Find initial or default report
  useEffect(() => {
    if (initialId) {
      const found = reports.find(
        (r) => r.complaint_number.toLowerCase() === initialId.toLowerCase()
      );
      if (found) {
        setSelectedReport(found);
        return;
      }
    }
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0]);
    }
  }, [initialId, reports]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = reports.find(
      (r) =>
        r.complaint_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedReport(found);
    } else {
      alert(`No complaint found matching "${searchQuery}".`);
    }
  };

  // Find worker task & proof photos for selected report
  const relatedTask = tasks.find((t) => t.report_id === selectedReport?.id);
  const assignedWorker = workers.find((w) => w.id === selectedReport?.assigned_worker_id);

  // Compute timeline steps
  const getTimelineSteps = (report: WasteReport) => {
    const steps = [
      {
        id: 'submitted',
        title: 'Complaint Registered',
        desc: `Logged with GPS coordinates at ${new Date(report.created_at).toLocaleTimeString()}`,
        status: 'completed',
        time: new Date(report.created_at).toLocaleDateString(),
      },
      {
        id: 'review',
        title: 'AI Classification & Triage',
        desc: `Predicted: ${report.predicted_category} (${report.ai_confidence}% confidence)`,
        status: report.status !== 'Submitted' ? 'completed' : 'current',
        time: 'Immediate',
      },
      {
        id: 'assigned',
        title: report.assigned_worker_name ? `Assigned to ${report.assigned_worker_name}` : 'Sanitation Worker Assignment',
        desc: report.assigned_worker_name
          ? `Dispatched from Zone Squad with priority ${report.priority}`
          : 'Pending administrator squad dispatch',
        status:
          report.status === 'Assigned' || report.status === 'In Progress' || report.status === 'Resolved'
            ? 'completed'
            : report.status === 'Under Review'
            ? 'current'
            : 'pending',
        time: report.assigned_worker_name ? 'Dispatched' : 'Queued',
      },
      {
        id: 'in_progress',
        title: 'Site Cleaning & Waste Hauling',
        desc: 'Frontline squad clearing debris and disinfecting site',
        status:
          report.status === 'Resolved'
            ? 'completed'
            : report.status === 'In Progress'
            ? 'current'
            : 'pending',
        time: report.status === 'In Progress' ? 'Active' : 'Pending',
      },
      {
        id: 'resolved',
        title: 'Verification & Resolution',
        desc: report.status === 'Resolved' ? 'Area cleaned and verified with photographic proof' : 'Awaiting worker proof submission',
        status: report.status === 'Resolved' ? 'completed' : 'pending',
        time: report.status === 'Resolved' ? new Date(report.updated_at).toLocaleDateString() : 'Pending',
      },
    ];

    if (report.status === 'Rejected') {
      return [
        steps[0],
        {
          id: 'rejected',
          title: 'Complaint Rejected',
          desc: report.rejection_reason || 'Rejected by municipal supervisor.',
          status: 'error',
          time: new Date(report.updated_at).toLocaleDateString(),
        },
      ];
    }

    return steps;
  };

  const handleReopenSubmit = () => {
    if (!selectedReport || !reopenReason.trim()) return;
    reopenReport(selectedReport.id, reopenReason);
    setReopenModalOpen(false);
    setReopenReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Complaint Progress Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status tracking from mobile camera intake to sanitation squad resolution
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Complaint ID (e.g. SWM-2026-1041)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Track
          </button>
        </form>
      </div>

      {/* Main Grid: Left selector list / Right active detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: List of complaints */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              All Registered Complaints ({reports.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {reports.map((r) => {
              const isSelected = selectedReport?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {r.complaint_number}
                    </span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{r.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="text-emerald-700 font-semibold">{r.predicted_category}</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Complaint Comprehensive Timeline & Proof */}
        <div className="lg:col-span-8 space-y-6">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-slate-900">
                        {selectedReport.complaint_number}
                      </span>
                      <PriorityBadge priority={selectedReport.priority} />
                      <StatusBadge status={selectedReport.status} size="md" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedReport.address}</span>
                    </div>
                  </div>

                  {/* Citizen Confirm or Reopen Actions if Resolved */}
                  {selectedReport.status === 'Resolved' && (
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {selectedReport.citizen_feedback === 'confirmed' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>Resolution Confirmed</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => confirmResolution(selectedReport.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Confirm Cleaned</span>
                          </button>
                          <button
                            onClick={() => setReopenModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reopen Issue</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Citizen Description: </span>
                  {selectedReport.description}
                </p>

                {/* Worker Card if Assigned */}
                {assignedWorker && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={assignedWorker.avatar}
                        alt={assignedWorker.name}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <HardHat className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-bold text-xs text-slate-900">{assignedWorker.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Sanitation Worker &bull; {assignedWorker.assigned_zone}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${assignedWorker.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-2xs hover:bg-emerald-50"
                    >
                      {assignedWorker.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Step Progress Timeline */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <h3 className="font-bold text-sm text-slate-900">Live Municipal Lifecycle</h3>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {getTimelineSteps(selectedReport).map((step) => {
                    const isDone = step.status === 'completed';
                    const isCurr = step.status === 'current';
                    const isErr = step.status === 'error';

                    return (
                      <div key={step.id} className="relative flex items-start justify-between gap-4">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-600 border-white shadow-xs text-white'
                              : isCurr
                              ? 'bg-amber-500 border-white shadow-xs text-white animate-pulse'
                              : isErr
                              ? 'bg-rose-600 border-white text-white'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>

                        <div className="space-y-0.5">
                          <h4
                            className={`text-xs font-bold ${
                              isDone ? 'text-slate-900' : isCurr ? 'text-amber-800' : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {step.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Before and After Proof of Cleaning Photos */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Cleaning Proof Verification</span>
                  </h3>
                  <span className="text-xs text-slate-400">Photographic Evidence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700">Initial Reported State</span>
                    <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={selectedReport.image_url}
                        alt="Initial waste report"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                        BEFORE
                      </span>
                    </div>
                  </div>

                  {/* After Photo (Proof from worker) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700">Worker Clearance Proof</span>
                    <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {relatedTask?.after_image ? (
                        <>
                          <img
                            src={relatedTask.after_image}
                            alt="Cleaned proof"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                            AFTER (VERIFIED)
                          </span>
                        </>
                      ) : (
                        <div className="text-center p-4 text-slate-400 text-xs">
                          <Clock className="w-8 h-8 mx-auto mb-1 opacity-40 animate-spin-slow" />
                          <p className="font-medium">Sanitation team is clearing this site.</p>
                          <p className="text-[10px] text-slate-400">After photo will be displayed upon task completion.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {relatedTask?.completion_notes && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold">Sanitation Worker Notes: </span>
                    {relatedTask.completion_notes}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              Select a complaint from the left to track progress.
            </div>
          )}
        </div>
      </div>

      {/* Reopen Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Reopen Waste Complaint</h3>
            <p className="text-xs text-slate-600">
              Explain why this location needs another cleaning pass:
            </p>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="E.g. Residual debris was left on the curb..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReopenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenSubmit}
                disabled={!reopenReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackComplaintsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading progress tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
