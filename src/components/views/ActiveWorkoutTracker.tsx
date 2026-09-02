'use client';

// Fields used: workout.name, workout.exercises[].exerciseId, sets, reps, restSeconds, aiNote;
// exerciseLibraryData: id, name, instructions, tips, imageUrl;
// ActiveWorkoutSet: setNumber, targetWeightKg, targetReps, actualWeightKg, actualReps, rpe, completed;
// CompletedWorkoutSummary: workoutName, durationMinutes, totalVolumeKg, totalSets, totalExercises, caloriesBurnedEstimate, personalRecords, volumeChangeVsPreviousPercentage, aiSummary.

import React, { useState } from 'react';
import { WorkoutTemplate, ActiveWorkoutExercise, CompletedWorkoutSummary, Exercise } from '@/types';
import { WorkoutCheckinModal } from '../modals/WorkoutCheckinModal';
import { RestTimer } from '../common/RestTimer';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Dumbbell,
  Play,
  RotateCcw,
  Flame,
  Info,
  RefreshCw,
} from 'lucide-react';
import { LoadingButton } from '../common/LoadingButton';
import { SwapExerciseModal } from '../modals/SwapExerciseModal';

interface ActiveWorkoutTrackerProps {
  workout: WorkoutTemplate;
  loggedExercises?: ActiveWorkoutExercise[];
  sessionId: string;
  onFinishWorkout: (summary: CompletedWorkoutSummary) => void;
  onCancel: () => void;
}

function exerciseFromTemplate(templateEx: WorkoutTemplate['exercises'][number]): Exercise {
  return {
    id: templateEx.exerciseId,
    name: templateEx.exerciseName,
    bodyParts: [templateEx.targetMuscle || 'General'],
    equipments: [templateEx.equipment || 'body weight'],
    targetMuscles: [templateEx.targetMuscle || 'General'],
    targetMuscle: templateEx.targetMuscle,
    secondaryMuscles: [],
    equipment: templateEx.equipment,
    difficulty: templateEx.difficulty || 'Intermediate',
    exerciseType: 'Strength',
    imageUrl: templateEx.imageUrl || '',
    gifUrl: templateEx.imageUrl,
    instructions: templateEx.instructions || [],
    commonMistakes: [],
    tips: templateEx.tips || [],
  };
}

