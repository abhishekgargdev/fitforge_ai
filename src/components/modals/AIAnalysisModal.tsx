'use client';

// Fields used: POST /api/ai/progress-analysis with range only. Output: executiveSummary,
// recompScore (calculated), recompositionStatus, strengths[], areasToOptimize[], upcomingPhaseRecommendation.

import React, { useState, useEffect } from 'react';
import { UserProfile, MetricEntry, BodyCompositionDetails } from '@/types';
import { Sparkles, X, Shield, Activity, Zap, CheckCircle2, Loader2 } from 'lucide-react';

interface AIAnalysisModalProps {
  userProfile?: UserProfile;
  metrics?: MetricEntry[];
  composition?: BodyCompositionDetails;
  onClose: () => void;
  range?: '1m' | '3m' | '6m' | '1y' | 'all';
}

type AnalysisResult = {
  executiveSummary: string;
  recompScore: string;
  recompositionStatus: string;
  strengths: string[];
  areasToOptimize: string[];
  upcomingPhaseRecommendation: string;
};

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  onClose,
  range = '3m',
}) => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const stepsList = [
    "Analyzing biometric trajectory & body composition...",
    "Evaluating muscle mass vs body fat delta...",
    "Calculating periodization & recomp efficiency score...",
    "Formulating 4-week strategic directives...",
  ];

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    const fetchAnalysis = async () => {
      setLoading(true);
      setErrorMsg('');
      setStepIndex(0);
      stepInterval = setInterval(() => {
        setStepIndex((prev) => (prev < stepsList.length - 1 ? prev + 1 : prev));
      }, 650);

      try {
        const res = await fetch('/api/ai/progress-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ range }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Analysis unavailable');
        setAnalysis(json.data);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : 'Unable to generate analysis.');
        setAnalysis(null);
      } finally {
        clearInterval(stepInterval);
        setLoading(false);
      }
    };

    void fetchAnalysis();
    return () => clearInterval(stepInterval);
  }, [range]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        id="modal-ai-deep-analysis"
        className="w-full max-w-2xl bg-[#12161A] border border-[#B8F34A]/40 rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-8"
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B8F34A]/20 text-[#B8F34A] flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                FitForge AI Deep Bio-Progress Report
              </h2>
            </div>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Built from calculated metric trends, not raw scan dumps
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#B8F34A] animate-spin" />
            <p className="text-sm font-semibold text-[#B8F34A] transition-all">
              {stepsList[stepIndex]}
            </p>
            <div className="w-48 bg-[#0B0D0F] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B8F34A] h-full rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / stepsList.length) * 100}%` }}
              />
            </div>
          </div>
        ) : errorMsg || !analysis ? (
          <div className="py-12 text-center text-sm text-[#F05D5E]">{errorMsg || 'No analysis available.'}</div>
        ) : (
          <div className="mt-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181D22] via-[#1A221E] to-[#181D22] border border-[#B8F34A]/40 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-[#9AA3A0] block">
                  Recomposition Efficiency Score
                </span>
                <h3 className="text-2xl font-black text-white">{analysis.recompositionStatus}</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#B8F34A] font-mono">
                  {analysis.recompScore}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0D0F]/70 border border-[#252B30]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#5DA9FF]" />
                Executive Summary
              </h4>
              <p className="text-xs sm:text-sm text-[#F5F7F2] leading-relaxed">
                {analysis.executiveSummary}
              </p>
            </div>

            <div className="bg-[#181D22] p-4 rounded-xl border border-[#252B30]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#45D483] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validated Progress Factors
              </h4>
              <div className="space-y-1.5">
                {analysis.strengths?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#F5F7F2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45D483] shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#181D22] p-4 rounded-xl border border-[#252B30]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5B942] mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Optimization Opportunities
              </h4>
              <div className="space-y-1.5">
                {analysis.areasToOptimize?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#F5F7F2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5B942] shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/30">
              <h4 className="text-xs font-bold text-[#B8F34A] mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Upcoming 4-Week Strategic Directives
              </h4>
              <p className="text-xs sm:text-sm text-[#F5F7F2] leading-relaxed">
                {analysis.upcomingPhaseRecommendation}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#252B30] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-bold text-xs shadow-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
