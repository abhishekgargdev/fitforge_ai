"use client";

import { DashboardView } from "@/components/views/DashboardView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function DashboardPage() {
  const app = useMockApp();
  return (
    <DashboardView
      userProfile={app.userProfile}
      loggedMeals={app.loggedMeals}
      todayWorkout={app.todayWorkout}
      progressHistory={app.progressHistory}
      latestComposition={app.bodyComposition}
      onNavigate={app.navigateTab}
      onStartWorkout={app.startWorkout}
      onOpenFoodLogger={() => app.openFoodLogger("breakfast")}
      onOpenAIPlanner={() => app.setAiNutritionPlannerOpen(true)}
      onOpenAIAnalysis={() => app.setAiAnalysisOpen(true)}
    />
  );
}
