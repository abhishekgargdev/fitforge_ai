"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardView } from "@/components/views/DashboardView";
import { FoodLoggerModal } from "@/components/modals/FoodLoggerModal";
import { AINutritionPlannerModal } from "@/components/modals/AINutritionPlannerModal";
import { AIAnalysisModal } from "@/components/modals/AIAnalysisModal";
import { WorkoutCheckinModal } from "@/components/modals/WorkoutCheckinModal";
import { emptyWorkout } from "@/lib/dashboard/empty";
import type {
  BodyCompositionDetails,
  DailyNutritionTarget,
  LoggedMealEntry,
  UserProfile,
  WorkoutTemplate,
} from "@/types";
import type { ProgressRange } from "@/lib/progress/types";

type DashboardPayload = {
  profile: UserProfile;
  targetWeightKg: number;
  metrics: {
    weightKg: number;
    weightDelta: number;
    weightProgressPct: number;
    bodyFatPercentage: number;
    fatDelta: number;
    bmi: number;
    bmiLabel: string;
    bodyAge: number;
    bodyAgeDelta: number;
  };
  nutrition: {
    meals: LoggedMealEntry[];
    goals: DailyNutritionTarget;
  };
  workout: {
    planId: string;
    dayIndex: number;
    isRestDay: boolean;
    focus: string;
    todayWorkout: WorkoutTemplate;
  };
  progress: {
    range: ProgressRange;
    series: Array<{ label: string; value: number }>;
    composition: BodyCompositionDetails;
    previousComposition: BodyCompositionDetails | null;
    insight: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [range, setRange] = useState<ProgressRange>("3m");
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [workoutStartOpen, setWorkoutStartOpen] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/dashboard?range=${range}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .catch(() => undefined);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#12161A] border border-[#252B30] h-32 animate-pulse" />
          ))}
        </div>
        <div className="p-6 rounded-2xl bg-[#12161A] border border-[#252B30] h-72 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <DashboardView
        userProfile={data.profile}
        metrics={{ ...data.metrics, targetWeightKg: data.targetWeightKg }}
        loggedMeals={data.nutrition.meals}
        nutritionGoals={data.nutrition.goals}
        todayWorkout={data.workout.todayWorkout || emptyWorkout}
        isRestDay={data.workout.isRestDay}
        workoutFocus={data.workout.focus}
        chartSeries={data.progress.series}
        range={range}
        onRangeChange={setRange}
        latestComposition={data.progress.composition}
        previousComposition={data.progress.previousComposition}
        insight={data.progress.insight}
        onNavigate={(tab) => {
          if (tab === "workouts") router.push("/workouts");
          else if (tab === "progress") router.push("/progress");
          else if (tab === "nutrition") router.push("/nutrition");
          else if (tab === "ai_coach") router.push("/ai-coach");
          else router.push("/dashboard");
        }}
        onStartWorkout={async () => {
          if (!data.workout.planId || data.workout.isRestDay) return;
          setWorkoutStartOpen(true);
        }}
        onOpenFoodLogger={() => setLoggerOpen(true)}
        onOpenAIPlanner={() => setPlannerOpen(true)}
        onOpenAIAnalysis={() => setAnalysisOpen(true)}
      />
      {loggerOpen && (
        <FoodLoggerModal
          onClose={() => setLoggerOpen(false)}
          onLogFood={() => {
            setLoggerOpen(false);
            load();
          }}
        />
      )}
      {plannerOpen && (
        <AINutritionPlannerModal
          userProfile={data.profile}
          onClose={() => setPlannerOpen(false)}
          onApplyPlan={() => {
            setPlannerOpen(false);
            load();
          }}
        />
      )}
      {analysisOpen && (
        <AIAnalysisModal userProfile={data.profile} onClose={() => setAnalysisOpen(false)} />
      )}
      {workoutStartOpen && (
        <WorkoutCheckinModal
          workoutName={data.workout.todayWorkout?.name || 'Workout'}
          latestWeightKg={data.metrics.weightKg}
          onClose={() => setWorkoutStartOpen(false)}
          onStart={async (startWeightKg?: number) => {
            setWorkoutStartOpen(false);
            const res = await fetch("/api/workouts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workoutPlanId: data.workout.planId,
                dayIndex: data.workout.dayIndex,
                ...(startWeightKg ? { startWeightKg } : {}),
              }),
            });
            const json = await res.json();
            if (!res.ok) return;
            router.push(`/workouts/active/${json.data.session.id}`);
          }}
        />
      )}
    </>
  );
}
