'use client';

import React from 'react';
import { X, Dumbbell, Sparkles, User, Tag } from 'lucide-react';
import { Exercise } from '@/types';

interface ExerciseGifLightboxProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseGifLightbox: React.FC<ExerciseGifLightboxProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !exercise) return null;

  const isCommunity = exercise.source === 'user';
  const bodyParts = exercise.bodyParts?.length ? exercise.bodyParts : [exercise.bodyPart || 'General'];
  const targets = exercise.targetMuscles?.length ? exercise.targetMuscles : [exercise.targetMuscle || 'Target'];
  const equipments = exercise.equipments?.length ? exercise.equipments : [exercise.equipment || 'Equipment'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        id="modal-exercise-lightbox"
        className="w-full max-w-2xl bg-[#12161A] border border-[#252B30] rounded-3xl p-5 sm:p-7 text-[#F5F7F2] shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">{exercise.name}</h2>
              {isCommunity ? (
                <span className="px-2 py-0.5 rounded-full bg-[#5DA9FF]/20 text-[#5DA9FF] border border-[#5DA9FF]/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Community
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#B8F34A]/20 text-[#B8F34A] border border-[#B8F34A]/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ExerciseDB
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[#181D22] text-[#9AA3A0] border border-[#252B30] text-[10px] font-bold">
                {exercise.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9AA3A0] flex-wrap mt-1">
              <span>Body Parts: <strong className="text-white capitalize">{bodyParts.join(', ')}</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-[#B8F34A] capitalize">{targets.join(', ')}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white hover:border-[#9AA3A0] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large Media Display */}
        <div className="my-4 relative bg-[#0B0D0F] rounded-2xl border border-[#252B30] p-4 flex items-center justify-center min-h-[280px] sm:min-h-[360px] overflow-hidden">
          {exercise.imageUrl || exercise.gifUrl ? (
            <img
              src={exercise.imageUrl || exercise.gifUrl}
              alt={exercise.name}
              className="max-h-[340px] sm:max-h-[420px] w-auto object-contain rounded-xl shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#9AA3A0] gap-2">
              <Dumbbell className="w-12 h-12 stroke-[1.5]" />
              <span className="text-xs">No media preview available</span>
            </div>
          )}
        </div>

        {/* Equipment & Muscles worked pills */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs font-bold text-[#9AA3A0] flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#5DA9FF]" /> Equipment:
          </span>
          {equipments.map((eq, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-semibold text-white capitalize"
            >
              {eq}
            </span>
          ))}
        </div>

        {/* Step-by-Step Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div className="pt-3 border-t border-[#252B30]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
              Movement Execution Instructions
            </h4>
            <ol className="space-y-2 text-xs text-[#F5F7F2]">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-[#181D22] border border-[#252B30]/60">
                  <span className="w-5 h-5 rounded-lg bg-[#B8F34A]/20 text-[#B8F34A] font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">
                    {step.replace(/^Step:\s*\d+\s*/i, '')}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
