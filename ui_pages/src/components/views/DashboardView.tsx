import React, { useState } from 'react';
import {
  UserProfile,
  LoggedMealEntry,
  WorkoutTemplate,
  MetricEntry,
  BodyCompositionDetails,
  ActiveNavTab,
} from '../../types';
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
  Calendar,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserProfile;
  loggedMeals: LoggedMealEntry[];
  todayWorkout: WorkoutTemplate;
  progressHistory: MetricEntry[];
  latestComposition: BodyCompositionDetails;
  onNavigate: (tab: ActiveNavTab) => void;
  onStartWorkout: (workout: WorkoutTemplate) => void;
  onOpenFoodLogger: () => void;
  onOpenAIPlanner: () => void;
  onOpenAIAnalysis: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  loggedMeals,
  todayWorkout,
  progressHistory,
  latestComposition,
  onNavigate,
  onStartWorkout,
  onOpenFoodLogger,
  onOpenAIPlanner,
  onOpenAIAnalysis,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'weight' | 'fat' | 'muscle' | 'bmi'>('weight');
  const [timeFilter, setTimeFilter] = useState<'1M' | '3M' | '6M' | '1Y' | 'All'>('3M');

  // Compute daily totals
  const totalCaloriesLogged = loggedMeals.reduce((acc, curr) => acc + curr.caloriesKcal, 0);
  const totalProteinLogged = loggedMeals.reduce((acc, curr) => acc + curr.proteinGrams, 0);
  const totalCarbsLogged = loggedMeals.reduce((acc, curr) => acc + curr.carbsGrams, 0);
  const totalFatLogged = loggedMeals.reduce((acc, curr) => acc + curr.fatGrams, 0);

  const targetCalories = 2200;
  const targetProtein = 160;
  const targetCarbs = 220;
  const targetFat = 70;

  // Calorie ring metrics
  const circumference = 2 * Math.PI * 45; // ~282.74
  const caloriePercent = Math.min(totalCaloriesLogged / targetCalories, 1);
  const strokeDashoffset = circumference * (1 - caloriePercent);

  // Chart data extraction based on active tab
  const getChartPoints = () => {
    return progressHistory.map((item, idx) => {
      let val = item.weightKg;
      if (activeChartTab === 'fat') val = item.bodyFatPercentage;
      if (activeChartTab === 'muscle') val = item.muscleMassKg;
      if (activeChartTab === 'bmi') val = item.bmi;
      return { label: item.date, val, index: idx };
    });
  };

  const chartPoints = getChartPoints();
  const values = chartPoints.map((p) => p.val);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

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
            const y = svgHeight - padding - ((p.val - minVal) / range) * (svgHeight - padding * 2);
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
                {userProfile.weightKg}
                <span className="text-sm ml-1 font-medium text-[#9AA3A0]">kg</span>
              </span>
              <span className="text-[#45D483] text-sm flex items-center font-semibold">↓ 1.8kg</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-[#252B30] rounded-full overflow-hidden">
              <div className="h-full bg-[#B8F34A] rounded-full transition-all duration-500" style={{ width: '75%' }} />
            </div>
            <p className="text-[10px] text-[#9AA3A0] mt-1.5 flex items-center justify-between">
              <span>Goal: 78.0 kg</span>
              <span className="text-[#B8F34A] font-semibold">92% to target</span>
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
                {userProfile.bodyFatPercentage}
                <span className="text-sm ml-1 font-medium text-[#9AA3A0]">%</span>
              </span>
              <span className="text-[#45D483] text-sm flex items-center font-semibold">↓ 1.2%</span>
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
                {(userProfile.weightKg / Math.pow(userProfile.heightCm / 100, 2)).toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-[#B8F34A] px-2 py-0.5 rounded-full bg-[#B8F34A]/10 border border-[#B8F34A]/20">
                Healthy Normal
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
              <span className="text-3xl font-bold text-[#B8F34A] tracking-tight">32</span>
              <span className="text-[#45D483] text-sm font-semibold">-2 Years</span>
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
                <p className="text-xs text-[#9AA3A0]">{todayWorkout.durationMinutes} min session • Hypertrophy Split</p>
              </div>
              <span className="bg-[#B8F34A]/10 text-[#B8F34A] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#B8F34A]/20 uppercase tracking-wider">
                UPPER BODY
              </span>
            </div>

            {/* List of exercises */}
            <div className="space-y-2.5 my-2">
              {todayWorkout.exercises.slice(0, 3).map((ex, idx) => (
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
            <button
              id="btn-dash-start-workout"
              onClick={() => onStartWorkout(todayWorkout)}
              className="flex-1 bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] py-3 rounded-2xl font-bold tracking-tight text-xs uppercase flex items-center justify-center gap-2 shadow-[0_2px_14px_rgba(184,243,74,0.25)] transition-all hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-current" />
              START WORKOUT
            </button>
          </div>
        </div>
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
              Your body-fat percentage has decreased while your muscle mass has remained stable. This confirms highly effective{' '}
              <span className="text-[#B8F34A] font-bold">body recomposition</span> with optimal strength retention.
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
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-[#0B0D0F] border border-[#252B30] text-[10px] text-[#F5F7F2] rounded-lg px-2.5 py-1 outline-none focus:border-[#B8F34A]"
              >
                <option value="3M">Last 3 Months</option>
                <option value="6M">Last 6 Months</option>
                <option value="1Y">Last Year</option>
              </select>
            </div>

            {/* Vertical Bar Chart Graphic */}
            <div className="h-28 flex items-end justify-between gap-2 px-1 pt-4">
              <div className="w-full bg-[#B8F34A]/10 h-[45%] rounded-t-md relative group">
                <div className="absolute bottom-0 w-full bg-[#B8F34A]/30 h-full rounded-t-md group-hover:bg-[#B8F34A]/50 transition-colors" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#9AA3A0] opacity-0 group-hover:opacity-100 transition-opacity">
                  83.2
                </span>
              </div>
              <div className="w-full bg-[#B8F34A]/10 h-[60%] rounded-t-md relative group">
                <div className="absolute bottom-0 w-full bg-[#B8F34A]/30 h-full rounded-t-md group-hover:bg-[#B8F34A]/50 transition-colors" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#9AA3A0] opacity-0 group-hover:opacity-100 transition-opacity">
                  82.5
                </span>
              </div>
              <div className="w-full bg-[#B8F34A]/10 h-[52%] rounded-t-md relative group">
                <div className="absolute bottom-0 w-full bg-[#B8F34A]/30 h-full rounded-t-md group-hover:bg-[#B8F34A]/50 transition-colors" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#9AA3A0] opacity-0 group-hover:opacity-100 transition-opacity">
                  81.9
                </span>
              </div>
              <div className="w-full bg-[#B8F34A]/10 h-[72%] rounded-t-md relative group">
                <div className="absolute bottom-0 w-full bg-[#B8F34A]/30 h-full rounded-t-md group-hover:bg-[#B8F34A]/50 transition-colors" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#9AA3A0] opacity-0 group-hover:opacity-100 transition-opacity">
                  81.0
                </span>
              </div>
              <div className="w-full bg-[#B8F34A]/10 h-[88%] rounded-t-md relative group">
                <div className="absolute bottom-0 w-full bg-[#B8F34A] h-full rounded-t-md" />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#B8F34A] font-mono">
                  80.4
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-2 text-[10px] text-[#9AA3A0] uppercase font-bold tracking-widest px-1">
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('progress')}
            className="mt-4 pt-3 border-t border-[#252B30] text-[11px] font-bold text-[#9AA3A0] hover:text-[#B8F34A] flex items-center justify-between transition-colors"
          >
            <span>Detailed Bio-Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Segmental Body Composition Visualizer */}
      <BodySilhouetteVisualizer composition={latestComposition} />
    </div>
  );
};
