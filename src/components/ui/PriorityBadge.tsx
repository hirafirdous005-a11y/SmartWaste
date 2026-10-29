import React from 'react';
import { ComplaintPriority } from '@/lib/types';
import { AlertCircle, AlertTriangle, Clock, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  switch (priority) {
    case 'Emergency':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-xs animate-pulse">
          {showIcon && <Flame className="w-3 h-3" />}
          Emergency
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          {showIcon && <AlertTriangle className="w-3 h-3 text-orange-600" />}
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          {showIcon && <AlertCircle className="w-3 h-3 text-amber-500" />}
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {showIcon && <Clock className="w-3 h-3 text-slate-400" />}
          Low
        </span>
      );
    default:
      return null;
  }
};
