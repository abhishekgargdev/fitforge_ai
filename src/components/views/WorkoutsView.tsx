'use client';

// Fields used: currentSplit.title, daysPerWeek, days[].dayName, days[].isRestDay, days[].focus,
// days[].workout.name, durationMinutes, muscleGroups, exercises[].exerciseName, sets, reps, restSeconds, aiNote.

import React, { useState } from 'react';
import { WorkoutTemplate, WorkoutSplitSchedule, ActiveNavTab } from '@/types';
import { OriginBadge } from '../common/OriginBadge';
import {
  Dumbbell,
  Play,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  ChevronRight,
  Flame,
  CheckCircle2,
  Trophy,
  History as HistoryIcon,
  Lock,
  Unlock,
  Info,
  Footprints,
  RefreshCw,
} from 'lucide-react';
import { DailyActivityModal } from '../modals/DailyActivityModal';
import { SwapExerciseModal } from '../modals/SwapExerciseModal';
import { AddExerciseToPlanModal } from '../modals/AddExerciseToPlanModal';

interface WorkoutsViewProps {
  currentSplit: WorkoutSplitSchedule;
  personalRecords: Array<{ exercise: string; weight: string; reps: string; date: string }>;
  recentHistory: Array<{
    id: string;
    title: string;
    date: string;
    duration: string;
    volume: string;
    sets: number;
  }>;
  onStartWorkout: (workout: WorkoutTemplate, dayIndex: number) => void;
  onOpenAIPlanner: () => void;
  onNavigate: (tab: ActiveNavTab) => void;
  onRefreshSplit?: () => void;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  currentSplit,
  personalRecords,
  recentHistory,
  onStartWorkout,
  onOpenAIPlanner,
  onNavigate,
  onRefreshSplit,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [lockingDay, setLockingDay] = useState<string | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [addExercisePlanOpen, setAddExercisePlanOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{
    exerciseId: string;
    exerciseName: string;
    targetMuscle: string;
    equipment: string;
  } | null>(null);

  const weekdayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayName = weekdayOrder[new Date().getDay()];
  const formatDayDate = (dayName: string) => {
    const today = new Date();
    const dayIndex = weekdayOrder.indexOf(dayName) >= 0 ? weekdayOrder.indexOf(dayName) : today.getDay();
    const target = new Date(today);
    target.setHours(0, 0, 0, 0);
    target.setDate(today.getDate() + (dayIndex - today.getDay()));
    return target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const firstTrainingIndex = currentSplit.days.findIndex((day) => !day.isRestDay && day.workout);
  const todayIndex = currentSplit.days.findIndex((day) => {
    const normalized = day.dayName?.toLowerCase() ?? '';
    const todayKey = todayName.toLowerCase();
    return normalized === todayKey || normalized.startsWith(todayKey);
  });
  const defaultSelectedIndex = todayIndex >= 0 ? todayIndex : (firstTrainingIndex >= 0 ? firstTrainingIndex : 0);

  React.useEffect(() => {
    setSelectedDayIndex(defaultSelectedIndex);
  }, [defaultSelectedIndex]);

  const todayWorkout = currentSplit.days[defaultSelectedIndex]?.workout;
  const selectedDay = currentSplit.days[selectedDayIndex];
  const isManualMode = currentSplit.planMode === 'manual';

  const handleToggleLock = async (dayName: string, exerciseId?: string, currentLocked?: boolean) => {
    if (!currentSplit.id) return;
    setLockingDay(dayName);
    try {
      await fetch(`/api/workout-plans/${currentSplit.id}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayName,
          exerciseId,
          locked: !currentLocked,
        }),
      });
      if (onRefreshSplit) onRefreshSplit();
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    } finally {
      setLockingDay(null);
    }
  };

  const handleToggleSkipDay = async (dayName: string, currentSkipped?: boolean) => {
    if (!currentSplit.id) return;

    const reason = window.prompt(
      currentSkipped ? 'What is the reason for restoring this day?' : 'Why are you skipping this workout day?',
      currentSkipped ? 'Recovered / rescheduled' : 'Travel / recovery / schedule'
    );

    try {
      await fetch(`/api/workout-plans/${currentSplit.id}/days/${encodeURIComponent(dayName)}/skip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skipped: !currentSkipped,
          reason: reason?.trim() || (currentSkipped ? 'Restored by user' : 'Skipped by user'),
        }),
      });
      if (onRefreshSplit) onRefreshSplit();
    } catch (err) {
      console.error('Failed to toggle day skip:', err);
    }
  };

  return (
    <div id="workouts-view" className="space-y-6 animate-in fade-in">
      {/* Manual Mode Explanation Banner */}
      {isManualMode && (
        <div className="bg-[#5DA9FF]/10 border border-[#5DA9FF]/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-[#5DA9FF]">
          <Info className="w-5 h-5 shrink-0" />
          <span>
            <strong>Manual Mode Active:</strong> AI won't change your plan while manual mode is on — switch back in Settings to let it adapt again.
          </span>
        </div>
      )}

      {/* Top Header & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Workout Planner & Engine
            </h2>
            <OriginBadge origin={isManualMode ? "MEASURED" : "AI_RECOMMENDATION"} />
          </div>
          <p className="text-xs text-[#9AA3A0] mt-1">
            Active Split: <strong className="text-white">{currentSplit.title}</strong> • {isManualMode ? "Manual Control Mode" : "Periodized for maximum hypertrophy"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isManualMode ? (
            <button
              id="btn-workouts-ai-planner"
              type="button"
              onClick={onOpenAIPlanner}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8F34A]/20 to-[#5DA9FF]/20 border border-[#B8F34A]/40 text-[#F5F7F2] hover:border-[#B8F34A] text-xs font-bold flex items-center gap-2 transition-all shadow-sm group"
            >
              <Sparkles className="w-4 h-4 text-[#B8F34A] group-hover:rotate-12 transition-transform" />
              Generate with AI
            </button>
          ) : (
            <button
              disabled
              title="Switch to AI Adaptive mode in Settings to enable AI generation"
              className="px-4 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-[#9AA3A0]/60 text-xs font-bold flex items-center gap-2 cursor-not-allowed opacity-60"
            >
              <Lock className="w-3.5 h-3.5" />
              Manual Mode Active
            </button>
          )}
          <button
            id="btn-workouts-start-today"
            type="button"
            disabled={Boolean(currentSplit.days[defaultSelectedIndex]?.skipped) || !todayWorkout}
            onClick={() => todayWorkout && onStartWorkout(todayWorkout, defaultSelectedIndex)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(184,243,74,0.3)] transition-all hover:scale-105 ${
              currentSplit.days[defaultSelectedIndex]?.skipped || !todayWorkout
                ? 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] cursor-not-allowed opacity-60'
                : 'bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {currentSplit.days[defaultSelectedIndex]?.skipped ? "Today's Session Skipped" : "Start Today's Session"}
          </button>
        </div>
      </div>

      {/* Weekly Split Schedule Bar */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B8F34A]" />
            Weekly Schedule ({currentSplit.title})
          </h3>
          <span className="text-xs text-[#9AA3A0]">Click day to inspect or toggle lock</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {currentSplit.days.map((dayItem, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isRest = dayItem.isRestDay;
            const isDayLocked = Boolean(dayItem.locked);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative group ${
                  isSelected
                    ? 'bg-[#181D22] border-[#B8F34A] shadow-md ring-1 ring-[#B8F34A]/30'
                    : isRest
                    ? 'bg-[#0B0D0F]/40 border-[#252B30]/60 opacity-70 hover:opacity-100'
                    : 'bg-[#181D22]/60 border-[#252B30] hover:border-[#9AA3A0]/40'
                } ${dayItem.skipped ? 'opacity-85 border-[#FF5C5C]/50' : ''}`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{dayItem.dayName ?? dayItem.day}</span>
                    {dayItem.intensityLevel && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase tracking-wider ${
                          dayItem.intensityLevel === 'light'
                            ? 'bg-[#5DA9FF]/15 text-[#5DA9FF] border-[#5DA9FF]/30'
                            : dayItem.intensityLevel === 'hard'
                            ? 'bg-[#FF5C5C]/15 text-[#FF5C5C] border-[#FF5C5C]/30'
                            : 'bg-[#B8F34A]/15 text-[#B8F34A] border-[#B8F34A]/30'
                        }`}
                      >
                        {dayItem.intensityLevel}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLock(dayItem.dayName, undefined, isDayLocked);
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${
                      isDayLocked ? 'text-[#F5B942]' : 'text-[#9AA3A0] opacity-40 group-hover:opacity-100'
                    }`}
                    title={isDayLocked ? 'Day locked against AI changes' : 'Lock day'}
                  >
                    {isDayLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-[10px] text-[#9AA3A0] mt-1">
                  {formatDayDate(dayItem.dayName ?? dayItem.day ?? 'Mon')}
                </div>

                {dayItem.skipped ? (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#FF8E8E]">Skipped</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSkipDay(dayItem.dayName, true);
                      }}
                      className="px-1.5 py-0.5 rounded bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-[#FF8E8E] text-[9px] font-bold"
                    >
                      Restore
                    </button>
                  </div>
                ) : isRest ? (
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#9AA3A0] block">Active Recovery</span>
                      <span className="text-[10px] text-[#9AA3A0]/60">Mobility & Walk</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityModalOpen(true);
                      }}
                      className="px-2 py-1 rounded bg-[#B8F34A]/10 border border-[#B8F34A]/30 text-[#B8F34A] hover:bg-[#B8F34A] hover:text-[#0B0D0F] text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      <Footprints className="w-3 h-3" /> Log
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <span className="text-xs font-bold text-white block truncate">
                      {dayItem.workout?.name.split(' ')[0]} {dayItem.workout?.name.split(' ')[1]}
                    </span>
                    <span className="text-[10px] text-[#B8F34A] block">
                      {dayItem.workout?.exercises.length} exercises • {dayItem.workout?.durationMinutes}m
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Expanded Detail Card */}
        {currentSplit.days[selectedDayIndex]?.workout && (
          <div className="mt-5 pt-5 border-t border-[#252B30] bg-[#0B0D0F]/40 rounded-xl p-4 border border-[#252B30]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-white">
                    {currentSplit.days[selectedDayIndex].dayName ?? currentSplit.days[selectedDayIndex].day} — {currentSplit.days[selectedDayIndex].workout?.name}
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#B8F34A]/15 text-[#B8F34A]">
                    {currentSplit.days[selectedDayIndex].workout?.durationMinutes} min
                  </span>
                  {currentSplit.days[selectedDayIndex].skipped && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5C5C]/15 text-[#FF8E8E] border border-[#FF5C5C]/30">
                      Skipped
                    </span>
                  )}
                  {currentSplit.days[selectedDayIndex].intensityLevel && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        currentSplit.days[selectedDayIndex].intensityLevel === 'light'
                          ? 'bg-[#5DA9FF]/15 text-[#5DA9FF] border-[#5DA9FF]/30'
                          : currentSplit.days[selectedDayIndex].intensityLevel === 'hard'
                          ? 'bg-[#FF5C5C]/15 text-[#FF5C5C] border-[#FF5C5C]/30'
                          : 'bg-[#B8F34A]/15 text-[#B8F34A] border-[#B8F34A]/30'
                      }`}
                    >
                      Pacing: {currentSplit.days[selectedDayIndex].intensityLevel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9AA3A0] mt-0.5">
                  {currentSplit.days[selectedDayIndex].workout?.muscleGroups?.join(', ') ||
                    currentSplit.days[selectedDayIndex].workout?.targetMuscles?.join(', ') ||
                    'Targeted Muscle Groups'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedDay?.skipped && (
                  <button
                    type="button"
                    onClick={() => handleToggleSkipDay(String(selectedDay.dayName), true)}
                    className="px-3 py-2 rounded-xl border border-[#FF5C5C]/35 bg-[#FF5C5C]/10 text-[#FF8E8E] text-xs font-bold"
                  >
                    Restore Day
                  </button>
                )}
                <button
                  type="button"
                  disabled={Boolean(selectedDay?.skipped) || selectedDay?.isRestDay}
                  onClick={() =>
                    currentSplit.days[selectedDayIndex].workout &&
                    !selectedDay?.skipped &&
                    onStartWorkout(currentSplit.days[selectedDayIndex].workout!, selectedDayIndex)
                  }
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm ${
                    selectedDay?.skipped || selectedDay?.isRestDay
                      ? 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] cursor-not-allowed opacity-60'
                      : 'bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {selectedDay?.skipped ? 'Day Skipped' : 'Launch This Session'}
                </button>
              </div>
            </div>

            {/* Exercises Grid with Swap, Reorder, & Lock Controls */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0]">
                Day Movements Sequence ({currentSplit.days[selectedDayIndex].workout?.exercises.length} Exercises)
              </span>
              <button
                type="button"
                onClick={() => setAddExercisePlanOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#5DA9FF]/15 border border-[#5DA9FF]/40 text-[#5DA9FF] hover:bg-[#5DA9FF] hover:text-[#0B0D0F] font-bold text-xs flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentSplit.days[selectedDayIndex].workout?.exercises.map((ex, exIdx) => {
                const isExLocked = Boolean(ex.locked);
                const currentDayName = currentSplit.days[selectedDayIndex].dayName;
                const totalExCount = currentSplit.days[selectedDayIndex].workout?.exercises.length || 0;

                const handleMoveExercise = async (dir: 'up' | 'down') => {
                  const exercises = [...(currentSplit.days[selectedDayIndex].workout?.exercises || [])];
                  const targetIdx = dir === 'up' ? exIdx - 1 : exIdx + 1;
                  if (targetIdx < 0 || targetIdx >= exercises.length) return;
                  const temp = exercises[exIdx];
                  exercises[exIdx] = exercises[targetIdx];
                  exercises[targetIdx] = temp;
                  const exerciseOrder = exercises.map((e: any) => String(e.exerciseId || e.exerciseName));

                  try {
                    await fetch(`/api/workout-plans/${currentSplit.id}/days/${currentDayName}/exercises`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ exerciseOrder }),
                    });
                    if (onRefreshSplit) onRefreshSplit();
                  } catch (err) {
                    console.error('Failed to reorder exercises:', err);
                  }
                };

                return (
                  <div
                    key={exIdx}
                    className={`p-3 rounded-xl border flex items-start justify-between text-xs transition-all ${
                      isExLocked ? 'bg-[#181D22] border-[#F5B942]/40' : 'bg-[#181D22] border-[#252B30]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <span className="w-6 h-6 rounded-lg bg-[#0B0D0F] text-[#B8F34A] font-bold flex items-center justify-center text-[11px]">
                          {exIdx + 1}
                        </span>
                        {/* Reorder Up / Down buttons */}
                        <div className="flex flex-col gap-0.5 mt-1">
                          <button
                            type="button"
                            disabled={exIdx === 0}
                            onClick={() => handleMoveExercise('up')}
                            className="p-0.5 rounded text-[#9AA3A0] hover:text-white disabled:opacity-20 text-[9px]"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={exIdx === totalExCount - 1}
                            onClick={() => handleMoveExercise('down')}
                            className="p-0.5 rounded text-[#9AA3A0] hover:text-white disabled:opacity-20 text-[9px]"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white block truncate">{ex.exerciseName}</span>
                          {isExLocked && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5B942]/15 text-[#F5B942] font-semibold">
                              Locked
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#9AA3A0] block mt-0.5">
                          {ex.sets} Sets × {ex.reps} Reps • {ex.restSeconds}s rest • <span className="capitalize">{ex.equipment || 'body weight'}</span>
                        </span>
                        {ex.aiNote && (
                          <span className="text-[10px] text-[#B8F34A] block mt-0.5 truncate">
                            💡 {ex.aiNote}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {ex.exerciseId && (
                        <a
                          href={`/exercises/${ex.exerciseId}`}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border bg-[#B8F34A]/10 border-[#B8F34A]/30 text-[#B8F34A] hover:bg-[#B8F34A] hover:text-[#0B0D0F] transition-all"
                          title="View exercise guide"
                        >
                          View
                        </a>
                      )}

                      <button
                        type="button"
                        disabled={isExLocked}
                        onClick={() =>
                          setSwapTarget({
                            exerciseId: String(ex.exerciseId || ex.exerciseName),
                            exerciseName: ex.exerciseName,
                            targetMuscle: ex.targetMuscle || 'General',
                            equipment: ex.equipment || 'body weight',
                          })
                        }
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                          isExLocked
                            ? 'bg-[#181D22] border-[#252B30] text-[#9AA3A0]/40 cursor-not-allowed'
                            : 'bg-[#5DA9FF]/10 border-[#5DA9FF]/30 text-[#5DA9FF] hover:bg-[#5DA9FF] hover:text-[#0B0D0F]'
                        }`}
                        title={isExLocked ? 'Unlock exercise first to swap' : 'Swap exercise with AI'}
                      >
                        <RefreshCw className="w-3 h-3" /> Swap
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleLock(currentDayName, ex.exerciseId, isExLocked)}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                          isExLocked ? 'text-[#F5B942]' : 'text-[#9AA3A0] opacity-40 hover:opacity-100'
                        }`}
                        title={isExLocked ? 'Exercise locked against AI changes' : 'Lock exercise'}
                      >
                        {isExLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column: Personal Records & Recent Workout Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Personal Records (5 cols) */}
        <div className="lg:col-span-5 bg-[#12161A] border border-[#252B30] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F5B942]/15 text-[#F5B942] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Personal Records (PRs)</h3>
                  <p className="text-xs text-[#9AA3A0]">Peak mechanical output</p>
                </div>
              </div>
              <OriginBadge origin="MEASURED" />
            </div>

            <div className="space-y-2.5">
              {personalRecords.length === 0 && (
                <p className="text-xs text-[#9AA3A0]">No measured PRs yet. Complete a session to log them.</p>
              )}
              {personalRecords.map((pr, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{pr.exercise}</span>
                    <span className="text-[10px] text-[#9AA3A0]">{pr.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#B8F34A] text-sm block">{pr.weight}</span>
                    <span className="text-[10px] text-[#9AA3A0]">{pr.reps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#252B30] text-center">
            <span className="text-[11px] text-[#9AA3A0]">
              +4 new records set in the last 30 days
            </span>
          </div>
        </div>

        {/* Recent Workouts Log (7 cols) */}
        <div className="lg:col-span-7 bg-[#12161A] border border-[#252B30] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5DA9FF]/15 text-[#5DA9FF] flex items-center justify-center">
                  <HistoryIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Completed Workout History</h3>
                  <p className="text-xs text-[#9AA3A0]">Logged sessions & training adherence</p>
                </div>
              </div>
              <OriginBadge origin="MEASURED" />
            </div>

            <div className="space-y-2.5">
              {recentHistory.length === 0 && (
                <p className="text-xs text-[#9AA3A0]">No completed sessions yet.</p>
              )}
              {recentHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B0D0F] border border-[#252B30] text-[#45D483] flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-sm">{item.title}</span>
                      <span className="text-[11px] text-[#9AA3A0]">{item.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block font-mono">{item.volume}</span>
                    <span className="text-[10px] text-[#9AA3A0]">
                      {item.duration} • {item.sets} sets
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#252B30] flex items-center justify-between">
            <span className="text-xs text-[#45D483] font-semibold">
              {recentHistory.length} logged session{recentHistory.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => onNavigate('exercises')}
              className="text-xs text-[#B8F34A] hover:underline font-bold flex items-center gap-1"
            >
              Browse Exercise Library <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <DailyActivityModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />

      {swapTarget && (
        <SwapExerciseModal
          isOpen={Boolean(swapTarget)}
          onClose={() => setSwapTarget(null)}
          planId={currentSplit.id}
          dayId={currentSplit.days[selectedDayIndex]?.dayName}
          exerciseId={swapTarget.exerciseId}
          exerciseName={swapTarget.exerciseName}
          targetMuscle={swapTarget.targetMuscle}
          equipment={swapTarget.equipment}
          onSwapCompleted={() => {
            if (onRefreshSplit) onRefreshSplit();
          }}
        />
      )}

      {currentSplit.id && currentSplit.days[selectedDayIndex] && (
        <AddExerciseToPlanModal
          isOpen={addExercisePlanOpen}
          onClose={() => setAddExercisePlanOpen(false)}
          planId={currentSplit.id}
          dayId={currentSplit.days[selectedDayIndex].dayName}
          dayName={currentSplit.days[selectedDayIndex].dayName}
          onSuccess={() => {
            if (onRefreshSplit) onRefreshSplit();
          }}
        />
      )}
    </div>
  );
};
