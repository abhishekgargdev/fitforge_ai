"use client";

import { useParams, useRouter } from "next/navigation";
import { ActiveWorkoutTracker } from "@/components/views/ActiveWorkoutTracker";
import { useMockApp } from "@/components/layout/MockAppProvider";
import { preloadedWorkouts } from "@/data/mockData";

export default function ActiveWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const app = useMockApp();
  const workout =
    preloadedWorkouts.find((w) => w.id === id) ??
    app.currentSplit.days.find((d) => d.workout?.id === id)?.workout ??
    app.todayWorkout;

  return (
    <ActiveWorkoutTracker
      workout={workout}
      onFinishWorkout={app.finishWorkout}
      onCancel={() => router.push("/workouts")}
    />
  );
}
