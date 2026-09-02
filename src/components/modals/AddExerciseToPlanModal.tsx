'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Dumbbell, Check } from 'lucide-react';
import { Exercise } from '@/types';
import { LoadingButton } from '../common/LoadingButton';

interface AddExerciseToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  dayId: string;
  dayName: string;
  onSuccess: () => void;
}

export const AddExerciseToPlanModal: React.FC<AddExerciseToPlanModalProps> = ({
  isOpen,
  onClose,
  planId,
  dayId,
  dayName,
  onSuccess,
}) => {
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('8-12');
  const [restSeconds, setRestSeconds] = useState(90);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/exercises?q=${encodeURIComponent(query)}&limit=16`)
      .then(async (res) => {
        const json = await res.json();
        if (res.ok && json.data?.items) {
          setExercises(json.data.items);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, query]);

  if (!isOpen) return null;

  const handleAddExercise = async () => {
    if (!selectedEx) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/workout-plans/${planId}/days/${dayId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedEx.id || selectedEx.exerciseId,
          sets,
          reps,
          restSeconds,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Failed to add exercise to plan.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        id="modal-add-exercise-to-plan"
        className="w-full max-w-xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 text-[#F5F7F2] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#252B30]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#5DA9FF]/15 text-[#5DA9FF] flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Add Exercise to {dayName}</h3>
                <p className="text-xs text-[#9AA3A0]">Select a movement to add to your workout split</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9AA3A0] hover:text-white hover:bg-[#181D22]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 text-[#F05D5E] text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Search bar */}
          <div className="relative mt-4 mb-3">
            <Search className="w-4 h-4 text-[#9AA3A0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercise catalog by name or target muscle..."
              className="w-full bg-[#181D22] border border-[#252B30] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#5DA9FF] outline-none"
            />
          </div>

          {/* Exercise list grid */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {loading && <p className="text-xs text-[#9AA3A0] p-2">Searching movements...</p>}
            {!loading && exercises.length === 0 && (
              <p className="text-xs text-[#9AA3A0] p-2">No exercises found.</p>
            )}
            {!loading &&
              exercises.map((ex) => {
                const isSelected = selectedEx?.id === ex.id;
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedEx(ex)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#5DA9FF]/15 border-[#5DA9FF]'
                        : 'bg-[#181D22] border-[#252B30] hover:border-[#9AA3A0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {ex.imageUrl || ex.gifUrl ? (
                        <img
                          src={ex.imageUrl || ex.gifUrl}
                          alt={ex.name}
                          className="w-10 h-10 object-cover rounded-lg border border-[#252B30]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#0B0D0F] border border-[#252B30] flex items-center justify-center text-[#9AA3A0]">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                        <span className="text-[10px] text-[#9AA3A0] capitalize">
                          {ex.targetMuscles?.join(', ') || ex.targetMuscle} • {ex.equipments?.join(', ') || ex.equipment}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#5DA9FF] text-[#0B0D0F] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Sets / Reps / Rest Controls */}
          {selectedEx && (
            <div className="mt-4 pt-3 border-t border-[#252B30] grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#9AA3A0] block mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value))}
                  className="w-full bg-[#181D22] border border-[#252B30] rounded-xl py-1.5 px-2.5 text-xs font-bold text-white text-center"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#9AA3A0] block mb-1">
                  Reps
                </label>
                <input
                  type="text"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full bg-[#181D22] border border-[#252B30] rounded-xl py-1.5 px-2.5 text-xs font-bold text-white text-center"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#9AA3A0] block mb-1">
                  Rest (sec)
                </label>
                <input
                  type="number"
                  step={15}
                  min={15}
                  max={300}
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(Number(e.target.value))}
                  className="w-full bg-[#181D22] border border-[#252B30] rounded-xl py-1.5 px-2.5 text-xs font-bold text-white text-center"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 flex items-center gap-3 border-t border-[#252B30]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white"
          >
            Cancel
          </button>
          <LoadingButton
            onClick={handleAddExercise}
            isLoading={submitting}
            disabled={!selectedEx}
            className="flex-1 py-2.5 rounded-xl bg-[#5DA9FF] text-[#0B0D0F] font-bold text-xs hover:bg-[#72B4FF] transition-all shadow-[0_0_12px_rgba(93,169,255,0.3)] disabled:opacity-40"
          >
            Add to {dayName}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};
