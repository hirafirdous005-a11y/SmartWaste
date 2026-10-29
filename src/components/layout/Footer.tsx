'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Shield, Sparkles, Database, Cpu, Heart } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export const Footer: React.FC = () => {
  const { isConfiguredWithSupabase } = useApp();

  return (
    <footer className="bg-white/85 backdrop-blur-xl text-slate-600 text-xs border-t border-slate-200/90 pb-16 lg:pb-0 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <BrandLogo size="sm" showSubtitle={false} />
            <p className="text-slate-500 text-xs leading-relaxed font-normal">
              GPS and Computer Vision powered municipal waste management platform connecting citizens, sanitation workers, and city administrators.
            </p>
          </div>

          {/* Portals */}
          <div>
            <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Role Portals
            </h5>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/citizen" className="hover:text-emerald-700 transition-colors">
                  Citizen Portal & Waste Reporting
                </Link>
              </li>
              <li>
                <Link href="/worker" className="hover:text-emerald-700 transition-colors">
                  Sanitation Worker Task Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-700 transition-colors">
                  Municipal Administrator Dashboard
                </Link>
              </li>
              <li>
                <Link href="/citizen/track" className="hover:text-emerald-700 transition-colors">
                  Live Complaint Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Connectivity */}
          <div>
            <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Platform Integration
            </h5>
            <ul className="space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Supabase Database:{' '}
                  <span className="text-emerald-700 font-bold">
                    {isConfiguredWithSupabase ? 'Active (Live)' : 'Local State Engine'}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Vision: Google Gemini & Neural Classifier</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>GPS Geolocation & OpenStreetMap</span>
              </li>
            </ul>
          </div>

          {/* Android Mobile Support */}
          <div>
            <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Mobile Accessibility
            </h5>
            <p className="text-slate-500 leading-relaxed mb-3">
              Optimized for Android smartphones and tablets with camera upload, GPS tracking, and responsive touch controls.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-800 text-[11px] font-bold">All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; 2026 Smart Waste Monitoring System. Built for cleaner, greener cities.
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="text-slate-600">Privacy Preserved GPS Reporting</span>
            <span>&bull;</span>
            <span className="text-slate-600">Automated AI Segregation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
