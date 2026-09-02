"use client";

import { useParams } from "next/navigation";
import { ExercisesView } from "@/components/views/ExercisesView";
import { useMockApp } from "@/components/layout/MockAppProvider";
import { exerciseLibraryData } from "@/data/mockData";

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const app = useMockApp();
  const exercise = exerciseLibraryData.find((e) => e.id === id);

  return (
    <div className="space-y-4">
      {exercise ? (
        <p className="text-xs text-[#9AA3A0]">
          Exercise fixture: <strong className="text-white">{exercise.name}</strong>
        </p>
      ) : null}
      <ExercisesView
        onStartWithExercise={() => {
          app.startWorkout(app.todayWorkout);
        }}
      />
    </div>
  );
}
