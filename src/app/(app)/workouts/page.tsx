"use client";

import { WorkoutsView } from "@/components/views/WorkoutsView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function WorkoutsPage() {
  const app = useMockApp();
  return (
    <WorkoutsView
      currentSplit={app.currentSplit}
      onStartWorkout={app.startWorkout}
      onOpenAIPlanner={() => app.setAiWorkoutPlannerOpen(true)}
      onNavigate={app.navigateTab}
    />
  );
}
