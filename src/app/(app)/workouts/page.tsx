"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkoutsView } from "@/components/views/WorkoutsView";
import { AIWorkoutPlannerModal } from "@/components/modals/AIWorkoutPlannerModal";
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
  const [records, setRecords] = useState<
    Array<{ exercise: string; weight: string; reps: string; date: string }>
  >([]);
  const [history, setHistory] = useState<
    Array<{ id: string; title: string; date: string; duration: string; volume: string; sets: number }>
  >([]);

  const load = useCallback(() => {
    fetch("/api/workout-plans")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.active) setSplit(json.data.active);
        else setSplit(emptySplit);
      })
      .catch(() => setSplit(emptySplit));

    fetch("/api/workouts/records")
      .then((res) => res.json())
      .then((json) => {
        setRecords(
          (json.data?.items || []).map(
            (item: { exerciseName: string; weightKg: number; reps: number; date: string }) => ({
              exercise: item.exerciseName,
              weight: `${item.weightKg} kg`,
              reps: `${item.reps} reps`,
              date: new Date(item.date).toLocaleDateString(),
            })
          )
        );
      })
      .catch(() => setRecords([]));

    fetch("/api/workouts?limit=8")
      .then((res) => res.json())
      .then((json) => {
        setHistory(
          (json.data?.items || [])
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
      })
      .catch(() => setHistory([]));
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
        onStartWorkout={async (_workout, dayIndex) => {
          if (!split.id) return;
          const res = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workoutPlanId: split.id, dayIndex }),
          });
          const json = await res.json();
          if (!res.ok) return;
          router.push(`/workouts/active/${json.data.session.id}`);
        }}
        onOpenAIPlanner={() => setPlannerOpen(true)}
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
    </>
  );
}
