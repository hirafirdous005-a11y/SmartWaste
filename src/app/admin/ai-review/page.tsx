'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ALL_WASTE_CATEGORIES, WasteCategory, WasteReport } from '@/lib/types';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Info,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminAiReviewPage() {
  const { reports, verifyReportCategory } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'unverified' | 'verified' | 'low_confidence'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReportForZoom, setSelectedReportForZoom] = useState<WasteReport | null>(null);
  const [overrideModalReport, setOverrideModalReport] = useState<WasteReport | null>(null);
  const [selectedOverrideCategory, setSelectedOverrideCategory] = useState<WasteCategory>('Mixed waste');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Compute AI Statistics
  const totalReportsWithAI = reports.length;
  const verifiedReports = reports.filter((r) => r.verified_category !== null);
  const unverifiedReports = reports.filter((r) => r.verified_category === null);
  const lowConfidenceReports = reports.filter((r) => (r.ai_confidence || 85) < 85);
  const averageConfidence = Math.round(
    reports.reduce((acc, r) => acc + (r.ai_confidence || 85), 0) / (reports.length || 1)
  );

  // Filter reports
  const filteredReports = reports.filter((r) => {
    // Search
    const matchesSearch =
      r.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.predicted_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // State filter
    if (filterState === 'unverified' && r.verified_category !== null) return false;
    if (filterState === 'verified' && r.verified_category === null) return false;
    if (filterState === 'low_confidence' && (r.ai_confidence || 85) >= 85) return false;

    // Category filter
    if (categoryFilter !== 'all' && r.predicted_category !== categoryFilter) return false;

    return true;
  });

  // Fast single approve
  const handleApprove = (report: WasteReport) => {
    verifyReportCategory(report.id, report.predicted_category);
  };

  // Open override modal
  const handleOpenOverride = (report: WasteReport) => {
    setOverrideModalReport(report);
    setSelectedOverrideCategory(report.predicted_category);
  };

  // Submit override
  const handleSaveOverride = () => {
    if (!overrideModalReport) return;
    verifyReportCategory(overrideModalReport.id, selectedOverrideCategory);
    setOverrideModalReport(null);
  };

  // Bulk approve high confidence (>85%)
  const handleBulkApprove = () => {
    const candidates = unverifiedReports.filter((r) => (r.ai_confidence || 85) >= 85);
    candidates.forEach((r) => {
      verifyReportCategory(r.id, r.predicted_category);
    });
    setBulkSuccessMsg(`Batch processed: ${candidates.length} high-confidence classifications approved!`);
    setTimeout(() => setBulkSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI MODEL GOVERNANCE
            </span>
            <span className="text-xs text-slate-400">&bull; Gemini 1.5 Flash Vision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">AI Classification Review & Verification</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Human-in-the-loop audit console for machine-predicted waste categories, wet/dry waste separation, and hazard ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Bulk Verify High-Confidence ({unverifiedReports.filter((r) => (r.ai_confidence || 85) >= 85).length})</span>
          </button>
        </div>
      </div>

      {bulkSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{bulkSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Scanned</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalReportsWithAI}</div>
          <p className="text-[11px] text-slate-400 mt-1">100% evaluated with AI vision</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Officer Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{verifiedReports.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {Math.round((verifiedReports.length / (totalReportsWithAI || 1)) * 100)}% verified by administration
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{unverifiedReports.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting municipal officer confirmation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Avg AI Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{averageConfidence}%</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {lowConfidenceReports.length} flagged low confidence (&lt;85%)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search complaint ID, category, location, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilterState('unverified')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'unverified'
                  ? 'bg-white text-amber-700 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Unverified ({unverifiedReports.length})
            </button>
            <button
              onClick={() => setFilterState('verified')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'verified'
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Verified ({verifiedReports.length})
            </button>
            <button
              onClick={() => setFilterState('low_confidence')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterState === 'low_confidence'
                  ? 'bg-white text-rose-700 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Low Confidence ({lowConfidenceReports.length})
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {ALL_WASTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">No waste classifications matched the active filter.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const confidence = report.ai_confidence || 88;
            const isVerified = report.verified_category !== null;
            const isOverridden = isVerified && report.verified_category !== report.predicted_category;

            return (
              <div
                key={report.id}
                className={`p-5 rounded-3xl bg-white border transition-all ${
                  isOverridden
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : isVerified
                    ? 'border-emerald-200'
                    : confidence < 85
                    ? 'border-amber-300 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left: Thumbnail & Core Details */}
                  <div className="flex items-start gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={report.image_url}
                        alt={report.predicted_category}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-2xs group-hover:opacity-90 transition-opacity"
                      />
                      <button
                        onClick={() => setSelectedReportForZoom(report)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        title="Click to Zoom Image"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {report.complaint_number}
                        </span>
                        <PriorityBadge priority={report.priority} />
                        <StatusBadge status={report.status} />

                        {isOverridden ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Category Overridden
                          </span>
                        ) : isVerified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Verified Accurate
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Officer Review
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {report.description}
                      </h3>

                      <p className="text-xs text-slate-500">
                        Location: <span className="text-slate-700 font-medium">{report.address}</span>
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          Reported by: {report.citizen_name}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500">
                          {new Date(report.created_at).toLocaleDateString()} at{' '}
                          {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: AI Prediction Breakdown */}
                  <div className="lg:w-72 w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        AI Prediction:
                      </span>
                      <span className="font-bold text-slate-900">{report.predicted_category}</span>
                    </div>

                    {/* Confidence Meter */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Model Confidence</span>
                        <span
                          className={`font-mono font-bold ${
                            confidence >= 90
                              ? 'text-emerald-600'
                              : confidence >= 80
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            confidence >= 90
                              ? 'bg-emerald-500'
                              : confidence >= 80
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Waste Stream:</span>
                      <span className="font-bold text-slate-700">
                        {report.ai_details?.wet_dry || 'Dry Recyclable'}
                      </span>
                    </div>

                    {report.verified_category && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Final Verification:</span>
                        <span className="font-bold text-emerald-700">
                          {report.verified_category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex lg:flex-col items-center gap-2 w-full lg:w-44 shrink-0">
                    <button
                      onClick={() => handleApprove(report)}
                      disabled={isVerified && !isOverridden}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isVerified && !isOverridden
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer active:scale-95'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isVerified ? 'Re-Approve AI' : 'Approve AI'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenOverride(report)}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Manual Override</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Override Modal */}
      {overrideModalReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Override AI Classification</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">{overrideModalReport.complaint_number}</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={overrideModalReport.image_url}
                alt="Waste preview"
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="text-xs">
                <p className="text-slate-500">AI Model Predicted:</p>
                <p className="font-bold text-slate-900">{overrideModalReport.predicted_category}</p>
                <p className="text-[11px] text-slate-400">Confidence: {overrideModalReport.ai_confidence || 88}%</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Select Correct Municipal Waste Category:
              </label>
              <select
                value={selectedOverrideCategory}
                onChange={(e) => setSelectedOverrideCategory(e.target.value as WasteCategory)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {ALL_WASTE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This action will update the official classification across all dispatch routes and record an administrative audit entry with your officer ID.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveOverride}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Category Override
              </button>
              <button
                onClick={() => setOverrideModalReport(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedReportForZoom && (
        <div
          onClick={() => setSelectedReportForZoom(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full p-6 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-4 cursor-default animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{selectedReportForZoom.complaint_number}</h3>
                <p className="text-xs text-slate-400">{selectedReportForZoom.address}</p>
              </div>
              <button
                onClick={() => setSelectedReportForZoom(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg bg-slate-800"
              >
                Close &times;
              </button>
            </div>

            <img
              src={selectedReportForZoom.image_url}
              alt="High-resolution waste photo"
              className="w-full h-80 object-cover rounded-2xl border border-slate-800"
            />

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Predicted Category:</span>
                <span className="font-bold text-emerald-400">{selectedReportForZoom.predicted_category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AI Confidence:</span>
                <span className="font-mono text-indigo-300 font-bold">{selectedReportForZoom.ai_confidence || 88}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Description:</span>
                <span className="text-slate-200">{selectedReportForZoom.description}</span>
              </div>
              {selectedReportForZoom.ai_details?.disposal_instructions && (
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Disposal Guidance:</span>
                  <p className="text-slate-300 italic">{selectedReportForZoom.ai_details.disposal_instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
