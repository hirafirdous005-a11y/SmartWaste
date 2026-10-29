'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Save,
  Bell,
  Sparkles,
  Camera,
  LogOut,
} from 'lucide-react';

export default function CitizenProfilePage() {
  const router = useRouter();
  const { currentUser, logoutUser, reports } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || 'Aarav Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98201 12345');
  const [zone, setZone] = useState(currentUser?.zone || 'Zone 1 - Central Ward');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const myReportsCount = reports.filter((r) => !currentUser || r.citizen_id === currentUser.id).length;
  const resolvedCount = reports.filter(
    (r) => (!currentUser || r.citizen_id === currentUser.id) && r.status === 'Resolved'
  ).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.full_name = fullName;
      currentUser.phone = phone;
      currentUser.zone = zone;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Citizen Portal
          </span>
          <span className="text-xs text-slate-400">&bull; Settings & Identity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Citizen Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, municipal zone preferences, and SMS / email notification alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Citizen Badge Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 text-center">
          <div className="relative inline-block mx-auto">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-500 shadow-md"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">
              ✓
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-base">{fullName}</h3>
            <p className="text-xs text-slate-500">{currentUser?.email || 'citizen@urban.eco'}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">
              Active Municipal Contributor
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Reports</p>
              <p className="text-lg font-black text-slate-900">{myReportsCount}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Resolved</p>
              <p className="text-lg font-black text-emerald-600">{resolvedCount}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logoutUser();
              router.push('/');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="md:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Personal Information</h3>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Phone</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Residential Zone / Ward</label>
              <div className="relative">
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Zone 1 - Central Ward">Zone 1 - Central Ward</option>
                  <option value="Zone 2 - North Sector">Zone 2 - North Sector</option>
                  <option value="Zone 3 - West Waterfront">Zone 3 - West Waterfront</option>
                  <option value="Zone 4 - Industrial East">Zone 4 - Industrial East</option>
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Notification Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={(e) => setNotifySms(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Receive SMS status updates when sanitation worker arrives</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send photographic cleaning completion proof to my email</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
