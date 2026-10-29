'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  WasteReport,
  WasteCategory,
  ALL_WASTE_CATEGORIES,
  ComplaintStatus,
  ComplaintPriority,
} from '@/lib/types';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Sparkles,
  HardHat,
  Eye,
  X,
  Check,
  RotateCcw,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

function AdminComplaintsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const {
    reports,
    workers,
    assignWorkerToReport,
    updateReportStatus,
    verifyReportCategory,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(initialId || '');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Modal inspection state
  const [inspectReport, setInspectReport] = useState<WasteReport | null>(null);

  // Modal edit states
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('Submitted');
  const [editPriority, setEditPriority] = useState<ComplaintPriority>('Medium');
  const [editCategory, setEditCategory] = useState<WasteCategory>('Plastic waste');
  const [editWorkerId, setEditWorkerId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialId) {
      const match = reports.find(
        (r) => r.complaint_number.toLowerCase() === initialId.toLowerCase()
      );
      if (match) {
        openInspection(match);
      }
    }
  }, [initialId, reports]);

  const openInspection = (report: WasteReport) => {
    setInspectReport(report);
    setEditStatus(report.status);
    setEditPriority(report.priority);
    setEditCategory(report.verified_category || report.predicted_category);
    setEditWorkerId(report.assigned_worker_id || '');
    setRejectionReason(report.rejection_reason || '');
    setSaveSuccess(false);
  };

  const handleSaveChanges = () => {
    if (!inspectReport) return;

    // 1. Verify category if changed
    if (editCategory !== inspectReport.verified_category) {
      verifyReportCategory(inspectReport.id, editCategory);
    }

    // 2. Worker assignment if changed
    if (editWorkerId && editWorkerId !== inspectReport.assigned_worker_id) {
      assignWorkerToReport(inspectReport.id, editWorkerId);
    }

    // 3. Status change
    if (editStatus !== inspectReport.status) {
      updateReportStatus(inspectReport.id, editStatus, rejectionReason);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setInspectReport(null);
    }, 900);
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: filteredReports }),
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

  // Filtered dataset
  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (filterPriority !== 'All' && r.priority !== filterPriority) return false;
    if (
      filterCategory !== 'All' &&
      r.predicted_category !== filterCategory &&
      r.verified_category !== filterCategory
    )
      return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNum = r.complaint_number.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchAddr = r.address.toLowerCase().includes(q);
      const matchCitizen = r.citizen_name.toLowerCase().includes(q);
      if (!matchNum && !matchDesc && !matchAddr && !matchCitizen) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Complaints Management & AI Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review citizen complaints, override AI predictions, assign sanitation workers, and manage resolution lifecycles.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Filtered CSV ({filteredReports.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search by ID, citizen, address, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Dropdown */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
        >
          <option value="All">All Priorities</option>
          <option value="Emergency">Emergency</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Category Dropdown */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
        >
          <option value="All">All Waste Categories</option>
          {ALL_WASTE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Complaints Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Complaint Details</th>
                <th className="py-3 px-3">AI Prediction & Verification</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Worker</th>
                <th className="py-3 px-3">Reported On</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.image_url}
                          alt={r.complaint_number}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="truncate max-w-[200px]">
                          <span className="font-bold text-slate-900 font-mono">
                            {r.complaint_number}
                          </span>
                          <p className="text-slate-600 truncate">{r.description}</p>
                          <p className="text-[10px] text-slate-400 truncate">{r.address}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div>
                        {r.verified_category ? (
                          <div className="flex items-center gap-1 text-emerald-800 font-bold">
                            <span>{r.verified_category}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-800">
                            {r.predicted_category}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          {r.ai_confidence}% AI Confidence
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <PriorityBadge priority={r.priority} />
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-700">
                        {r.assigned_worker_name || (
                          <span className="text-amber-600 italic">Unassigned</span>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openInspection(r)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        Inspect & Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Inspection & Administrative Edit Modal */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-slate-900">
                    {inspectReport.complaint_number}
                  </span>
                  <PriorityBadge priority={inspectReport.priority} />
                  <StatusBadge status={inspectReport.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reported by {inspectReport.citizen_name} ({inspectReport.citizen_phone || 'N/A'}) on{' '}
                  {new Date(inspectReport.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setInspectReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo & GPS preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700">Complaint Photograph</span>
                <div className="h-52 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={inspectReport.image_url}
                    alt={inspectReport.complaint_number}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800">Location & Coordinates</h4>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{inspectReport.address}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 bg-white p-2 rounded-lg border">
                  Latitude: {inspectReport.latitude} <br />
                  Longitude: {inspectReport.longitude}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${inspectReport.latitude},${inspectReport.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline text-[11px]"
                >
                  <span>Open in External Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* AI Review & Manual Override Section */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide">
                    AI Vision Prediction Review
                  </h4>
                </div>
                <span className="text-xs font-bold text-emerald-800">
                  {inspectReport.ai_confidence}% AI Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    AI Predicted:
                  </label>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800">
                    {inspectReport.predicted_category}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Administrator Verified Category (Manual Override):
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as WasteCategory)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ALL_WASTE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {inspectReport.ai_details?.disposal_instructions && (
                <p className="text-[11px] text-emerald-800 italic">
                  Advice: {inspectReport.ai_details.disposal_instructions}
                </p>
              )}
            </div>

            {/* Administrative Status, Worker & Priority Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as ComplaintPriority)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              {/* Assigned Worker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Sanitation Worker (Sorted by Nearest)
                </label>
                <select
                  value={editWorkerId}
                  onChange={(e) => setEditWorkerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {workers
                    .slice()
                    .sort((a, b) => {
                      if (!inspectReport) return 0;
                      const aLat = a.current_latitude ?? 19.076;
                      const aLon = a.current_longitude ?? 72.877;
                      const bLat = b.current_latitude ?? 19.076;
                      const bLon = b.current_longitude ?? 72.877;
                      const distA = Math.hypot(inspectReport.latitude - aLat, inspectReport.longitude - aLon);
                      const distB = Math.hypot(inspectReport.latitude - bLat, inspectReport.longitude - bLon);
                      return distA - distB;
                    })
                    .map((w, idx) => {
                      let distKm = 0;
                      if (inspectReport) {
                        const wLat = w.current_latitude ?? 19.076;
                        const wLon = w.current_longitude ?? 72.877;
                        const dLat = ((wLat - inspectReport.latitude) * Math.PI) / 180;
                        const dLon = ((wLon - inspectReport.longitude) * Math.PI) / 180;
                        const aVal =
                          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos((inspectReport.latitude * Math.PI) / 180) *
                            Math.cos((wLat * Math.PI) / 180) *
                            Math.sin(dLon / 2) *
                            Math.sin(dLon / 2);
                        distKm = Number((6371 * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))).toFixed(2));
                      }
                      return (
                        <option key={w.id} value={w.id}>
                          {idx === 0 ? '⚡ ' : ''}{w.name} ({distKm} km away{idx === 0 ? ' - NEAREST' : ''}) • {w.active_tasks_count} active tasks
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            {/* Rejection Reason if Rejected */}
            {editStatus === 'Rejected' && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                <label className="block text-xs font-bold text-rose-900">
                  Rejection Justification *
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this complaint was rejected..."
                  className="w-full p-2.5 rounded-xl border border-rose-300 text-xs bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Save Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Changes saved and audit log created!</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Updates trigger citizen & worker notifications.
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Save & Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminComplaintsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading complaints...</div>}>
      <AdminComplaintsContent />
    </Suspense>
  );
}
