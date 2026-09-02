'use client';

// Fields used: Exercise.id, name, targetMuscle, primaryMuscles, secondaryMuscles, equipment, difficulty,
// exerciseType, imageUrl, instructions[], musclesWorkedVisual.primary/secondary, commonMistakes[], tips[].

import React, { useState } from 'react';
import { Exercise } from '@/types';
import { exerciseLibraryData } from '@/data/mockData';
import {
  Search,
  Filter,
  Dumbbell,
  Sparkles,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';

interface ExercisesViewProps {
  onStartWithExercise?: (exercise: Exercise) => void;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({ onStartWithExercise }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  const muscleFilters = ['all', 'Chest', 'Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 'Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'];
  const equipmentFilters = ['all', 'barbell', 'dumbbells', 'machines', 'bodyweight'];
  const difficultyFilters = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = exerciseLibraryData.filter((ex) => {
    const pMuscles = ex.primaryMuscles || ex.musclesWorkedVisual?.primary || [];
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.targetMuscle.toLowerCase() === selectedMuscle.toLowerCase() ||
      pMuscles.some((m) => m.toLowerCase() === selectedMuscle.toLowerCase());

    const matchesEquipment =
      selectedEquipment === 'all' ||
      ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase());

    const matchesDiff =
      selectedDifficulty === 'all' || ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesMuscle && matchesEquipment && matchesDiff;
  });

  return (
    <div id="exercises-view" className="space-y-6 animate-in fade-in">
      {/* Header */}
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
            {filteredExercises.length} Movements Available
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
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

          {/* Muscle Select */}
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

          {/* Equipment Select */}
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

          {/* Difficulty Select */}
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

        {/* Quick Muscle Pills */}
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

      {/* Exercises Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            id={`card-exercise-${exercise.id}`}
            onClick={() => setActiveExerciseModal(exercise)}
            className="bg-[#12161A] border border-[#252B30] rounded-2xl overflow-hidden group hover:border-[#B8F34A]/50 transition-all cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div>
              {/* Media Preview */}
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

              {/* Text Info */}
              <div className="p-4">
                <div className="text-[10px] uppercase font-bold text-[#9AA3A0] tracking-wider mb-0.5">
                  {exercise.targetMuscle}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#B8F34A] transition-colors line-clamp-1">
                  {exercise.name}
                </h3>
                <p className="text-xs text-[#9AA3A0] mt-1 line-clamp-2">
                  Target: <strong className="text-white">{exercise.targetMuscle}</strong>. {exercise.instructions[0]}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-[#252B30]/40 mt-2">
              <span className="text-[11px] text-[#B8F34A] font-bold flex items-center gap-1 group-hover:underline">
                View Form & Technique →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Detail Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div
            id="modal-exercise-detail"
            className="w-full max-w-2xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-8"
          >
            <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-[#B8F34A] px-2 py-0.5 rounded-md bg-[#B8F34A]/10">
                    {activeExerciseModal.targetMuscle}
                  </span>
                  <span className="text-xs text-[#9AA3A0] capitalize">• {activeExerciseModal.equipment}</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                  {activeExerciseModal.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
              {/* Media Frame */}
              <div className="w-full h-56 rounded-2xl overflow-hidden bg-black/60 border border-[#252B30] relative">
                <img
                  src={activeExerciseModal.imageUrl}
                  alt={activeExerciseModal.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* AI Coaching Cue */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#B8F34A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-[#B8F34A] block mb-1">
                    FitForge AI Movement Analysis Cue
                  </strong>
                  <p className="text-xs sm:text-sm text-[#F5F7F2] leading-relaxed">
                    {activeExerciseModal.tips?.[0] || 'Maintain neutral spine alignment and control eccentric deceleration.'}
                  </p>
                </div>
              </div>

              {/* Muscles Activated */}
              <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252B30]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                  Muscle Engagement Matrix
                </h4>
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs font-bold text-white bg-[#0B0D0F] px-3 py-1.5 rounded-xl border border-[#B8F34A]/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B8F34A]" />
                    Primary: {activeExerciseModal.musclesWorkedVisual?.primary?.join(', ') || activeExerciseModal.targetMuscle}
                  </div>
                  {activeExerciseModal.secondaryMuscles && activeExerciseModal.secondaryMuscles.length > 0 && (
                    <div className="text-xs font-bold text-[#9AA3A0] bg-[#0B0D0F] px-3 py-1.5 rounded-xl border border-[#252B30] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#5DA9FF]" />
                      Secondary: {activeExerciseModal.secondaryMuscles?.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Steps */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-3">
                  Step-by-Step Execution
                </h4>
                <div className="space-y-2">
                  {activeExerciseModal.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#181D22] border border-[#252B30] flex items-start gap-3 text-xs"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#0B0D0F] text-[#B8F34A] font-black flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-[#F5F7F2] leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-3">
                  Common Mistakes to Avoid
                </h4>
                <div className="space-y-2">
                  {activeExerciseModal.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/25 flex items-start gap-2.5 text-xs text-[#F5F7F2]"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#F05D5E] shrink-0 mt-0.5" />
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#252B30] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveExerciseModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs"
              >
                Close Form Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
