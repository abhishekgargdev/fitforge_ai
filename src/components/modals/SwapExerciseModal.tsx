'use client';

import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Dumbbell, Filter } from 'lucide-react';
import { Exercise } from '@/types';
import { LoadingButton } from '../common/LoadingButton';

interface SwapExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  dayId?: string;
  sessionId?: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  equipment: string;
  onSwapCompleted: (newExerciseDto?: Exercise) => void;
}

const commonReasons = [
  'Equipment unavailable at gym',
  'Prefer a different movement',
  'Too difficult / Heavy',
  'Joint discomfort / Injury',
];

const availableEquipments = ['barbell', 'dumbbell', 'cable', 'leverage machine', 'body weight', 'band'];

export const SwapExerciseModal: React.FC<SwapExerciseModalProps> = ({
  isOpen,
  onClose,
  planId,
  dayId,
  sessionId,
  exerciseId,
  exerciseName,
  targetMuscle,
  equipment,
  onSwapCompleted,
}) => {
  const [reason, setReason] = useState('');
  const [excludeEquipment, setExcludeEquipment] = useState<string[]>([]);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [candidate, setCandidate] = useState<Exercise | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleExcludeEquipment = (eq: string) => {
    setExcludeEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const endpointUrl = planId && dayId
    ? `/api/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/swap`
    : `/api/workouts/${sessionId}/exercises/${exerciseId}/swap`;

  const handleFetchAlternative = async () => {
    setLoadingCandidate(true);
    setError('');
    setCandidate(null);

    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || 'Prefer alternative exercise',
          excludeEquipment,
          accept: false,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to find alternative exercise.');
      }

      setCandidate(json.data.candidate);
      setReasoning(json.data.reasoning || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to find exercise alternative.');
    } finally {
      setLoadingCandidate(false);
    }
  };

  const handleAcceptSwap = async () => {
    if (!candidate) return;
    setCommitting(true);
    setError('');

    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || 'User accepted AI swap',
          excludeEquipment,
          accept: true,
          targetExerciseId: candidate.id || candidate.exerciseId,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to commit exercise swap.');
      }

      onSwapCompleted(json.data.swappedTo || candidate);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save exercise swap.');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        id="modal-swap-exercise"
        className="w-full max-w-lg bg-[#12161A] border border-[#252B30] rounded-3xl p-6 text-[#F5F7F2] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#252B30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B8F34A]/15 text-[#B8F34A] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Swap Exercise</h3>
              <p className="text-xs text-[#9AA3A0]">AI-guided biomechanical substitution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA3A0] hover:text-white hover:bg-[#181D22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Exercise Badge */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#181D22] border border-[#252B30] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9AA3A0] block">
              Replacing Current Exercise
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">{exerciseName}</h4>
            <div className="flex items-center gap-2 text-xs text-[#9AA3A0] mt-1 capitalize">
              <span>Target: <strong className="text-[#B8F34A]">{targetMuscle}</strong></span>
              <span>•</span>
              <span>Equipment: <strong className="text-white">{equipment}</strong></span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 text-[#F05D5E] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!candidate ? (
          <div className="space-y-4">
            {/* Reason selector */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                Why are you swapping this move?
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {commonReasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      reason === r
                        ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold'
                        : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Or specify custom reason..."
                className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>

            {/* Exclude Equipment Filter */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] flex items-center gap-1 mb-1.5">
                <Filter className="w-3 h-3 text-[#5DA9FF]" /> Exclude Specific Equipment
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableEquipments.map((eq) => {
                  const isExcluded = excludeEquipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleExcludeEquipment(eq)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                        isExcluded
                          ? 'bg-[#F05D5E]/20 border-[#F05D5E]/40 text-[#F05D5E] line-through'
                          : 'bg-[#181D22] border-[#252B30] text-[#9AA3A0] hover:text-white'
                      }`}
                    >
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <LoadingButton
                onClick={handleFetchAlternative}
                isLoading={loadingCandidate}
                className="w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs hover:bg-[#a6de3b] transition-all shadow-[0_0_12px_rgba(184,243,74,0.3)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loadingCandidate ? 'Finding an alternative...' : 'Find Alternative with AI'}
              </LoadingButton>
            </div>
          </div>
        ) : (
          /* Alternative Candidate Preview */
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-[#0B0D0F] border border-[#B8F34A]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B8F34A] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Suggested Substitution
                </span>
                <span className="text-xs text-[#9AA3A0] font-semibold capitalize">
                  {candidate.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {candidate.imageUrl || candidate.gifUrl ? (
                  <img
                    src={candidate.imageUrl || candidate.gifUrl}
                    alt={candidate.name}
                    className="w-16 h-16 object-cover rounded-xl border border-[#252B30] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-center text-[#9AA3A0] shrink-0">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-white">{candidate.name}</h4>
                  <p className="text-xs text-[#9AA3A0] mt-0.5 capitalize">
                    Target: <strong className="text-white">{candidate.targetMuscles?.join(', ') || candidate.targetMuscle}</strong>
                  </p>
                  <p className="text-xs text-[#9AA3A0] capitalize">
                    Equipment: <strong className="text-[#5DA9FF]">{candidate.equipments?.join(', ') || candidate.equipment}</strong>
                  </p>
                </div>
              </div>

              {reasoning && (
                <p className="text-xs text-[#F5F7F2]/90 p-2.5 rounded-xl bg-[#181D22] border border-[#252B30] leading-relaxed">
                  💡 {reasoning}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleFetchAlternative}
                disabled={loadingCandidate || committing}
                className="flex-1 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white"
              >
                Try Another
              </button>
              <LoadingButton
                onClick={handleAcceptSwap}
                isLoading={committing}
                className="flex-1 py-2.5 rounded-xl bg-[#45D483] text-[#0B0D0F] font-bold text-xs hover:bg-[#3bb871] transition-all shadow-[0_0_12px_rgba(69,212,131,0.3)] flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept & Swap
              </LoadingButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
