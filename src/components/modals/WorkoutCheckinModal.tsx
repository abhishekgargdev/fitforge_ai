'use client';

import React, { useState } from 'react';
import { Dumbbell, ArrowRight, X } from 'lucide-react';

interface WorkoutCheckinModalProps {
  workoutName: string;
  latestWeightKg: number;
  isStart?: boolean;
  onStart: (startWeightKg?: number) => void;
  onClose: () => void;
}

export const WorkoutCheckinModal: React.FC<WorkoutCheckinModalProps> = ({
  workoutName,
  latestWeightKg,
  isStart = true,
  onStart,
  onClose,
}) => {
  const [weightKg, setWeightKg] = useState<number>(latestWeightKg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm bg-[#12161A] border border-[#252B30] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#9AA3A0] hover:text-white hover:bg-[#181D22] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#B8F34A]/20 text-[#B8F34A] mb-3">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">{isStart ? 'Start' : 'Finish'} {workoutName}</h2>
          <p className="text-xs text-[#9AA3A0] mt-1">
            Log your current weight for accurate progressive overload tracking, or skip.
          </p>
        </div>

        <div className="mb-6">
          <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
            Current Weight (kg)
          </label>
          <input
            type="number"
            value={weightKg || ''}
            onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
            step="0.1"
            className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
            placeholder="e.g. 78.5"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onStart(weightKg)}
            className="w-full bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] py-3.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-[0_2px_14px_rgba(184,243,74,0.3)]"
          >
            Log Weight & Begin
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStart()}
            className="w-full py-3.5 rounded-xl border border-[#252B30] text-[#9AA3A0] hover:text-white hover:bg-[#181D22] font-semibold text-xs transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
