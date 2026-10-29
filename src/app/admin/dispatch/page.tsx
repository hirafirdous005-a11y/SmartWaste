'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { WasteReport, SanitationWorker } from '@/lib/types';
import {
  Send,
  Users,
  HardHat,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function getWorkerLocation(w: SanitationWorker): { lat: number; lon: number } {
  if (w.current_latitude && w.current_longitude) {
    return { lat: w.current_latitude, lon: w.current_longitude };
  }
  if (w.assigned_zone.includes('North')) return { lat: 19.088, lon: 72.885 };
  if (w.assigned_zone.includes('West')) return { lat: 19.062, lon: 72.865 };
  if (w.assigned_zone.includes('South')) return { lat: 19.055, lon: 72.860 };
  if (w.assigned_zone.includes('East')) return { lat: 19.079, lon: 72.890 };
  return { lat: 19.0755, lon: 72.877 };
}

function getRankedWorkersForReport(
  report: WasteReport,
  workerList: SanitationWorker[]
): Array<{ worker: SanitationWorker; distance: number }> {
  return workerList
    .map((w) => {
      const loc = getWorkerLocation(w);
      const distance = calculateDistanceKm(report.latitude, report.longitude, loc.lat, loc.lon);
      return { worker: w, distance };
    })
    .sort((a, b) => a.distance - b.distance);
}

export default function AdminDispatchPage() {
  const { reports, workers, assignWorkerToReport } = useApp();

  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned' | 'all'>('unassigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [assignModalReport, setAssignModalReport] = useState<WasteReport | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Group reports
  const unassignedReports = reports.filter(
    (r) => !r.assigned_worker_id && r.status !== 'Resolved' && r.status !== 'Rejected'
  );
  const assignedReports = reports.filter(
    (r) => !!r.assigned_worker_id && r.status !== 'Resolved' && r.status !== 'Rejected'
  );

  const availableWorkers = workers.filter((w) => w.status === 'Available');

  // Filter list
  const currentList =
    activeTab === 'unassigned'
      ? unassignedReports
      : activeTab === 'assigned'
      ? assignedReports
      : reports;

  const filteredReports = currentList.filter((r) => {
    const matchesSearch =
      r.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.assigned_worker_name && r.assigned_worker_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedZone !== 'all') {
      if (!r.address.toLowerCase().includes(selectedZone.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleOpenAssignModal = (report: WasteReport) => {
    setAssignModalReport(report);
    // Find nearest worker to pre-select
    const candidateWorkers = availableWorkers.length > 0 ? availableWorkers : workers;
    const ranked = getRankedWorkersForReport(report, candidateWorkers);
    setSelectedWorkerId(report.assigned_worker_id || ranked[0]?.worker.id || workers[0]?.id || '');
  };

  const handleAssignNearestWorker = (report: WasteReport) => {
    const candidateWorkers = availableWorkers.length > 0 ? availableWorkers : workers;
    const ranked = getRankedWorkersForReport(report, candidateWorkers);
    if (ranked.length > 0) {
      const nearest = ranked[0];
      assignWorkerToReport(report.id, nearest.worker.id);
      setDispatchSuccessMsg(
        `⚡ Assigned Nearest Squad: ${report.complaint_number} dispatched to ${nearest.worker.name} (${nearest.distance} km away via GPS)`
      );
      setTimeout(() => setDispatchSuccessMsg(null), 5000);
    }
  };

  const handleConfirmAssignment = () => {
    if (!assignModalReport || !selectedWorkerId) return;
    const isReassign = !!assignModalReport.assigned_worker_id;
    assignWorkerToReport(assignModalReport.id, selectedWorkerId);

    const workerObj = workers.find((w) => w.id === selectedWorkerId);
    setDispatchSuccessMsg(
      `${isReassign ? 'Reassigned' : 'Assigned'} ${assignModalReport.complaint_number} to ${
        workerObj?.name || 'Sanitation Worker'
      }`
    );
    setTimeout(() => setDispatchSuccessMsg(null), 4000);

    setAssignModalReport(null);
    setSelectedWorkerId('');
  };

  // Smart Auto-Dispatch: pair unassigned complaints with workers by GPS proximity
  const handleSmartAutoDispatch = () => {
    if (unassignedReports.length === 0) {
      alert('All active complaints are currently assigned to squads!');
      return;
    }

    let assignedCount = 0;
    const candidateWorkers = availableWorkers.length > 0 ? availableWorkers : workers;

    unassignedReports.forEach((rep) => {
      const ranked = getRankedWorkersForReport(rep, candidateWorkers);
      if (ranked.length > 0) {
        const nearest = ranked[0];
        assignWorkerToReport(rep.id, nearest.worker.id);
        assignedCount++;
      }
    });

    setDispatchSuccessMsg(
      `Smart Auto-Dispatch: Automatically assigned ${assignedCount} complaints to their nearest sanitation workers via GPS proximity!`
    );
    setTimeout(() => setDispatchSuccessMsg(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              FIELD SQUAD OPERATIONS
            </span>
            <span className="text-xs text-slate-400">&bull; Live Fleet Dispatcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Sanitation Task Assignment & Reassignment</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Dispatch urgent municipal waste complaints to mobile crews, reassign overloaded workers, and track real-time field deployments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSmartAutoDispatch}
            disabled={unassignedReports.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
              unassignedReports.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>Smart Auto-Dispatch ({unassignedReports.length})</span>
          </button>
        </div>
      </div>

      {dispatchSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Dispatch</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{unassignedReports.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting crew assignment</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active In Field</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{assignedReports.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Assigned to sanitation squads</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Squad Availability</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {availableWorkers.length} / {workers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Crew members ready for assignment</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Avg Dispatch SLA</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">&lt; 15 mins</div>
          <p className="text-[11px] text-slate-400 mt-1">Automated dispatch compliance</p>
        </div>
      </div>

      {/* Main Grid: Left is Complaints to Dispatch / Reassign; Right is Sanitation Fleet Load */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs & Search */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('unassigned')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'unassigned'
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unassigned Queue ({unassignedReports.length})
                </button>
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'assigned'
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active & Reassignment ({assignedReports.length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({reports.length})
                </button>
              </div>

              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Wards / Zones</option>
                <option value="Central">Zone 1 - Central</option>
                <option value="North">Zone 2 - North</option>
                <option value="West">Zone 3 - West</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search complaint ID, location, description, or assigned worker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                No complaints found matching this criteria.
              </div>
            ) : (
              filteredReports.map((report) => {
                const isAssigned = !!report.assigned_worker_id;

                return (
                  <div
                    key={report.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={report.image_url}
                          alt={report.predicted_category}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-800">
                              {report.complaint_number}
                            </span>
                            <PriorityBadge priority={report.priority} />
                            <StatusBadge status={report.status} />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{report.description}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{report.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Action & Status */}
                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                        {isAssigned ? (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Assigned Crew:</span>
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <HardHat className="w-3.5 h-3.5 text-emerald-600" />
                              {report.assigned_worker_name || 'Sanitation Worker'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Unassigned
                          </span>
                        )}

                        {isAssigned ? (
                          <button
                            onClick={() => handleOpenAssignModal(report)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reassign Worker</span>
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(() => {
                              const candidateWorkers = availableWorkers.length > 0 ? availableWorkers : workers;
                              const nearestInfo = getRankedWorkersForReport(report, candidateWorkers)[0];
                              return (
                                <>
                                  {nearestInfo && (
                                    <button
                                      onClick={() => handleAssignNearestWorker(report)}
                                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                                      title={`Assign nearest available worker: ${nearestInfo.worker.name} (${nearestInfo.distance} km)`}
                                    >
                                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Assign Nearest ({nearestInfo.distance} km)</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleOpenAssignModal(report)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                                  >
                                    <Send className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Choose</span>
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Fleet Status Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Sanitation Squad Fleet</h3>
              </div>
              <Link
                href="/admin/workers"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <span>Manage Fleet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-[11px] text-slate-500">
              Real-time worker load distribution. Assign tasks to crews with fewer active commitments.
            </p>

            <div className="space-y-3">
              {workers.map((worker) => {
                return (
                  <div
                    key={worker.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-9 h-9 rounded-full object-cover border border-amber-500/50"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{worker.name}</h4>
                          <span className="text-[10px] text-slate-400">{worker.assigned_zone}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          worker.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/80">
                      <span className="text-slate-500">Active Tasks:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {worker.active_tasks_count} current / {worker.completed_tasks_count} done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment / Reassignment Modal */}
      {assignModalReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {assignModalReport.assigned_worker_id ? 'Reassign Sanitation Crew' : 'Assign Sanitation Crew'}
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">{assignModalReport.complaint_number}</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={assignModalReport.image_url}
                alt="Complaint preview"
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 line-clamp-1">{assignModalReport.description}</p>
                <p className="text-[11px] text-slate-500">{assignModalReport.address}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">{assignModalReport.predicted_category}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Crew (Sorted by Proximity):
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  GPS Proximity Match
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {getRankedWorkersForReport(assignModalReport, workers).map(({ worker, distance }, idx) => {
                  const isSelected = selectedWorkerId === worker.id;
                  const isNearest = idx === 0;
                  return (
                    <div
                      key={worker.id}
                      onClick={() => setSelectedWorkerId(worker.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : isNearest
                          ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900">{worker.name}</p>
                            {isNearest && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">
                                NEAREST
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{worker.assigned_zone}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-700 block">
                          {distance} km away
                        </span>
                        <span
                          className={`text-[9px] font-semibold ${
                            worker.status === 'Available' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {worker.status} ({worker.active_tasks_count} active)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmAssignment}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm Dispatch & Notify Worker
              </button>
              <button
                onClick={() => setAssignModalReport(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
