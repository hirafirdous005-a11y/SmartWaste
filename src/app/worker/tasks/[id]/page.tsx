'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  HardHat,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Upload,
  ArrowLeft,
  Check,
  Calendar,
  ExternalLink,
  Phone,
  User,
  Copy,
  Sparkles,
} from 'lucide-react';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import dynamic from 'next/dynamic';

const WorkerTaskMap = dynamic(
  () => import('@/components/map/WorkerTaskMap').then((mod) => mod.WorkerTaskMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-slate-100 rounded-3xl flex items-center justify-center text-xs text-slate-400">
        Loading Field GPS Navigation Map...
      </div>
    ),
  }
);

const SAMPLE_AFTER_PHOTOS = [
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
];

function WorkerTaskDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { tasks, reports, updateTaskProgress, reportTaskIssue } = useApp();

  // Find task by task.id or task.report_id or find report by report.id
  const task = tasks.find((t) => t.id === id || t.report_id === id);
  const report = reports.find((r) => r.id === (task ? task.report_id : id));

  const [afterPhoto, setAfterPhoto] = useState<string>(SAMPLE_AFTER_PHOTOS[0]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<
    'inaccessible' | 'wrong_gps' | 'insufficient_equipment' | 'hazardous_materials' | 'other'
  >('inaccessible');
  const [issueDescription, setIssueDescription] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Task or Complaint Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested task identification ({id}) does not exist in the municipal dispatch ledger.
        </p>
        <Link
          href="/worker"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Active Tasks</span>
        </Link>
      </div>
    );
  }

  const currentStatus = task?.task_status || 'Assigned';

  const handleNextStatus = () => {
    if (!task) return;
    if (currentStatus === 'Assigned') {
      updateTaskProgress(task.id, 'Accepted');
    } else if (currentStatus === 'Accepted') {
      updateTaskProgress(task.id, 'On the Way');
    } else if (currentStatus === 'On the Way') {
      updateTaskProgress(task.id, 'In Progress');
    }
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    updateTaskProgress(
      task.id,
      'Completed',
      completionNotes || 'Waste thoroughly cleared, sanitized, and disposed at municipal depot.',
      task.before_image || report.image_url,
      afterPhoto
    );
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !issueDescription.trim()) return;
    reportTaskIssue(task.id, issueType, issueDescription);
    setIsIssueModalOpen(false);
    setIssueDescription('');
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${report.latitude}, ${report.longitude}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const openGoogleMapsDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/worker"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Tasks</span>
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={report.priority} />
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Task Banner Header */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-700 via-amber-600 to-orange-700 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 uppercase tracking-widest">
                FIELD WORK ORDER
              </span>
              <span className="text-xs text-amber-100 font-mono">
                Assigned: {task ? new Date(task.assigned_at).toLocaleDateString() : 'Today'}
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1 font-mono">{report.complaint_number}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openGoogleMapsDirections}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-amber-800 font-extrabold text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span>GPS Turn-by-Turn Navigation</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
          {report.description}
        </p>
      </div>

      {/* Status Lifecycle Progress Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Lifecycle Progress:</span>
          <span className="text-amber-700 uppercase font-mono">{currentStatus}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
          <div
            className={`py-1.5 rounded-lg transition-colors ${
              ['Assigned', 'Accepted', 'On the Way', 'In Progress', 'Completed'].includes(currentStatus)
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            1. Assigned
          </div>
          <div
            className={`py-1.5 rounded-lg transition-colors ${
              ['Accepted', 'On the Way', 'In Progress', 'Completed'].includes(currentStatus)
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            2. Accepted
          </div>
          <div
            className={`py-1.5 rounded-lg transition-colors ${
              ['In Progress', 'Completed'].includes(currentStatus)
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            3. In Progress
          </div>
          <div
            className={`py-1.5 rounded-lg transition-colors ${
              currentStatus === 'Completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            4. Completed
          </div>
        </div>
      </div>

      {/* Grid: Left is Waste Details & Evidence; Right is GPS & Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Waste Evidence & Citizen Contact */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Waste Evidence & AI Analysis
            </h3>

            {/* Before Photo */}
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={report.image_url}
                alt={report.complaint_number}
                className="w-full h-56 object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/75 text-white font-mono text-[10px] font-bold">
                BEFORE (CITIZEN REPORT)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Predicted Waste Category</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{report.predicted_category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Waste Stream</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {report.ai_details?.wet_dry || 'Dry Recyclable'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Estimated Quantity</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{report.quantity}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">AI Confidence</span>
                <span className="font-bold text-indigo-600 mt-0.5 block">{report.ai_confidence || 88}%</span>
              </div>
            </div>

            {/* Citizen Contact */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{report.citizen_name}</p>
                  <p className="text-[10px] text-slate-500">Citizen Reporter</p>
                </div>
              </div>

              {report.citizen_phone && (
                <a
                  href={`tel:${report.citizen_phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Citizen</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: GPS Location & Field Map */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>GPS Location & Navigation</span>
              </h3>
              <button
                onClick={copyCoordinates}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCoords ? 'Copied!' : 'Copy GPS'}</span>
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 leading-snug">{report.address}</p>
              <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                Lat: {report.latitude.toFixed(6)}, Lng: {report.longitude.toFixed(6)}
              </p>
            </div>

            {/* Live Interactive Leaflet Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
              <WorkerTaskMap
                latitude={report.latitude}
                longitude={report.longitude}
                address={report.address}
                complaintNumber={report.complaint_number}
                priority={report.priority}
              />
            </div>

            <button
              onClick={openGoogleMapsDirections}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Navigation className="w-4 h-4 text-rose-400" />
              <span>Launch Live Google Maps Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Field Actions Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100">
          Field Dispatch Actions
        </h3>

        {currentStatus !== 'In Progress' && currentStatus !== 'Completed' ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleNextStatus}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {currentStatus === 'Assigned' && (
                <>
                  <Check className="w-5 h-5" />
                  <span>1. Acknowledge & Accept Task</span>
                </>
              )}
              {currentStatus === 'Accepted' && (
                <>
                  <Navigation className="w-5 h-5" />
                  <span>2. En Route to Location</span>
                </>
              )}
              {currentStatus === 'On the Way' && (
                <>
                  <HardHat className="w-5 h-5" />
                  <span>3. Arrived at Site & Begin Cleaning</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Route Obstacle</span>
            </button>
          </div>
        ) : currentStatus === 'In Progress' ? (
          /* Cleaning Completion Form */
          <form onSubmit={handleCompleteSubmit} className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Work in Progress &bull; Cleaning Underway
              </span>
              <p className="text-[11px] text-emerald-700">
                When finished, take or attach an &quot;After (Cleared)&quot; photo proof and submit notes to resolve the ticket.
              </p>
            </div>

            {/* Side-by-side Before and After upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Before Photo (Original Citizen Report):
                </label>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={task?.before_image || report.image_url}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[9px] font-bold rounded">
                    BEFORE
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  After Photo (Cleaning Verification Proof):
                </label>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-300">
                  <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded">
                    AFTER (CLEARED)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick After Photo Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                Select Camera Verification Proof (or upload):
              </span>
              <div className="flex gap-2">
                {SAMPLE_AFTER_PHOTOS.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAfterPhoto(img)}
                    className={`h-16 w-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      afterPhoto === img ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="Sample proof" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sanitation Completion Notes & Depot Destination:
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Cleared 35kg plastic and organic waste. Sprayed calcium hydroxide disinfectant. Transported to Central Ward Recycling Depot."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Submit Cleaned Proof & Complete Task</span>
              </button>

              <button
                type="button"
                onClick={() => setIsIssueModalOpen(true)}
                className="px-4 py-4 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Report Obstacle
              </button>
            </div>
          </form>
        ) : (
          /* Completed Banner */
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h4 className="font-extrabold text-base">Task Successfully Cleared & Resolved!</h4>
            </div>
            <p className="text-xs text-emerald-800">
              Completion notes: &quot;{task?.completion_notes || 'Waste cleared and sanitized.'}&quot;
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-32 rounded-xl overflow-hidden border">
                <img
                  src={task?.before_image || report.image_url}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-32 rounded-xl overflow-hidden border">
                <img
                  src={task?.after_image || SAMPLE_AFTER_PHOTOS[0]}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Obstacle / Issue Reporting Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-base text-slate-900">Report Route Obstacle</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">{report.complaint_number}</span>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Obstacle Nature:
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="inaccessible">Inaccessible Alley / Road Blockage</option>
                  <option value="wrong_gps">Incorrect GPS Coordinates / Location</option>
                  <option value="insufficient_equipment">Requires Heavy Machinery / JCB</option>
                  <option value="hazardous_materials">Toxic Biohazard / Medical Contaminant</option>
                  <option value="other">Other Unforeseen Field Obstacle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Obstacle Description for Dispatcher:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain field barrier so central dispatch can reassign or escalate..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit Flag to Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkerTaskDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
          Loading Task Details & Field Route...
        </div>
      }
    >
      <WorkerTaskDetailContent />
    </React.Suspense>
  );
}
