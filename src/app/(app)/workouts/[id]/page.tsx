"use client";

import { useParams } from "next/navigation";
import { WorkoutsView } from "@/components/views/WorkoutsView";
import { useMockApp } from "@/components/layout/MockAppProvider";
import { preloadedWorkouts } from "@/data/mockData";

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const app = useMockApp();
  const workout = preloadedWorkouts.find((w) => w.id === id);

  return (
    <div className="space-y-4">
      {workout ? (
        <p className="text-xs text-[#9AA3A0]">
          Workout fixture: <strong className="text-white">{workout.name}</strong>
        </p>
      ) : null}
      <WorkoutsView
        currentSplit={app.currentSplit}
        onStartWorkout={app.startWorkout}
        onOpenAIPlanner={() => app.setAiWorkoutPlannerOpen(true)}
        onNavigate={app.navigateTab}
      />
    </div>
  );
}
