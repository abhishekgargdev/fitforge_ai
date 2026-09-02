'use client';

// Fields used: CompletedWorkoutSummary.workoutName, durationMinutes, totalVolumeKg, totalSets, caloriesBurnedEstimate, volumeChangeVsPreviousPercentage, personalRecords[], aiSummary.

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CompletedWorkoutSummary } from '@/types';
import { Sparkles, Trophy, Flame, Clock, Dumbbell, TrendingUp, CheckCircle2 } from 'lucide-react';

interface WorkoutCompletionModalProps {
  summary: CompletedWorkoutSummary;
  onClose: () => void;
  onViewSummary: () => void;
}

export const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  summary,
  onClose,
  onViewSummary,
}) => {
  useEffect(() => {
    // Fire confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B8F34A', '#45D483', '#5DA9FF', '#F5B942'],
      });
    } catch (e) {
      console.log('Confetti effect triggered');
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="modal-workout-completion"
        className="w-full max-w-xl bg-[#12161A] border border-[#B8F34A]/40 rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative overflow-hidden"
      >
        {/* Glow background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#B8F34A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#B8F34A]/20 text-[#B8F34A] mb-3 border border-[#B8F34A]/40 shadow-[0_0_20px_rgba(184,243,74,0.3)]">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Workout Complete! 🎉
          </h2>
          <p className="text-sm text-[#9AA3A0] mt-1">
            {summary.workoutName} • Phenomenal effort and focus today.
          </p>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#181D22] border border-[#252B30] p-3 rounded-2xl text-center">
            <Clock className="w-4 h-4 text-[#5DA9FF] mx-auto mb-1" />
            <span className="text-xs text-[#9AA3A0] block">Duration</span>
            <span className="text-lg font-black text-white">{summary.durationMinutes} min</span>
          </div>

          <div className="bg-[#181D22] border border-[#252B30] p-3 rounded-2xl text-center">
            <Dumbbell className="w-4 h-4 text-[#B8F34A] mx-auto mb-1" />
            <span className="text-xs text-[#9AA3A0] block">Total Volume</span>
            <span className="text-lg font-black text-[#B8F34A]">
              {summary.totalVolumeKg.toLocaleString()} kg
            </span>
          </div>

          <div className="bg-[#181D22] border border-[#252B30] p-3 rounded-2xl text-center">
            <CheckCircle2 className="w-4 h-4 text-[#45D483] mx-auto mb-1" />
            <span className="text-xs text-[#9AA3A0] block">Sets Done</span>
            <span className="text-lg font-black text-white">{summary.totalSets} sets</span>
          </div>

          <div className="bg-[#181D22] border border-[#252B30] p-3 rounded-2xl text-center">
            <Flame className="w-4 h-4 text-[#F5B942] mx-auto mb-1" />
            <span className="text-xs text-[#9AA3A0] block">Calories</span>
            <span className="text-lg font-black text-white">~{summary.caloriesBurnedEstimate} kcal</span>
          </div>
        </div>

        {/* PRs and Comparison Badges */}
        <div className="space-y-2 mb-6">
          <div className="p-3 rounded-xl bg-[#0B0D0F]/60 border border-[#252B30] flex items-center justify-between text-xs">
            <span className="text-[#9AA3A0] flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-[#45D483]" />
              Comparison with previous session:
            </span>
            <span className={`font-bold ${summary.volumeChangeVsPreviousPercentage >= 0 ? 'text-[#45D483]' : 'text-[#F05D5E]'}`}>
              {summary.volumeChangeVsPreviousPercentage >= 0 ? '+' : ''}
              {summary.volumeChangeVsPreviousPercentage}% total volume
            </span>
          </div>

          {summary.personalRecords && summary.personalRecords.length > 0 && (
            <div className="p-3 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 flex items-center gap-2 text-xs text-[#F5B942] font-semibold">
              <Trophy className="w-4 h-4 shrink-0" />
              <span>
                <strong>New Personal Record:</strong> {summary.personalRecords.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* AI Session Summary Card */}
        <div className="bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/30 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#B8F34A] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            FitForge AI Session Evaluation
          </div>
          <p className="text-xs sm:text-sm text-[#F5F7F2] leading-relaxed">
            {summary.aiSummary}
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-workout-view-details"
            type="button"
            onClick={onViewSummary}
            className="w-full py-3 rounded-xl bg-[#181D22] border border-[#252B30] text-[#F5F7F2] hover:border-[#B8F34A]/50 font-bold text-xs transition-all"
          >
            View Workout Details
          </button>
          <button
            id="btn-workout-back-to-dash"
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs transition-all shadow-[0_0_15px_rgba(184,243,74,0.3)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
