'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HardHat,
  Filter,
} from 'lucide-react';

export default function CitizenNotificationsPage() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filter for this citizen
  const userNotifications = notifications.filter(
    (n) => !currentUser || n.recipient_id === currentUser.id
  );

  const displayedNotifs = userNotifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = userNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-400">&bull; Notification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated with live dispatch status, worker arrival times, and resolution confirmations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors self-start sm:self-center"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({userNotifications.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayedNotifs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-700 text-sm">No Notifications</h3>
            <p className="text-xs text-slate-400">
              {filter === 'unread' ? 'You have read all your alerts!' : 'No notifications recorded yet.'}
            </p>
          </div>
        ) : (
          displayedNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.is_read
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'assignment'
                      ? 'bg-amber-100 text-amber-700'
                      : n.type === 'completion'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {n.type === 'assignment' && <HardHat className="w-5 h-5" />}
                  {n.type === 'completion' && <Check className="w-5 h-5" />}
                  {n.type !== 'assignment' && n.type !== 'completion' && <Bell className="w-5 h-5" />}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed max-w-xl">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.report_id && (
                <Link
                  href={`/citizen/track?id=${n.report_id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold self-end sm:self-center transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