export const ActiveWorkoutTracker: React.FC<ActiveWorkoutTrackerProps> = ({
  workout,
  loggedExercises,
  sessionId,
  onFinishWorkout,
  onCancel,
}) => {
  const [exercises, setExercises] = useState<ActiveWorkoutExercise[]>(() => {
    if (loggedExercises && loggedExercises.length > 0) return loggedExercises;
    return workout.exercises.map((templateEx) => {
      const targetSetsCount = templateEx.sets || 3;
      const targetRepsCount = parseInt(String(templateEx.reps).split('-')[0], 10) || 8;
      const weight = templateEx.targetWeightKg || 40;
      const sets = Array.from({ length: targetSetsCount }, (_, idx) => ({
        setNumber: idx + 1,
        targetWeightKg: weight,
        targetReps: targetRepsCount,
        actualWeightKg: weight,
        actualReps: targetRepsCount,
        rpe: 8,
        completed: false,
      }));
      return {
        exercise: exerciseFromTemplate(templateEx),
        sets,
        restSeconds: templateEx.restSeconds || 90,
        aiNote: templateEx.aiNote,
      };
    });
  });

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showCheckin, setShowCheckin] = useState(true);
  const [showEndCheckin, setShowEndCheckin] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [startWeightKg, setStartWeightKg] = useState<number | undefined>(undefined);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  const currentExerciseData = exercises[currentExIndex];
  const currentEx = currentExerciseData.exercise;

  // Toggle set completed
  const handleToggleSet = (setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[currentExIndex] };
      const sets = [...ex.sets];
      const wasCompleted = sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], completed: !wasCompleted };
      ex.sets = sets;
      updated[currentExIndex] = ex;

      // Auto show rest timer on completing a set
      if (!wasCompleted) {
        setShowRestTimer(true);
      }
      return updated;
    });
  };

  // Adjust weight or reps
  const handleUpdateSetValue = (
    setIndex: number,
    field: 'actualWeightKg' | 'actualReps' | 'rpe',
    delta: number
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[currentExIndex] };
      const sets = [...ex.sets];
      const currentVal = sets[setIndex][field] || 0;
      const newVal = Math.max(0, currentVal + delta);
      sets[setIndex] = { ...sets[setIndex], [field]: newVal };
      ex.sets = sets;
      updated[currentExIndex] = ex;
      return updated;
    });
  };

  // Add extra set
  const handleAddSet = () => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[currentExIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet = {
        setNumber: ex.sets.length + 1,
        targetWeightKg: lastSet ? lastSet.actualWeightKg : 60,
        targetReps: lastSet ? lastSet.actualReps : 8,
        actualWeightKg: lastSet ? lastSet.actualWeightKg : 60,
        actualReps: lastSet ? lastSet.actualReps : 8,
        rpe: 8,
        completed: false,
      };
      ex.sets = [...ex.sets, newSet];
      updated[currentExIndex] = ex;
      return updated;
    });
  };

  const persistPayload = (endWeightKg?: number) => ({
    durationMinutes: Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000)),
    ...(endWeightKg ? { endWeightKg } : {}),
    exercises: exercises.map((item) => ({
      exerciseId: item.exercise.id,
      restSeconds: item.restSeconds,
      aiNote: item.aiNote,
      sets: item.sets,
    })),
  });

  const handleFinish = async (endWeightKg?: number) => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await fetch(`/api/workouts/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persistPayload(endWeightKg)),
      });
      const res = await fetch(`/api/workouts/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persistPayload(endWeightKg)),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to complete workout.');
      onFinishWorkout(json.data.summary);
    } catch (error) {
      console.error(error);
      setIsFinishing(false);
    }
  };

  const totalSetsCompletedAll = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );
  const totalSetsExpectedAll = exercises.reduce((acc, e) => acc + e.sets.length, 0);

  return (
    <div id="active-workout-tracker" className="space-y-5 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white"
            title="Exit workout"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45D483] animate-pulse" />
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                {workout.name}
              </h2>
            </div>
            <p className="text-xs text-[#9AA3A0]">
              Exercise {currentExIndex + 1} of {exercises.length} • {currentEx.name}
            </p>
          </div>
        </div>

        {/* Global Sets Progress */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-xs text-[#9AA3A0]">Overall Progress</span>
            <div className="text-xs font-bold text-[#B8F34A]">
              {totalSetsCompletedAll} / {totalSetsExpectedAll} sets
            </div>
          </div>

          <LoadingButton
            id="btn-active-finish-workout"
            onClick={() => setShowEndCheckin(true)}
            isLoading={isFinishing}
            loadingText="Completing..."
            className="px-4 py-2 shadow-[0_0_12px_rgba(184,243,74,0.3)]"
          >
            Finish Workout
          </LoadingButton>
        </div>
      </div>

      {/* Main Active Exercise Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Exercise Media & Visual Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#12161A] border border-[#252B30] rounded-2xl overflow-hidden p-4">
            <div className="relative w-full h-56 rounded-xl overflow-hidden bg-black/60 mb-3 border border-[#252B30]">
              <img
                src={currentEx.imageUrl}
                alt={currentEx.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-bold text-[#B8F34A] border border-[#B8F34A]/30">
                {currentEx.targetMuscle} • {currentEx.equipment}
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{currentEx.name}</h3>
                <p className="text-xs text-[#9AA3A0] mt-0.5">
                  Target: <strong className="text-white">{currentEx.targetMuscle}</strong> | Difficulty: {currentEx.difficulty}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#5DA9FF]/15 border border-[#5DA9FF]/40 text-[#5DA9FF] hover:bg-[#5DA9FF] hover:text-[#0B0D0F] font-bold text-xs flex items-center gap-1 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Swap
              </button>
            </div>

            {/* AI Real-time Form / Execution Note */}
            {currentExerciseData.aiNote && (
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/30 flex items-start gap-2.5 text-xs text-[#F5F7F2]">
                <Sparkles className="w-4 h-4 text-[#B8F34A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#B8F34A] block">FitForge AI Coaching Cue:</strong>
                  {currentExerciseData.aiNote}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Rest Timer */}
          <RestTimer
            initialSeconds={currentExerciseData.restSeconds}
            onComplete={() => console.log('Rest interval finished')}
          />
        </div>

        {/* Right Col: Interactive Set Logger Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#B8F34A]" />
                Live Set Tracking
              </h3>
              <button
                type="button"
                onClick={handleAddSet}
                className="text-xs text-[#B8F34A] hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Set
              </button>
            </div>

            {/* Sets Table */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-12 gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0]">
                <div className="col-span-2">Set</div>
                <div className="col-span-4 text-center">Weight (kg)</div>
                <div className="col-span-4 text-center">Reps</div>
                <div className="col-span-2 text-right">Done</div>
              </div>

              {currentExerciseData.sets.map((s, sIdx) => (
                <div
                  key={sIdx}
                  className={`grid grid-cols-12 gap-2 p-3 rounded-xl border items-center transition-all ${
                    s.completed
                      ? 'bg-[#181D22]/90 border-[#45D483]/50 shadow-sm'
                      : 'bg-[#181D22]/40 border-[#252B30]'
                  }`}
                >
                  {/* Set number */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0B0D0F] font-black text-xs text-white flex items-center justify-center">
                      {s.setNumber}
                    </span>
                  </div>

                  {/* Weight modifier */}
                  <div className="col-span-4 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(sIdx, 'actualWeightKg', -2.5)}
                      className="w-7 h-7 rounded-lg bg-[#12161A] border border-[#252B30] text-[#9AA3A0] hover:text-white flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-black text-white w-12 text-center">
                      {s.actualWeightKg}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(sIdx, 'actualWeightKg', 2.5)}
                      className="w-7 h-7 rounded-lg bg-[#12161A] border border-[#252B30] text-[#9AA3A0] hover:text-white flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Reps modifier */}
                  <div className="col-span-4 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(sIdx, 'actualReps', -1)}
                      className="w-7 h-7 rounded-lg bg-[#12161A] border border-[#252B30] text-[#9AA3A0] hover:text-white flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-black text-white w-8 text-center">
                      {s.actualReps}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(sIdx, 'actualReps', 1)}
                      className="w-7 h-7 rounded-lg bg-[#12161A] border border-[#252B30] text-[#9AA3A0] hover:text-white flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Complete Button */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      id={`btn-set-complete-${sIdx}`}
                      type="button"
                      onClick={() => handleToggleSet(sIdx)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        s.completed
                          ? 'bg-[#45D483] text-[#0B0D0F] shadow-[0_0_10px_rgba(69,212,131,0.5)]'
                          : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:border-[#B8F34A]'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Exercise Switchers */}
          <div className="mt-6 pt-4 border-t border-[#252B30] flex items-center justify-between gap-3">
            <button
              id="btn-prev-exercise"
              type="button"
              disabled={currentExIndex === 0}
              onClick={() => setCurrentExIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Exercise
            </button>

            {currentExIndex < exercises.length - 1 ? (
              <button
                id="btn-next-exercise"
                type="button"
                onClick={() => setCurrentExIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                Next Exercise <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <LoadingButton
                id="btn-final-finish-workout"
                onClick={() => setShowEndCheckin(true)}
                isLoading={isFinishing}
                loadingText="Completing..."
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="px-6 py-2.5 !bg-[#45D483] hover:!bg-[#5be698] shadow-[0_0_15px_rgba(69,212,131,0.4)]"
              >
                Complete Workout
              </LoadingButton>
            )}
          </div>
        </div>
      </div>

      {showEndCheckin && (
        <WorkoutCheckinModal
          workoutName={workout.name}
          latestWeightKg={0}
          isStart={false}
          onClose={() => setShowEndCheckin(false)}
          onStart={(weight) => {
            setShowEndCheckin(false);
            handleFinish(weight);
          }}
        />
      )}

      {swapModalOpen && (
        <SwapExerciseModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          sessionId={sessionId}
          exerciseId={currentEx.id || currentEx.exerciseId || ''}
          exerciseName={currentEx.name}
          targetMuscle={typeof currentEx.targetMuscle === 'string' ? currentEx.targetMuscle : currentEx.targetMuscles?.[0] || 'General'}
          equipment={typeof currentEx.equipment === 'string' ? currentEx.equipment : currentEx.equipments?.[0] || 'body weight'}
          onSwapCompleted={(newDto) => {
            if (newDto) {
              setExercises((prev) => {
                const updated = [...prev];
                const item = { ...updated[currentExIndex] };
                item.exercise = {
                  ...item.exercise,
                  name: newDto.name,
                  imageUrl: newDto.imageUrl || newDto.gifUrl || '',
                  gifUrl: newDto.gifUrl || newDto.imageUrl || '',
                  bodyParts: newDto.bodyParts || [newDto.bodyPart || 'General'],
                  equipments: newDto.equipments || [newDto.equipment || 'body weight'],
                  targetMuscles: newDto.targetMuscles || [newDto.targetMuscle || 'General'],
                  targetMuscle: newDto.targetMuscles?.[0] || newDto.targetMuscle || 'General',
                  equipment: newDto.equipments?.[0] || newDto.equipment || 'body weight',
                  instructions: newDto.instructions || [],
                };
                updated[currentExIndex] = item;
                return updated;
              });
            }
          }}
        />
      )}
    </div>
  );
};
