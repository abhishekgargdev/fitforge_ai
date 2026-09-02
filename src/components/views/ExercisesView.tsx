'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise } from '@/types';
import { Search, Plus, Sparkles, User, Maximize2 } from 'lucide-react';
import { AddExerciseModal } from '../modals/AddExerciseModal';
import { ExerciseGifLightbox } from '../modals/ExerciseGifLightbox';

interface ExercisesViewProps {
  onStartWithExercise?: (exercise: Exercise) => void;
}

const muscleFilters = [
  'all',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Biceps',
  'Triceps',
  'Legs',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs / Core',
];
const equipmentFilters = ['all', 'barbell', 'dumbbells', 'machines', 'bodyweight'];
const difficultyFilters = ['all', 'Beginner', 'Intermediate', 'Advanced'];
const sourceFilters = [
  { id: 'all', label: 'All Catalog & Community' },
  { id: 'catalog', label: 'ExerciseDB Verified' },
  { id: 'user', label: 'Community Created' },
];

function muscleQuery(muscle: string): { bodyParts?: string; targetMuscles?: string } {
  if (muscle === 'all') return {};
  const targetMusclesMap: Record<string, string> = {
    Biceps: 'biceps',
    Triceps: 'triceps',
    Quads: 'quadriceps',
    Hamstrings: 'hamstrings',
    Glutes: 'glutes',
    Calves: 'calves',
  };
  if (targetMusclesMap[muscle]) return { targetMuscles: targetMusclesMap[muscle] };
  return { bodyParts: muscle };
}

export const ExercisesView: React.FC<ExercisesViewProps> = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [lightboxExercise, setLightboxExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedMuscle, selectedEquipment, selectedDifficulty, selectedSource]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    const muscle = muscleQuery(selectedMuscle);
    if (muscle.bodyParts) params.set('bodyParts', muscle.bodyParts);
    if (muscle.targetMuscles) params.set('targetMuscles', muscle.targetMuscles);
    if (selectedEquipment !== 'all') params.set('equipments', selectedEquipment);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    if (selectedSource !== 'all') params.set('source', selectedSource);
    params.set('page', String(page));
    params.set('limit', '24');
    return params.toString();
  }, [debouncedQuery, selectedMuscle, selectedEquipment, selectedDifficulty, selectedSource, page]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/exercises?${queryString}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Unable to load exercises.');
        if (cancelled) return;
        setItems(json.data.items);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load exercises.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const handleCreatedSuccess = (newExercise: Exercise) => {
    setItems((prev) => [newExercise, ...prev]);
    setTotal((prev) => prev + 1);
  };

  return (
    <div id="exercises-view" className="space-y-6 animate-in fade-in">
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Exercise Library & Form Guide
            </h2>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Comprehensive movement biomechanics, execution cues, and muscle activation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-add-exercise"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#5DA9FF] text-[#0B0D0F] hover:bg-[#72B4FF] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add an Exercise
            </button>
            <div className="text-xs text-[#B8F34A] font-bold bg-[#B8F34A]/10 px-3 py-2 rounded-xl border border-[#B8F34A]/20 shrink-0">
              {total} Movements
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-exercises"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exercise name, target muscle (e.g. Quads, Bench)..."
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 focus:border-[#B8F34A] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#B8F34A] outline-none"
            >
              <option value="all">All Muscles</option>
              {muscleFilters.filter((m) => m !== 'all').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#B8F34A] outline-none capitalize"
            >
              <option value="all">All Equipment</option>
              {equipmentFilters.filter((eq) => eq !== 'all').map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-1/2 bg-[#0B0D0F] border border-[#252B30] rounded-xl px-2.5 py-2.5 text-xs text-white focus:border-[#B8F34A] outline-none capitalize"
            >
              <option value="all">All Levels</option>
              {difficultyFilters.filter((d) => d !== 'all').map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-1/2 bg-[#0B0D0F] border border-[#252B30] rounded-xl px-2.5 py-2.5 text-xs text-white focus:border-[#5DA9FF] outline-none"
            >
              {sourceFilters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {muscleFilters.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all capitalize ${
                selectedMuscle === m
                  ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold'
                  : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-[#F05D5E]">{error}</p>}
      {loading && <p className="text-sm text-[#9AA3A0]">Loading movements…</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-[#9AA3A0]">
          No exercises match those filters. If the library is empty, run `npm run sync:exercises`.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((exercise) => {
          const isCommunity = exercise.source === 'user';
          const bodyPartsText = exercise.bodyParts?.length ? exercise.bodyParts.join(', ') : exercise.bodyPart || 'General';
          const targetText = exercise.targetMuscles?.length ? exercise.targetMuscles.join(', ') : exercise.targetMuscle || 'Target';
          const eqText = exercise.equipments?.length ? exercise.equipments.join(', ') : exercise.equipment || 'body weight';

          return (
            <div
              key={exercise.id}
              id={`card-exercise-${exercise.id}`}
              className="bg-[#12161A] border border-[#252B30] rounded-2xl overflow-hidden group hover:border-[#B8F34A]/50 transition-all flex flex-col justify-between shadow-sm relative"
            >
              <div>
                <div className="relative w-full h-44 bg-[#0B0D0F] overflow-hidden group/img">
                  <img
                    src={exercise.imageUrl || exercise.gifUrl}
                    alt={exercise.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  />
                  {/* Click to open Lightbox overlay button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxExercise(exercise);
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs gap-1.5"
                    title="Inspect movement GIF large"
                  >
                    <Maximize2 className="w-5 h-5 text-[#B8F34A]" />
                    <span>Enlarge GIF</span>
                  </button>

                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white border border-[#252B30] capitalize">
                    {eqText}
                  </div>

                  {isCommunity ? (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#5DA9FF]/90 backdrop-blur-sm text-[10px] font-extrabold text-[#0B0D0F] flex items-center gap-1 uppercase tracking-wider">
                      <User className="w-3 h-3" /> Community
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#12161A]/80 backdrop-blur-sm text-[10px] font-bold text-[#B8F34A] capitalize">
                      {exercise.difficulty}
                    </div>
                  )}
                </div>

                <div
                  className="p-4 cursor-pointer"
                  onClick={() => router.push(`/exercises/${exercise.id}`)}
                >
                  <div className="text-[10px] uppercase font-bold text-[#9AA3A0] tracking-wider mb-0.5 capitalize">
                    {bodyPartsText}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#B8F34A] transition-colors line-clamp-1">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-[#9AA3A0] mt-1 line-clamp-2">
                    Target: <strong className="text-white capitalize">{targetText}</strong>.{' '}
                    {exercise.instructions[0]}
                  </p>
                </div>
              </div>

              <div
                className="p-4 pt-0 flex items-center justify-between text-xs border-t border-[#252B30]/40 mt-2 cursor-pointer"
                onClick={() => router.push(`/exercises/${exercise.id}`)}
              >
                <span className="text-[11px] text-[#B8F34A] font-bold flex items-center gap-1 group-hover:underline">
                  View Form & Technique →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="px-3 py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-[#9AA3A0]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <AddExerciseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleCreatedSuccess}
      />

      <ExerciseGifLightbox
        exercise={lightboxExercise}
        isOpen={Boolean(lightboxExercise)}
        onClose={() => setLightboxExercise(null)}
      />
    </div>
  );
};
