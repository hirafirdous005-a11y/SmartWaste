'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  showSubtitle?: boolean;
  clickable?: boolean;
  href?: string;
  className?: string;
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showSubtitle = true,
  clickable = true,
  href = '/',
  className = '',
  textColor = 'text-slate-900',
}) => {
  const sizeMap = {
    sm: {
      iconSize: 'w-8 h-8',
      titleSize: 'text-sm font-bold',
      subSize: 'text-[9px]',
      gap: 'gap-2',
      badge: false,
    },
    md: {
      iconSize: 'w-10 h-10',
      titleSize: 'text-base sm:text-lg font-extrabold',
      subSize: 'text-[10px]',
      gap: 'gap-2.5',
      badge: true,
    },
    lg: {
      iconSize: 'w-14 h-14',
      titleSize: 'text-xl sm:text-2xl font-black',
      subSize: 'text-xs',
      gap: 'gap-3.5',
      badge: true,
    },
    xl: {
      iconSize: 'w-20 h-20',
      titleSize: 'text-2xl sm:text-4xl font-black',
      subSize: 'text-xs sm:text-sm',
      gap: 'gap-4',
      badge: true,
    },
  };

  const current = sizeMap[size];

  const isVertical = layout === 'vertical';

  const content = (
    <div
      className={`inline-flex ${
        isVertical ? 'flex-col items-center text-center' : 'items-center text-left'
      } ${current.gap} group select-none ${className}`}
    >
      {/* High-Tech Custom SVG Icon Badge */}
      <div className={`relative ${current.iconSize} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`bl-bg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id={`bl-bin-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id={`bl-pulse-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient id={`bl-leaf-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Hex-Square Container */}
          <rect x="8" y="8" width="104" height="104" rx="26" fill={`url(#bl-bg-${size})`} />
          <rect
            x="12"
            y="12"
            width="96"
            height="96"
            rx="22"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="2"
            fill="none"
          />

          {/* Smart Bin Receptacle */}
          <path
            d="M42 50 L46 88 C46.5 92 50 95 54 95 L66 95 C70 95 73.5 92 74 88 L78 50 Z"
            fill={`url(#bl-bin-${size})`}
          />
          <rect x="38" y="44" width="44" height="6" rx="3" fill="#ffffff" />
          <rect x="52" y="39" width="16" height="5" rx="2.5" fill="#ffffff" opacity="0.9" />

          {/* Telemetry Fill Indicator Bars */}
          <line x1="50" y1="62" x2="70" y2="62" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="52" y1="72" x2="68" y2="72" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="54" y1="82" x2="66" y2="82" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />

          {/* Sensor Center Node */}
          <circle cx="60" cy="41.5" r="2.2" fill="#10b981" />

          {/* Radar / IoT Sensor Waves */}
          <path
            d="M52 33 C56 30 64 30 68 33"
            stroke={`url(#bl-pulse-${size})`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M46 27 C53 22 67 22 74 27"
            stroke={`url(#bl-pulse-${size})`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M40 21 C51 14 69 14 80 21"
            stroke={`url(#bl-pulse-${size})`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* Sustainable Eco-Leaf Accent */}
          <path
            d="M74 58 C86 54 94 66 90 78 C86 89 74 88 74 88 C74 88 77 78 72 72 C68 67 74 58 74 58 Z"
            fill={`url(#bl-leaf-${size})`}
          />
          <path
            d="M74 88 C77 78 82 72 88 66"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
            fill="none"
          />

          {/* Real-time Status Pulsing Dot */}
          <circle cx="98" cy="22" r="7" fill="#10b981" />
          <circle cx="98" cy="22" r="3.5" fill="#ffffff" />
        </svg>

        {/* CSS ping effect over the beacon */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
        </span>
      </div>

      {/* Brand Typography */}
      <div className={`leading-tight ${isVertical ? 'text-center' : 'text-left'}`}>
        <div className={`flex items-center gap-1.5 flex-wrap ${isVertical ? 'justify-center' : 'justify-start'}`}>
          <span className={`${current.titleSize} ${textColor} tracking-tight font-black`}>
            Smart Waste{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Monitoring System
            </span>
          </span>
          {current.badge && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 tracking-wider uppercase border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI &bull; GPS
            </span>
          )}
        </div>
        {showSubtitle && (
          <p className={`${current.subSize} font-medium text-slate-500 tracking-normal`}>
            Intelligent Municipal Sanitation &amp; Waste Management
          </p>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
};
