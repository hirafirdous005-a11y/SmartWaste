'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  ListTodo,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Camera,
  PlusCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

export default function CitizenComplaintsPage() {
  const { currentUser, reports } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter complaints filed by this citizen
  const myReports = reports.filter(
    (r) => !currentUser || r.citizen_id === currentUser.id
  );

  const filteredReports = myReports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = r.complaint_number.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchAddr = r.address.toLowerCase().includes(q);
      const matchCat = r.predicted_category.toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchAddr && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-400">&bull; Complaint Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            My Waste Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all garbage reports you have filed, inspect photographs, and check real-time resolution status.
          </p>
        </div>

        <Link
          href="/citizen/report"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Waste</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by Complaint ID, category, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
        >
          <option value="All">All Statuses ({myReports.length})</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Complaints Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-3">
          <Camera className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No Complaints Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'No complaints match your active search filters.'
              : 'You have not reported any waste dumping yet.'}
          </p>
          <Link
            href="/citizen/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Report Waste Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((r) => (
            <div
              key={r.id}
              className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-emerald-500 to-teal-400 group-hover:h-2 transition-all" />

              <div className="space-y-3 pt-1">
                {/* Photo Thumbnail */}
                <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group-hover:shadow-md transition-shadow">
                  <img
                    src={r.image_url}
                    alt={r.complaint_number}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-950/85 text-white backdrop-blur-md border border-white/20 shadow-md">
                      {r.complaint_number}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <PriorityBadge priority={r.priority} />
                  </div>
                </div>

                {/* Status & Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{r.predicted_category}</span>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {r.description}
                </p>

                {/* Address & Date */}
                <div className="space-y-1.5 text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate font-medium text-slate-600">{r.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/citizen/track?id=${r.complaint_number}`}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 group-hover:bg-linear-to-r group-hover:from-emerald-600 group-hover:to-teal-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>Track Full Progress Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
