'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { FileText, ShieldCheck, ArrowLeft, Clock, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Administrative Audit Log & Compliance Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable chronological ledger recording all supervisor actions, worker dispatches, AI overrides, and complaint status changes.
        </p>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Administrator</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Target ID</th>
                <th className="py-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{log.admin_name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-800 border">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-emerald-800">
                      {log.target_id}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
