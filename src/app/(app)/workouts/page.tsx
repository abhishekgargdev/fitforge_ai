"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkoutsView } from "@/components/views/WorkoutsView";
import { AIWorkoutPlannerModal } from "@/components/modals/AIWorkoutPlannerModal";
import { WorkoutCheckinModal } from "@/components/modals/WorkoutCheckinModal";
import type { UserProfile, WorkoutSplitSchedule } from "@/types";

const emptySplit: WorkoutSplitSchedule = {
  id: "",
  title: "No active plan",
  daysPerWeek: 0,
  days: [],
};

export default function WorkoutsPage() {
  const router = useRouter();
  const [split, setSplit] = useState<WorkoutSplitSchedule>(emptySplit);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [startModalData, setStartModalData] = useState<{ open: boolean; dayIndex: number; workoutName: string } | null>(null);
  const [records, setRecords] = useState<
    Array<{ exercise: string; weight: string; reps: string; date: string }>
  >([]);
  const [history, setHistory] = useState<
    Array<{ id: string; title: string; date: string; duration: string; volume: string; sets: number }>
  >([]);

  const load = useCallback(async () => {
    try {
      const [planRes, recordsRes, historyRes] = await Promise.all([
        fetch("/api/workout-plans"),
        fetch("/api/workouts/records"),
        fetch("/api/workouts?limit=8"),
      ]);

      const planJson = await planRes.json();
      if (planJson.data?.active) setSplit(planJson.data.active);
      else setSplit(emptySplit);

      const recordsJson = await recordsRes.json();
      setRecords(
        (recordsJson.data?.items || []).map(
          (item: { exerciseName: string; weightKg: number; reps: number; date: string }) => ({
            exercise: item.exerciseName,
            weight: `${item.weightKg} kg`,
            reps: `${item.reps} reps`,
            date: new Date(item.date).toLocaleDateString(),
          })
        )
      );

      const historyJson = await historyRes.json();
      setHistory(
        (historyJson.data?.items || [])
          .filter((item: { totalSets?: number }) => (item.totalSets || 0) >= 0)
          .map(
            (item: {
              id: string;
              workoutName: string;
              date: string;
              durationMinutes: number;
              totalVolumeKg: number;
              totalSets: number;
            }) => ({
              id: item.id,
              title: item.workoutName,
              date: new Date(item.date).toLocaleString(),
              duration: `${item.durationMinutes} min`,
              volume: `${item.totalVolumeKg.toLocaleString()} kg`,
              sets: item.totalSets,
            })
          )
      );
    } catch {
      setSplit(emptySplit);
      setRecords([]);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.profile) setProfile(json.data.profile);
      })
      .catch(() => undefined);
  }, [load]);

  return (
    <>
      <WorkoutsView
        currentSplit={split}
        personalRecords={records}
        recentHistory={history}
        onStartWorkout={async (workout, dayIndex) => {
          if (!split.id) return;
          setStartModalData({ open: true, dayIndex, workoutName: workout.name });
        }}
        onOpenAIPlanner={() => setPlannerOpen(true)}
        onRefreshSplit={async () => {
          await load();
          router.refresh();
        }}
        onNavigate={(tab) => {
          if (tab === "exercises") router.push("/exercises");
          else router.push("/dashboard");
        }}
      />
      {plannerOpen && profile && (
        <AIWorkoutPlannerModal
          userProfile={profile}
          onClose={() => setPlannerOpen(false)}
          onApplyGeneratedPlan={() => {
            setPlannerOpen(false);
            load();
          }}
        />
      )}
      {startModalData?.open && profile && (
        <WorkoutCheckinModal
          workoutName={startModalData.workoutName}
          latestWeightKg={profile.weightKg || 75}
          onClose={() => setStartModalData(null)}
          onStart={async (startWeightKg?: number) => {
            const { dayIndex } = startModalData;
            setStartModalData(null);
            const res = await fetch("/api/workouts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workoutPlanId: split.id,
                dayIndex,
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
