'use client';

// Fields used: Exercise.id, name, bodyPart, targetMuscle, primaryMuscles, secondaryMuscles,
// equipment, difficulty, instructions[], gifUrl/imageUrl, musclesWorkedVisual, commonMistakes[], tips[].
// Search/filters: q, bodyPart/target muscle, equipment, difficulty. Related list lives on the detail page.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise } from '@/types';
import { Search } from 'lucide-react';

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
  'Core',
];
const equipmentFilters = ['all', 'barbell', 'dumbbells', 'machines', 'bodyweight'];
const difficultyFilters = ['all', 'Beginner', 'Intermediate', 'Advanced'];

function muscleQuery(muscle: string): { bodyPart?: string; target?: string } {
  if (muscle === 'all') return {};
  const targetMuscles: Record<string, string> = {
    Biceps: 'biceps',
    Triceps: 'triceps',
    Quads: 'quadriceps',
    Hamstrings: 'hamstrings',
    Glutes: 'glutes',
    Calves: 'calves',
  };
  if (targetMuscles[muscle]) return { target: targetMuscles[muscle] };
  return { bodyPart: muscle };
}

export const ExercisesView: React.FC<ExercisesViewProps> = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    const muscle = muscleQuery(selectedMuscle);
    if (muscle.bodyPart) params.set('bodyPart', muscle.bodyPart);
    if (muscle.target) params.set('target', muscle.target);
    if (selectedEquipment !== 'all') params.set('equipment', selectedEquipment);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    params.set('page', String(page));
    params.set('limit', '24');
    return params.toString();
  }, [debouncedQuery, selectedMuscle, selectedEquipment, selectedDifficulty, page]);

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

  return (
    <div id="exercises-view" className="space-y-6 animate-in fade-in">
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Exercise Library & Form Guide
            </h2>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Comprehensive movement biomechanics, execution cues, and muscle activation
            </p>
          </div>
          <div className="text-xs text-[#B8F34A] font-bold bg-[#B8F34A]/10 px-3 py-1.5 rounded-xl border border-[#B8F34A]/20 self-start sm:self-auto">
            {total} Movements Available
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
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

          <div className="md:col-span-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#B8F34A] outline-none capitalize"
            >
              <option value="all">All Levels</option>
              {difficultyFilters.filter((d) => d !== 'all').map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d}
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
        {items.map((exercise) => (
          <div
            key={exercise.id}
            id={`card-exercise-${exercise.id}`}
            onClick={() => router.push(`/exercises/${exercise.id}`)}
            className="bg-[#12161A] border border-[#252B30] rounded-2xl overflow-hidden group hover:border-[#B8F34A]/50 transition-all cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="relative w-full h-44 bg-[#0B0D0F] overflow-hidden">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white border border-[#252B30] capitalize">
                  {exercise.equipment}
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#12161A]/80 backdrop-blur-sm text-[10px] font-bold text-[#B8F34A] capitalize">
                  {exercise.difficulty}
                </div>
              </div>

              <div className="p-4">
                <div className="text-[10px] uppercase font-bold text-[#9AA3A0] tracking-wider mb-0.5">
                  {exercise.bodyPart || exercise.targetMuscle}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#B8F34A] transition-colors line-clamp-1">
                  {exercise.name}
                </h3>
                <p className="text-xs text-[#9AA3A0] mt-1 line-clamp-2">
                  Target: <strong className="text-white">{exercise.targetMuscle}</strong>.{' '}
                  {exercise.instructions[0]}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-[#252B30]/40 mt-2">
              <span className="text-[11px] text-[#B8F34A] font-bold flex items-center gap-1 group-hover:underline">
                View Form & Technique →
              </span>
            </div>
          </div>
        ))}
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
    </div>
  );
};
