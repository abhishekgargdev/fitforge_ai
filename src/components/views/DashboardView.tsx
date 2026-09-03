'use client';

// Fields used: userProfile.weightKg, userProfile.bodyFatPercentage, userProfile.heightCm;
// loggedMeals.caloriesKcal, proteinGrams, carbsGrams, fatGrams;
// todayWorkout.durationMinutes, exercises[].exerciseName, sets, reps, targetWeightKg;
// progressHistory.date, weightKg, bodyFatPercentage, muscleMassKg, bmi;
// latestComposition (via BodySilhouetteVisualizer): overall.visceralFat, overall.bodyAge, overall.restingMetabolismKcal,
// trunk.fatPercentage, trunk.musclePercentage, arms.fatPercentage, arms.musclePercentage, legs.fatPercentage, legs.musclePercentage.

import React from 'react';
import {
  UserProfile,
  LoggedMealEntry,
  WorkoutTemplate,
  BodyCompositionDetails,
  ActiveNavTab,
} from '@/types';
import { OriginBadge } from '../common/OriginBadge';
import { BodySilhouetteVisualizer } from '../common/BodySilhouetteVisualizer';
import {
  Scale,
  Percent,
  Calculator,
  HeartPulse,
  Flame,
  Dumbbell,
  Play,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Zap,
  Trophy,
  Footprints,
} from 'lucide-react';
import { DailyActivityModal } from '../modals/DailyActivityModal';

