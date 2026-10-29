'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { WorkerTask, WorkerTaskStatus, WasteReport } from '@/lib/types';
import {
  HardHat,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Upload,
  ArrowRight,
  Flame,
  Check,
  ShieldAlert,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import dynamic from 'next/dynamic';

const WorkerTaskMap = dynamic(
  () => import('@/components/map/WorkerTaskMap').then((mod) => mod.WorkerTaskMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">
        Loading Task GPS Route...
      </div>
    ),
  }
);

// Sample After-Cleaning Photos for quick mobile proof upload
const SAMPLE_AFTER_PHOTOS = [
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
];

function WorkerContent() {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'active';

  const { currentUser, tasks, reports, updateTaskProgress, reportTaskIssue } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>(
    activeTabParam === 'history' ? 'history' : 'active'
  );

  // Modal states
  const [activeTaskModal, setActiveTaskModal] = useState<WorkerTask | null>(null);
  const [modalMode, setModalMode] = useState<'details' | 'proof' | 'issue'>('details');

  // Proof form states
  const [afterPhoto, setAfterPhoto] = useState<string>(SAMPLE_AFTER_PHOTOS[0]);
  const [completionNotes, setCompletionNotes] = useState('');

  // Issue reporting states
  const [issueType, setIssueType] = useState<
    'inaccessible' | 'wrong_gps' | 'insufficient_equipment' | 'hazardous_materials' | 'other'
  >('inaccessible');
  const [issueDescription, setIssueDescription] = useState('');

  // Tasks assigned to current worker
  const workerTasks = tasks.filter((t) => !currentUser || t.worker_id === currentUser.id);

  const activeTasks = workerTasks.filter((t) => t.task_status !== 'Completed');
  const completedTasks = workerTasks.filter((t) => t.task_status === 'Completed');

  const getReportForTask = (reportId: string): WasteReport | undefined => {
    return reports.find((r) => r.id === reportId);
  };

  // Status transition handler
  const handleNextStatus = (task: WorkerTask) => {
    if (task.task_status === 'Assigned') {
      updateTaskProgress(task.id, 'Accepted');
    } else if (task.task_status === 'Accepted') {
      updateTaskProgress(task.id, 'On the Way');
    } else if (task.task_status === 'On the Way') {
      updateTaskProgress(task.id, 'In Progress');
    } else if (task.task_status === 'In Progress') {
      // Open proof modal for completion
      setActiveTaskModal(task);
      setModalMode('proof');
    }
  };

  const handleCompleteSubmit = () => {
    if (!activeTaskModal) return;
    updateTaskProgress(
      activeTaskModal.id,
      'Completed',
      completionNotes || 'Waste cleared, sanitized, and disposed at municipal depot.',
      activeTaskModal.before_image || undefined,
      afterPhoto
    );
    setActiveTaskModal(null);
    setCompletionNotes('');
  };

  const handleIssueSubmit = () => {
    if (!activeTaskModal || !issueDescription.trim()) return;
    reportTaskIssue(activeTaskModal.id, issueType, issueDescription);
    setActiveTaskModal(null);
    setIssueDescription('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Mobile-Friendly Worker Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-amber-950 via-slate-900 to-orange-950 text-white shadow-2xl border border-amber-800/40 space-y-4">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              SANITATION CREW
            </span>
            <span className="text-xs text-slate-400 font-mono">&bull; Zone 1 Central</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-slate-950 shadow-md">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
            On Duty &bull; GPS Active
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            {currentUser?.full_name || 'Sanitation Worker'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal">
            You have <span className="font-black text-amber-400">{activeTasks.length} active collection tasks</span> assigned to your squad today.
          </p>
        </div>

        {/* Tab switcher: Active vs History */}
        <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Completed History ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {activeTab === 'active' ? (
          activeTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">All Caught Up!</h3>
              <p className="text-xs text-slate-500">
                No pending collection tasks currently assigned to your route.
              </p>
            </div>
          ) : (
            activeTasks.map((task) => {
              const report = getReportForTask(task.report_id);
              if (!report) return null;

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-amber-300 transition-all"
                >
                  {/* Task Header: ID, Priority, Stream */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-slate-900">
                          {report.complaint_number}
                        </span>
                        <PriorityBadge priority={report.priority} />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 mt-0.5 inline-block">
                        {report.predicted_category} &bull; {report.quantity}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {task.task_status}
                    </span>
                  </div>

                  {/* Waste Photograph Preview & Description */}
                  <div className="flex gap-3 items-start">
                    <img
                      src={report.image_url}
                      alt={report.complaint_number}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-700 leading-snug line-clamp-2">{report.description}</p>
                      <div className="flex items-center gap-1 text-slate-500 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-xs">{report.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* GPS Interactive Map Box */}
                  <WorkerTaskMap
                    latitude={report.latitude}
                    longitude={report.longitude}
                    address={report.address}
                    complaintNumber={report.complaint_number}
                    priority={report.priority}
                  />

                  {/* Status Progression Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                    {/* Primary Status Step Button */}
                    <button
                      onClick={() => handleNextStatus(task)}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      {task.task_status === 'Assigned' && (
                        <>
                          <Check className="w-4 h-4" />
                          <span>1. Acknowledge & Accept Task</span>
                        </>
                      )}
                      {task.task_status === 'Accepted' && (
                        <>
                          <Navigation className="w-4 h-4" />
                          <span>2. Start Route (On the Way)</span>
                        </>
                      )}
                      {task.task_status === 'On the Way' && (
                        <>
                          <HardHat className="w-4 h-4" />
                          <span>3. Arrived On-Site (Start Cleaning)</span>
                        </>
                      )}
                      {task.task_status === 'In Progress' && (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>4. Upload Before/After Proof & Complete</span>
                        </>
                      )}
                    </button>

                    {/* View Full Task Details & Navigation */}
                    <Link
                      href={`/worker/tasks/${task.id}`}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Details & GPS</span>
                    </Link>

                    {/* Report Obstacle Button */}
                    <button
                      onClick={() => {
                        setActiveTaskModal(task);
                        setModalMode('issue');
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Obstacle</span>
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Task History Tab */
          completedTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              No completed tasks in history yet.
            </div>
          ) : (
            completedTasks.map((task) => {
              const report = getReportForTask(task.report_id);
              if (!report) return null;

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {report.complaint_number}
                      </span>
                      <p className="text-[11px] text-slate-500">{report.address}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  </div>

                  {/* Before / After photo proof */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="relative h-28 rounded-xl overflow-hidden border">
                      <img
                        src={task.before_image || report.image_url}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                        BEFORE
                      </span>
                    </div>

                    <div className="relative h-28 rounded-xl overflow-hidden border">
                      <img
                        src={task.after_image || SAMPLE_AFTER_PHOTOS[0]}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">
                        AFTER (CLEARED)
                      </span>
                    </div>
                  </div>

                  {task.completion_notes && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                      &quot;{task.completion_notes}&quot;
                    </p>
                  )}
                </div>
              );
            })
          )
        )}
      </div>

      {/* Completion & Proof Modal */}
      {activeTaskModal && modalMode === 'proof' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Submit Cleaning Proof & Completion
              </h3>
              <span className="font-mono text-xs text-slate-500">
                {getReportForTask(activeTaskModal.report_id)?.complaint_number}
              </span>
            </div>

            {/* Before vs After comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600">Initial State (Before)</span>
                <div className="h-28 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={activeTaskModal.before_image || getReportForTask(activeTaskModal.report_id)?.image_url}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600">Cleaned Area (After)</span>
                <div className="h-28 rounded-xl overflow-hidden border border-emerald-300 ring-2 ring-emerald-500/30">
                  <img
                    src={afterPhoto}
                    alt="After proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Choose or upload after photo */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                Select cleaned photograph proof:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_AFTER_PHOTOS.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAfterPhoto(url)}
                    className={`h-16 rounded-xl overflow-hidden border transition-all ${
                      afterPhoto === url ? 'ring-2 ring-emerald-500 border-emerald-500' : 'opacity-70'
                    }`}
                  >
                    <img src={url} alt={`Proof ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Field Completion Notes
              </label>
              <textarea
                rows={2}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="E.g. Cleared 4 bags of plastic waste, swept curb, and sprayed sanitizer..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Submit Cleaning Proof & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Obstacle / Issue Reporting Modal */}
      {activeTaskModal && modalMode === 'issue' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Report Field Obstacle / Delay</span>
            </h3>

            <p className="text-xs text-slate-500">
              Notify the municipal dispatcher if you encounter roadblocks, wrong GPS coordinates, or hazards.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Obstacle Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="inaccessible">Site Inaccessible (Locked gate / flooded)</option>
                  <option value="wrong_gps">Incorrect GPS Coordinates / Wrong Address</option>
                  <option value="insufficient_equipment">Insufficient Equipment (Need JCB / Tipper)</option>
                  <option value="hazardous_materials">Biohazard / Toxic Material Encountered</option>
                  <option value="other">Other Field Hindrance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details</label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Provide precise details for the admin coordinator..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueSubmit}
                disabled={!issueDescription.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 disabled:opacity-50"
              >
                Report to Dispatcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkerPortalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading worker dashboard...</div>}>
      <WorkerContent />
    </Suspense>
  );
}
