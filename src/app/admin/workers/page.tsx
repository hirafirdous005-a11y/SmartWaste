'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  HardHat,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ListTodo,
  UserPlus,
  X,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminWorkersPage() {
  const { workers, tasks, reports, addWorker, updateWorkerStatus } = useApp();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formZone, setFormZone] = useState('Central Ward 4');

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);
  const workerTasks = tasks.filter((t) => t.worker_id === selectedWorkerId);

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) return;

    addWorker({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      assigned_zone: formZone,
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            CREW OPERATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Sanitation Workers & Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor frontline workforce availability, active task workloads, zone assignments, and performance ratings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Crew Member</span>
        </button>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workers.map((worker) => {
          const isSelected = selectedWorkerId === worker.id;
          return (
            <div
              key={worker.id}
              className={`p-6 rounded-3xl bg-white border transition-all space-y-4 shadow-xs hover:shadow-lg ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{worker.name}</h3>
                    <p className="text-xs text-slate-500">{worker.assigned_zone}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{worker.rating}</span>
                      <span className="text-slate-400 text-[10px] font-normal">(Rating)</span>
                    </div>
                  </div>
                </div>

                {/* Inline Status Selector */}
                <select
                  value={worker.status}
                  onChange={(e) =>
                    updateWorkerStatus(
                      worker.id,
                      e.target.value as 'Available' | 'On Task' | 'Off Duty'
                    )
                  }
                  className={`px-2 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer outline-none ${
                    worker.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : worker.status === 'On Task'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <option value="Available">Available</option>
                  <option value="On Task">On Task</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>

              {/* Workload Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Tasks</p>
                  <p className="text-lg font-black text-slate-900">{worker.active_tasks_count}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Completed</p>
                  <p className="text-lg font-black text-emerald-600">
                    {worker.completed_tasks_count}
                  </p>
                </div>
              </div>

              {/* Contact info & vehicle */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{worker.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{worker.email}</span>
                </div>
                {worker.vehicle_number && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fleet: {worker.vehicle_number}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedWorkerId(isSelected ? null : worker.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{isSelected ? 'Hide Assigned Route' : 'View Assigned Route'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Worker Task Route Inspection */}
      {selectedWorker && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Active Assignments for {selectedWorker.name}
              </h3>
              <p className="text-xs text-slate-500">
                Current tasks dispatched to this worker in {selectedWorker.assigned_zone}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {workerTasks.length} Tasks Recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {workerTasks.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">
                No tasks currently recorded for this worker.
              </p>
            ) : (
              workerTasks.map((t) => {
                const rep = reports.find((r) => r.id === t.report_id);
                return (
                  <div
                    key={t.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold font-mono text-slate-900">
                        {rep?.complaint_number || t.id}
                      </span>
                      <p className="text-slate-600">{rep?.description}</p>
                      <p className="text-[11px] text-slate-400">{rep?.address}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        {t.task_status}
                      </span>
                      <Link
                        href={`/admin/complaints?id=${rep?.complaint_number}`}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-[11px] text-slate-700"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Register Sanitation Worker</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.patil@smartwaste.gov"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98200 12345"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Operational Zone</label>
                <select
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="Central Ward 4">Central Ward 4 (Downtown)</option>
                  <option value="West Zone">West Zone (Suburban)</option>
                  <option value="North Zone">North Zone (Industrial)</option>
                  <option value="East Zone">East Zone (Riverfront)</option>
                  <option value="South Zone">South Zone (Commercial)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