interface DashboardViewProps {
  userProfile: UserProfile;
  metrics: {
    weightKg: number;
    weightDelta: number;
    weightProgressPct: number;
    targetWeightKg: number;
    bodyFatPercentage: number;
    fatDelta: number;
    bmi: number;
    bmiLabel: string;
    bodyAge: number;
    bodyAgeDelta: number;
  };
  loggedMeals: LoggedMealEntry[];
  nutritionGoals: {
    targetCaloriesKcal: number;
    targetProteinGrams: number;
    targetCarbsGrams: number;
    targetFatGrams: number;
  };
  todayWorkout: WorkoutTemplate;
  isRestDay?: boolean;
  isSkipped?: boolean;
  skipReason?: string;
  workoutFocus?: string;
  chartSeries: Array<{ label: string; value: number }>;
  range: "1m" | "3m" | "6m" | "1y" | "all";
  onRangeChange: (range: "1m" | "3m" | "6m" | "1y" | "all") => void;
  latestComposition: BodyCompositionDetails;
  previousComposition?: BodyCompositionDetails | null;
  insight: string;
  onNavigate: (tab: ActiveNavTab) => void;
  onStartWorkout: (workout: WorkoutTemplate) => void;
  onOpenFoodLogger: () => void;
  onOpenAIPlanner: () => void;
  onOpenAIAnalysis: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  metrics,
  loggedMeals,
  nutritionGoals,
  todayWorkout,
  isRestDay,
  isSkipped,
  skipReason,
  workoutFocus,
  chartSeries,
  range,
  onRangeChange,
  latestComposition,
  previousComposition,
  insight,
  onNavigate,
  onStartWorkout,
  onOpenFoodLogger,
  onOpenAIPlanner,
  onOpenAIAnalysis,
}) => {
  const [activityModalOpen, setActivityModalOpen] = React.useState(false);
  const totalCaloriesLogged = loggedMeals.reduce((acc, curr) => acc + curr.caloriesKcal, 0);
  const totalProteinLogged = loggedMeals.reduce((acc, curr) => acc + curr.proteinGrams, 0);
  const totalCarbsLogged = loggedMeals.reduce((acc, curr) => acc + curr.carbsGrams, 0);
  const totalFatLogged = loggedMeals.reduce((acc, curr) => acc + curr.fatGrams, 0);

  const targetCalories = Math.max(1, nutritionGoals.targetCaloriesKcal);
  const targetProtein = Math.max(1, nutritionGoals.targetProteinGrams);
  const targetCarbs = Math.max(1, nutritionGoals.targetCarbsGrams);
  const targetFat = Math.max(1, nutritionGoals.targetFatGrams);

  const circumference = 2 * Math.PI * 45;
  const caloriePercent = Math.min(totalCaloriesLogged / targetCalories, 1);
  const strokeDashoffset = circumference * (1 - caloriePercent);

  const chartPoints = chartSeries.map((item, idx) => ({
    label: item.label,
    val: item.value,
    index: idx,
  }));
  const values = chartPoints.map((p) => p.val);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 1;
  const valueRange = maxVal - minVal || 1;

  // SVG Chart path calculation
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 20;

  const pointsString =
    chartPoints.length > 0
      ? chartPoints
          .map((p, idx) => {
            const divisor = Math.max(chartPoints.length - 1, 1);
            const x = padding + (idx / divisor) * (svgWidth - padding * 2);
            const y = svgHeight - padding - ((p.val - minVal) / valueRange) * (svgHeight - padding * 2);
            return `${x},${y}`;
          })
          .join(' ')
      : `${padding},${svgHeight - padding}`;

  const areaPath = `M ${padding},${svgHeight - padding} L ${pointsString.replace(/,/g, ' ')} L ${svgWidth - padding},${svgHeight - padding} Z`;

  return (
    <div id="dashboard-container" className="space-y-6 animate-in fade-in duration-300">
      {/* 4 Top Metric Cards with strict Origin Badges & Elegant Dark styling */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Weight Card */}
        <div
          id="metric-card-weight"
          className="bg-[#12161A] p-5 rounded-2xl border border-[#252B30] relative overflow-hidden group hover:border-[#B8F34A]/40 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-[#9AA3A0] font-bold">Weight</p>
              <OriginBadge origin="MEASURED" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                {metrics.weightKg}
                <span className="text-sm ml-1 font-medium text-[#9AA3A0]">kg</span>
              </span>
              <span className="text-[#45D483] text-sm flex items-center font-semibold">
                {metrics.weightDelta === 0 ? '—' : `${metrics.weightDelta > 0 ? '↑' : '↓'} ${Math.abs(metrics.weightDelta)}kg`}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-[#252B30] rounded-full overflow-hidden">
              <div className="h-full bg-[#B8F34A] rounded-full transition-all duration-500" style={{ width: `${metrics.weightProgressPct}%` }} />
            </div>
            <p className="text-[10px] text-[#9AA3A0] mt-1.5 flex items-center justify-between">
              <span>Goal: {metrics.targetWeightKg} kg</span>
              <span className="text-[#B8F34A] font-semibold">{metrics.weightProgressPct}% to target</span>
            </p>
          </div>
        </div>

        {/* Body Fat Card */}
        <div
          id="metric-card-bodyfat"
          className="bg-[#12161A] p-5 rounded-2xl border border-[#252B30] relative overflow-hidden group hover:border-[#B8F34A]/40 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-[#9AA3A0] font-bold">Body Fat</p>
              <OriginBadge origin="MEASURED" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                {metrics.bodyFatPercentage}
                <span className="text-sm ml-1 font-medium text-[#9AA3A0]">%</span>
              </span>
              <span className="text-[#45D483] text-sm flex items-center font-semibold">
                {metrics.fatDelta === 0 ? '—' : `${metrics.fatDelta > 0 ? '↑' : '↓'} ${Math.abs(metrics.fatDelta)}%`}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-[#252B30] rounded-full overflow-hidden">
              <div className="h-full bg-[#5DA9FF] rounded-full transition-all duration-500" style={{ width: '68%' }} />
            </div>
            <p className="text-[10px] text-[#9AA3A0] mt-1.5">Measured via smart scale & DEXA calibration</p>
          </div>
        </div>

        {/* BMI Card */}
        <div
          id="metric-card-bmi"
          className="bg-[#12161A] p-5 rounded-2xl border border-[#252B30] relative overflow-hidden group hover:border-[#B8F34A]/40 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-[#9AA3A0] font-bold">BMI</p>
              <OriginBadge origin="CALCULATED" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                {metrics.bmi.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-[#B8F34A] px-2 py-0.5 rounded-full bg-[#B8F34A]/10 border border-[#B8F34A]/20">
                {metrics.bmiLabel}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-[#252B30] rounded-full overflow-hidden">
              <div className="h-full bg-[#B8F34A] rounded-full transition-all duration-500" style={{ width: '58%' }} />
            </div>
            <p className="text-[10px] text-[#9AA3A0] mt-1.5">Calculated • Height: {userProfile.heightCm} cm</p>
          </div>
        </div>

        {/* Body Age Card */}
        <div
          id="metric-card-bodyage"
          className="bg-[#12161A] p-5 rounded-2xl border border-[#252B30] relative overflow-hidden group hover:border-[#B8F34A]/40 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-[#9AA3A0] font-bold">Body Age</p>
              <OriginBadge origin="CALCULATED" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-[#B8F34A] tracking-tight">{metrics.bodyAge}</span>
              <span className="text-[#45D483] text-sm font-semibold">
                {metrics.bodyAgeDelta === 0
                  ? 'vs age'
                  : `${metrics.bodyAgeDelta > 0 ? '-' : '+'}${Math.abs(metrics.bodyAgeDelta)} yrs`}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-[#252B30] rounded-full overflow-hidden">
              <div className="h-full bg-[#B8F34A] rounded-full transition-all duration-500" style={{ width: '85%' }} />
            </div>
            <p className="text-[10px] text-[#45D483] mt-1.5 flex items-center gap-1 font-medium">
              <HeartPulse className="w-3 h-3" /> Improving metabolic trend
            </p>
          </div>
        </div>
      </section>

      {/* 2-Column Section: Today's Nutrition & Today's Workout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Nutrition Card with circular SVG ring */}
        <div
          id="card-daily-nutrition"
          className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg text-white">Today's Nutrition</h3>
                <p className="text-xs text-[#9AA3A0]">Caloric balance & macro targets</p>
              </div>
              <OriginBadge origin="CALCULATED" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 my-2">
              {/* Circular SVG Calorie Gauge */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#252B30" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#B8F34A"
                    strokeWidth="8"
                    strokeDasharray="282.7"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {totalCaloriesLogged.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9AA3A0] font-bold">
                    / {targetCalories.toLocaleString()} KCAL
                  </span>
                </div>
              </div>

              {/* Macro Linear Progress Bars */}
              <div className="flex-1 w-full space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">Protein</span>
                    <span className="text-[#9AA3A0] font-mono">
                      {Math.round(totalProteinLogged)}g / {targetProtein}g
                    </span>
                  </div>
                  <div className="h-2 bg-[#252B30] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5DA9FF] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalProteinLogged / targetProtein) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">Carbs</span>
                    <span className="text-[#9AA3A0] font-mono">
                      {Math.round(totalCarbsLogged)}g / {targetCarbs}g
                    </span>
                  </div>
                  <div className="h-2 bg-[#252B30] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F5B942] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalCarbsLogged / targetCarbs) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">Fats</span>
                    <span className="text-[#9AA3A0] font-mono">
                      {Math.round(totalFatLogged)}g / {targetFat}g
                    </span>
                  </div>
                  <div className="h-2 bg-[#252B30] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F05D5E] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalFatLogged / targetFat) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#252B30] flex items-center justify-between">
            <button
              id="btn-dash-open-nutrition-planner"
              onClick={onOpenAIPlanner}
              className="text-xs font-bold text-[#9AA3A0] hover:text-[#B8F34A] flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#B8F34A]" />
              Generate Meal Plan
            </button>
            <button
              id="btn-dash-log-food"
              onClick={onOpenFoodLogger}
              className="px-4 py-2 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log Food
            </button>
          </div>
        </div>

        {/* Today's Workout Card */}
        <div
          id="card-todays-workout"
          className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] overflow-hidden flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Today's Workout</h3>
                <p className="text-xs text-[#9AA3A0]">
                  {isRestDay
                    ? 'Scheduled rest'
                    : `${todayWorkout.durationMinutes} min session • ${workoutFocus || todayWorkout.category}`}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                  isSkipped
                    ? 'bg-[#FF5C5C]/10 text-[#FF8E8E] border-[#FF5C5C]/30'
                    : isRestDay
                      ? 'bg-[#B8F34A]/10 text-[#B8F34A] border-[#B8F34A]/20'
                      : 'bg-[#B8F34A]/10 text-[#B8F34A] border-[#B8F34A]/20'
                }`}
              >
                {isSkipped ? 'SKIPPED' : isRestDay ? 'REST' : todayWorkout.category}
              </span>
            </div>

            {isSkipped && skipReason && (
              <p className="text-[11px] text-[#FF8E8E] mb-3">
                Reason: {skipReason}
              </p>
            )}

            {/* List of exercises */}
            <div className="space-y-2.5 my-2">
              {(todayWorkout.exercises || []).slice(0, 3).map((ex, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3.5 p-2.5 bg-[#181D22] rounded-xl border border-[#252B30] transition-colors ${
                    idx === 0 ? 'border-[#B8F34A]/30' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-[#252B30] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-[#9AA3A0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{ex.exerciseName}</p>
                    <p className="text-xs text-[#9AA3A0]">
                      {ex.sets} sets • {ex.reps} reps {ex.targetWeightKg ? `• ${ex.targetWeightKg} kg` : ''}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#252B30] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#B8F34A]/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center gap-3">
            <button
              id="btn-dash-view-workout-plan"
              onClick={() => onNavigate('workouts')}
              className="px-3 py-2.5 rounded-xl border border-[#252B30] text-xs font-semibold text-[#9AA3A0] hover:text-white hover:bg-[#181D22] transition-colors"
            >
              All Workouts
            </button>
            {isSkipped ? (
              <button
                id="btn-dash-skipped-workout"
                disabled
                className="flex-1 bg-[#181D22] border border-[#FF5C5C]/30 text-[#FF8E8E] py-3 rounded-2xl font-bold tracking-tight text-xs uppercase flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
              >
                <Footprints className="w-4 h-4" />
                DAY SKIPPED
              </button>
            ) : isRestDay ? (
              <button
                id="btn-dash-log-rest-activity"
                onClick={() => setActivityModalOpen(true)}
                className="flex-1 bg-[#181D22] border border-[#B8F34A]/40 text-[#B8F34A] hover:bg-[#B8F34A] hover:text-[#0B0D0F] py-3 rounded-2xl font-bold tracking-tight text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Footprints className="w-4 h-4" />
                LOG TODAY'S ACTIVITY
              </button>
            ) : (
              <button
                id="btn-dash-start-workout"
                onClick={() => todayWorkout.id && onStartWorkout(todayWorkout)}
                disabled={!todayWorkout.id}
                className="flex-1 bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] py-3 rounded-2xl font-bold tracking-tight text-xs uppercase flex items-center justify-center gap-2 shadow-[0_2px_14px_rgba(184,243,74,0.25)] transition-all hover:scale-[1.01] disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-current" />
                START WORKOUT
              </button>
            )}
          </div>
        </div>

        <DailyActivityModal
          isOpen={activityModalOpen}
          onClose={() => setActivityModalOpen(false)}
        />
      </section>

      {/* Recovery Protocol Quick Card */}
      <section className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#B8F34A]/10 border border-[#B8F34A]/30 text-[#B8F34A] flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Daily Recovery & Regeneration Protocol</h3>
              <OriginBadge origin="AI_RECOMMENDATION" />
            </div>
            <p className="text-xs text-[#9AA3A0] mt-0.5">
              Hydration, contrast therapy, static stretching, and sleep optimization guidance.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('recovery')}
          className="px-4 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] hover:border-[#B8F34A] text-[#F5F7F2] hover:text-white text-xs font-bold flex items-center gap-2 transition-all shrink-0"
        >
          View Today's Recovery <ArrowRight className="w-4 h-4 text-[#B8F34A]" />
        </button>
      </section>

      {/* AI Fitness Insight & Progress Trend Section */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Fitness Insight (3 cols) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#12161A] to-[#181D22] p-6 rounded-3xl border border-[#B8F34A]/20 relative overflow-hidden flex flex-col justify-between shadow-lg">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8F34A]/5 blur-3xl rounded-full pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-3 text-[#B8F34A]">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">AI Fitness Insight</span>
            </div>

            <p className="text-base sm:text-lg leading-relaxed mb-4 text-[#F5F7F2] font-medium">
              {insight}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#252B30]/60">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#12161A] bg-[#252B30] flex items-center justify-center text-xs shadow-sm">
                🔥
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#12161A] bg-[#252B30] flex items-center justify-center text-xs shadow-sm">
                📈
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#12161A] bg-[#B8F34A]/20 text-[#B8F34A] flex items-center justify-center text-xs font-bold shadow-sm">
                AI
              </div>
            </div>

            <button
              id="btn-dash-view-full-ai-analysis"
              onClick={onOpenAIAnalysis}
              className="text-xs font-bold text-[#B8F34A] hover:underline flex items-center gap-1.5 transition-all"
            >
              View Full Analysis →
            </button>
          </div>
        </div>

        {/* Progress Trend mini preview (2 cols) */}
        <div className="lg:col-span-2 bg-[#12161A] p-6 rounded-3xl border border-[#252B30] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white">Progress Trend</h3>
                <span className="text-[10px] text-[#9AA3A0]">Weight Trajectory (kg)</span>
              </div>
              <select
                value={range}
                onChange={(e) => onRangeChange(e.target.value as typeof range)}
                className="bg-[#0B0D0F] border border-[#252B30] text-[10px] text-[#F5F7F2] rounded-lg px-2.5 py-1 outline-none focus:border-[#B8F34A]"
              >
                <option value="1m">Last month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Vertical Bar Chart Graphic */}
            <div className="h-28 flex items-end justify-between gap-2 px-1 pt-4">
              {(chartPoints.slice(-5).length ? chartPoints.slice(-5) : []).map((point, idx, arr) => {
                const barMax = Math.max(...arr.map((p) => p.val), 1);
                const height = Math.max(12, Math.round((point.val / barMax) * 100));
                const isLast = idx === arr.length - 1;
                return (
                  <div
                    key={`${point.label}-${idx}`}
                    className="w-full bg-[#B8F34A]/10 rounded-t-md relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className={`absolute bottom-0 w-full h-full rounded-t-md ${
                        isLast ? 'bg-[#B8F34A]' : 'bg-[#B8F34A]/30 group-hover:bg-[#B8F34A]/50'
                      }`}
                    />
                    <span
                      className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono ${
                        isLast ? 'text-[#B8F34A] font-bold opacity-100' : 'text-[#9AA3A0] opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {point.val}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-2 text-[10px] text-[#9AA3A0] uppercase font-bold tracking-widest px-1">
              {chartPoints.slice(-5).map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('progress')}
            className="mt-4 pt-3 border-t border-[#252B30] text-[11px] font-bold text-[#9AA3A0] hover:text-[#B8F34A] flex items-center justify-between transition-colors"
          >
            <span>Detailed Bio-Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Segmental Body Composition Visualizer */}
      <BodySilhouetteVisualizer
        composition={latestComposition}
        previousComposition={previousComposition}
        chronologicalAge={userProfile.age}
      />
    </div>
  );
};
