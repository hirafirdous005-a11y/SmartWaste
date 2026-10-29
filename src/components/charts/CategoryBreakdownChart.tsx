'use client';

import React, { useState } from 'react';
import { WasteReport, WasteCategory, ALL_WASTE_CATEGORIES } from '@/lib/types';

interface CategoryBreakdownChartProps {
  reports: WasteReport[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ reports }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Count by category
  const counts: Record<string, number> = {};
  ALL_WASTE_CATEGORIES.forEach((cat) => {
    counts[cat] = 0;
  });

  reports.forEach((r) => {
    const cat = r.verified_category || r.predicted_category;
    if (counts[cat] !== undefined) {
      counts[cat] += 1;
    } else {
      counts['Mixed waste'] = (counts['Mixed waste'] || 0) + 1;
    }
  });

  const total = reports.length || 1;
  const sortedCategories = ALL_WASTE_CATEGORIES.map((cat) => ({
    category: cat,
    count: counts[cat] || 0,
    percentage: Math.round(((counts[cat] || 0) / total) * 100),
  })).sort((a, b) => b.count - a.count);

  const colors = [
    '#059669', // emerald-600
    '#0d9488', // teal-600
    '#0284c7', // sky-600
    '#6366f1', // indigo-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#e11d48', // rose-600
    '#64748b', // slate-500
    '#10b981', // emerald-500
  ];

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Waste Category Distribution</h4>
          <p className="text-xs text-slate-500">Breakdown of reported waste types across all zones</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {reports.length} Total Reports
        </span>
      </div>

      {/* Progress Multi-Bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 p-0.5">
        {sortedCategories.map((item, idx) => {
          if (item.count === 0) return null;
          return (
            <div
              key={item.category}
              style={{
                width: `${Math.max(item.percentage, 3)}%`,
                backgroundColor: colors[idx % colors.length],
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-80 cursor-pointer"
              title={`${item.category}: ${item.count} (${item.percentage}%)`}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            />
          );
        })}
      </div>

      {/* Category Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {sortedCategories.slice(0, 6).map((item, idx) => (
          <div
            key={item.category}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
              hoveredCategory === item.category
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]'
                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="font-medium text-slate-800 truncate">{item.category}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-slate-900">{item.count}</span>
              <span className="text-slate-400 font-mono text-[11px]">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
