'use client';

import React from 'react';
import { WasteReport } from '@/lib/types';
import { CheckCircle2, Clock, Truck, ShieldAlert, XCircle } from 'lucide-react';

interface StatusDistributionChartProps {
  reports: WasteReport[];
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ reports }) => {
  const counts = {
    Submitted: reports.filter((r) => r.status === 'Submitted').length,
    'Under Review': reports.filter((r) => r.status === 'Under Review').length,
    Assigned: reports.filter((r) => r.status === 'Assigned').length,
    'In Progress': reports.filter((r) => r.status === 'In Progress').length,
    Resolved: reports.filter((r) => r.status === 'Resolved').length,
    Rejected: reports.filter((r) => r.status === 'Rejected').length,
  };

  const total = reports.length || 1;
  const resolutionRate = Math.round((counts.Resolved / total) * 100);

  const statuses = [
    { label: 'Submitted', count: counts.Submitted, color: 'bg-slate-400', icon: Clock },
    { label: 'Under Review', count: counts['Under Review'], color: 'bg-amber-500', icon: ShieldAlert },
    { label: 'Assigned', count: counts.Assigned, color: 'bg-blue-500', icon: Truck },
    { label: 'In Progress', count: counts['In Progress'], color: 'bg-indigo-500', icon: Clock },
    { label: 'Resolved', count: counts.Resolved, color: 'bg-emerald-600', icon: CheckCircle2 },
    { label: 'Rejected', count: counts.Rejected, color: 'bg-rose-500', icon: XCircle },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Complaint Resolution Funnel</h4>
          <p className="text-xs text-slate-500">Pipeline progression from citizen intake to verified clearance</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Clearance Rate</span>
          <div className="text-lg font-black text-emerald-600">{resolutionRate}%</div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {statuses.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          const Icon = item.icon;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {item.label}
                </span>
                <span className="font-semibold text-slate-900">
                  {item.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
