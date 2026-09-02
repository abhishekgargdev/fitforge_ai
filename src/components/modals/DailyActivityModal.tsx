'use client';

import React, { useEffect, useState } from 'react';
import { X, Footprints, Flame, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { LoadingButton } from '../common/LoadingButton';

interface DailyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string;
}

export const DailyActivityModal: React.FC<DailyActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}) => {
  const dateStr = initialDate || new Date().toISOString().split('T')[0];
  const [steps, setSteps] = useState<string>('8000');
  const [activityType, setActivityType] = useState<string>('walk');
  const [durationMinutes, setDurationMinutes] = useState<string>('30');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSavedSuccess(false);
      setError('');
      // Fetch existing log for today if available
      fetch(`/api/daily-activity?date=${dateStr}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data?.logs?.[0]) {
            const existing = json.data.logs[0];
            if (existing.steps !== undefined) setSteps(String(existing.steps));
            if (existing.activityType) setActivityType(existing.activityType);
            if (existing.durationMinutes !== undefined) setDurationMinutes(String(existing.durationMinutes));
            if (existing.notes) setNotes(existing.notes);
          }
        })
        .catch(() => undefined);
    }
  }, [isOpen, dateStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/daily-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          steps: steps ? Number(steps) : undefined,
          activityType: activityType || undefined,
          durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
          notes: notes ? notes.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to save activity log');
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save activity log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="modal-daily-activity"
        className="w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-6 text-[#F5F7F2] shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#252B30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B8F34A]/15 text-[#B8F34A] flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Log Rest-Day Activity</h3>
              <p className="text-xs text-[#9AA3A0]">Active recovery & step counter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA3A0] hover:text-white hover:bg-[#181D22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#45D483]/20 text-[#45D483] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-white text-base">Rest-day activity saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 text-[#F05D5E] text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Daily Steps */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
                Daily Steps (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="e.g. 8500"
                  className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl py-2.5 px-3 pl-9 text-sm font-semibold text-white outline-none"
                />
                <Footprints className="w-4 h-4 text-[#9AA3A0] absolute left-3 top-3" />
              </div>
            </div>

            {/* Activity Type */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
                Activity Type (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'walk', label: 'Brisk Walk' },
                  { id: 'yoga', label: 'Yoga' },
                  { id: 'cycling', label: 'Cycling' },
                  { id: 'swimming', label: 'Swimming' },
                  { id: 'mobility', label: 'Mobility' },
                  { id: 'sports', label: 'Sports' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityType(act.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      activityType === act.id
                        ? 'bg-[#B8F34A] text-[#0B0D0F] border-[#B8F34A]'
                        : 'bg-[#181D22] border-[#252B30] text-[#9AA3A0] hover:text-white'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
                Duration in Minutes (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl py-2.5 px-3 pl-9 text-sm font-semibold text-white outline-none"
                />
                <Clock className="w-4 h-4 text-[#9AA3A0] absolute left-3 top-3" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Felt great, light evening walk around the park..."
                rows={2}
                className="w-full bg-[#181D22] border border-[#252B30] focus:border-[#B8F34A] rounded-xl p-3 text-xs font-medium text-white outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                isLoading={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs hover:bg-[#C8FF68] transition-all shadow-[0_0_12px_rgba(184,243,74,0.3)]"
              >
                Save Activity
              </LoadingButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
