import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  color?: 'emerald' | 'amber' | 'blue' | 'indigo' | 'rose' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  color = 'emerald',
  onClick,
}) => {
  const colorStyles = {
    emerald: {
      bar: 'from-emerald-500 to-teal-400',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-emerald-500/10',
      dot: 'bg-emerald-500',
    },
    amber: {
      bar: 'from-amber-500 to-orange-400',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-200/80 shadow-amber-500/10',
      dot: 'bg-amber-500',
    },
    blue: {
      bar: 'from-blue-500 to-cyan-400',
      iconBox: 'bg-blue-50 text-blue-600 border-blue-200/80 shadow-blue-500/10',
      dot: 'bg-blue-500',
    },
    indigo: {
      bar: 'from-indigo-500 to-purple-400',
      iconBox: 'bg-indigo-50 text-indigo-600 border-indigo-200/80 shadow-indigo-500/10',
      dot: 'bg-indigo-500',
    },
    rose: {
      bar: 'from-rose-500 to-pink-400',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-200/80 shadow-rose-500/10',
      dot: 'bg-rose-500',
    },
    slate: {
      bar: 'from-slate-700 to-slate-500',
      iconBox: 'bg-slate-100 text-slate-700 border-slate-200 shadow-slate-500/10',
      dot: 'bg-slate-500',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:border-emerald-300' : ''
      }`}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 bg-linear-to-r ${colorStyles.bar} opacity-90 group-hover:h-2 transition-all`}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${colorStyles.dot}`} />
            <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              {title}
            </p>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className={`p-3 rounded-2xl border shadow-md group-hover:scale-110 transition-transform duration-300 ${colorStyles.iconBox}`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="font-medium text-slate-500 text-[11px]">{subtitle}</span>
          {trend && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

