'use client';

import React from 'react';
import { AIClassificationResult } from '@/lib/types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Recycle,
  HelpCircle,
  ShieldAlert,
  Info,
  Droplets,
  Layers,
} from 'lucide-react';

interface WasteClassifierCardProps {
  result: AIClassificationResult | null;
  isLoading: boolean;
  error?: string | null;
  modelSource?: string | null;
  onRunAnalysis?: () => void;
  showActions?: boolean;
}

export const WasteClassifierCard: React.FC<WasteClassifierCardProps> = ({
  result,
  isLoading,
  error,
  modelSource,
  onRunAnalysis,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 animate-pulse text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Analyzing Waste Imagery with AI Vision Model...</span>
        </div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Detecting polymer resins, organic matter, recyclable fibers, and municipal hazard indicators.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/70 text-left space-y-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-900">AI Classification Status</h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>

        {showActions && onRunAnalysis && (
          <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
            <span className="text-[11px] text-rose-600">Want to run preview model?</span>
            <button
              type="button"
              onClick={onRunAnalysis}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Run Demo Heuristic Model
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 text-center space-y-2">
        <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
        <h4 className="font-semibold text-xs text-slate-700">AI Waste Analysis Pending</h4>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
          Upload or capture a waste photograph above to analyze its material classification and disposal guidelines.
        </p>
      </div>
    );
  }

  const confidenceScore = result.confidence || 0;
  const isHighConfidence = confidenceScore >= 80;

  return (
    <div className="p-5 rounded-2xl border border-emerald-300/80 bg-linear-to-br from-emerald-50/70 via-white to-slate-50 shadow-xs space-y-4">
      {/* Header & Category */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Classification Prediction</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            {result.predicted_category}
            {result.needs_review && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Needs Admin Review
              </span>
            )}
          </h3>
        </div>

        {/* Confidence Meter Pill */}
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-500">Confidence</div>
          <div className="text-lg font-black text-emerald-700">{confidenceScore}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            confidenceScore > 85 ? 'bg-emerald-600' : confidenceScore > 70 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${confidenceScore}%` }}
        />
      </div>

      {/* Distinction Badges: Wet vs Dry & Recyclable & Hazard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Wet/Dry Macro Distinction */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs">
          <Droplets
            className={`w-4 h-4 shrink-0 ${
              result.wet_dry === 'Wet waste' ? 'text-blue-500' : 'text-amber-500'
            }`}
          />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Stream</div>
            <div className="font-bold text-slate-800">{result.wet_dry}</div>
          </div>
        </div>

        {/* Recyclability */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs">
          <Recycle
            className={`w-4 h-4 shrink-0 ${
              result.recyclable ? 'text-emerald-600' : 'text-slate-400'
            }`}
          />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Recyclable</div>
            <div className="font-bold text-slate-800">
              {result.recyclable ? 'Yes (Salvageable)' : 'Non-Recyclable'}
            </div>
          </div>
        </div>

        {/* Hazard Level */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs col-span-2 sm:col-span-1">
          <ShieldAlert
            className={`w-4 h-4 shrink-0 ${
              result.hazard_level === 'High'
                ? 'text-rose-600'
                : result.hazard_level === 'Moderate'
                ? 'text-amber-500'
                : 'text-emerald-500'
            }`}
          />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Hazard Level</div>
            <div className="font-bold text-slate-800">{result.hazard_level}</div>
          </div>
        </div>
      </div>

      {/* Disposal Recommendation Callout */}
      <div className="p-3.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs space-y-1">
        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-700" />
          <span>Recommended Disposal Instructions</span>
        </div>
        <p className="text-emerald-800 leading-relaxed font-medium">
          {result.disposal_instructions}
        </p>
      </div>

      {/* Model Source Attribution / Info */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span>Engine: {modelSource || 'AI Multimodal Vision Model'}</span>
        {result.raw_analysis && (
          <span className="italic truncate max-w-xs">{result.raw_analysis}</span>
        )}
      </div>
    </div>
  );
};
