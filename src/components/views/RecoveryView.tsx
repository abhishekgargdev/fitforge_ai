'use client';

import React, { useEffect, useState } from 'react';
import { OriginBadge } from '../common/OriginBadge';
import {
  HeartPulse,
  ShowerHead,
  Activity,
  Flame,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Droplets,
  Pill,
} from 'lucide-react';
import { RecoveryItem, RecoveryPlan } from '@/types';
import { LoadingButton } from '../common/LoadingButton';

interface RecoveryViewProps {
  onNavigate?: (tab: string) => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = () => {
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPlan = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/recovery');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load recovery plan.');
      setPlan(json.data.plan);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error loading recovery plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGenerateAI = async () => {
    setGenerating(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/recovery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRestDay: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to generate recovery plan.');
      setPlan(json.data.plan);
      setCompletedItems({});
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error generating recovery plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getItemIcon = (type: RecoveryItem['type']) => {
    switch (type) {
      case 'shower':
        return <ShowerHead className="w-5 h-5 text-[#5DA9FF]" />;
      case 'stretch':
      case 'mobility':
        return <Activity className="w-5 h-5 text-[#B8F34A]" />;
      case 'hydration':
        return <Droplets className="w-5 h-5 text-[#5DA9FF]" />;
      case 'meditation':
      case 'sleep':
        return <Moon className="w-5 h-5 text-[#A582FF]" />;
      case 'supplement':
        return <Pill className="w-5 h-5 text-[#F5B942]" />;
      default:
        return <HeartPulse className="w-5 h-5 text-[#B8F34A]" />;
    }
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalCount = plan?.items.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div id="recovery-view" className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Recovery & Regeneration Engine
            </h2>
            <OriginBadge origin="AI_RECOMMENDATION" />
          </div>
          <p className="text-xs text-[#9AA3A0] mt-1">
            Personalized post-workout protocols for parasympathetic nervous system recovery and cellular repair
          </p>
        </div>

        <LoadingButton
          type="button"
          isLoading={generating}
          onClick={handleGenerateAI}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8F34A]/20 to-[#5DA9FF]/20 border border-[#B8F34A]/40 text-[#F5F7F2] hover:border-[#B8F34A] text-xs font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#B8F34A]" />
          Regenerate Today's Protocol
        </LoadingButton>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 text-[#F05D5E] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Progress Bar */}
      {plan && (
        <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white uppercase tracking-wider">Today's Protocol Adherence</span>
            <span className="text-[#B8F34A]">{completedCount} of {totalCount} Completed ({progressPct}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#0B0D0F] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#B8F34A] to-[#45D483] transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Recovery Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#9AA3A0] bg-[#12161A] border border-[#252B30] rounded-2xl">
            Loading recovery recommendations...
          </div>
        ) : !plan || plan.items.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9AA3A0] bg-[#12161A] border border-[#252B30] rounded-2xl">
            No recovery plan found for today. Click "Regenerate Today's Protocol" to generate one.
          </div>
        ) : (
          plan.items.map((item, idx) => {
            const isDone = Boolean(completedItems[idx]);
            const isSupplement = item.type === 'supplement';

            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-[#181D22]/40 border-[#45D483]/30 opacity-75'
                    : 'bg-[#12161A] border-[#252B30] hover:border-[#B8F34A]/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-[#45D483]/10 border-[#45D483]/30 text-[#45D483]'
                        : 'bg-[#0B0D0F] border-[#252B30]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-[#45D483]" /> : getItemIcon(item.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${isDone ? 'line-through text-[#9AA3A0]' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#181D22] text-[#9AA3A0] border border-[#252B30]">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#9AA3A0] leading-relaxed">
                      {item.description}
                    </p>
                    {isSupplement && (
                      <p className="text-[10px] italic text-[#F5B942] mt-1">
                        ⚠️ Guidance note: Check with a pharmacist or doctor before starting any new supplement.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    isDone
                      ? 'bg-[#45D483] border-[#45D483] text-[#0B0D0F]'
                      : 'border-[#252B30] hover:border-[#B8F34A]'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Safety & Medical Disclaimer Banner */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-4 text-[11px] text-[#9AA3A0] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <OriginBadge origin="AI_RECOMMENDATION" />
          <span>FitForge Recovery suggestions are general guidelines and do not constitute medical advice.</span>
        </div>
      </div>
    </div>
  );
};
