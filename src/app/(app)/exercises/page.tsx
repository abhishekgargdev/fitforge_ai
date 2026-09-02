"use client";

import { ExercisesView } from "@/components/views/ExercisesView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function ExercisesPage() {
  const app = useMockApp();
  return (
    <ExercisesView
      onStartWithExercise={() => {
        app.startWorkout(app.todayWorkout);
      }}
    />
  );
}
