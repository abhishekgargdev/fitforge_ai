"use client";

import { NutritionView } from "@/components/views/NutritionView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function NutritionPage() {
  const app = useMockApp();
  return (
    <NutritionView
      loggedMeals={app.loggedMeals}
      onOpenFoodLogger={app.openFoodLogger}
      onOpenAIPlanner={() => app.setAiNutritionPlannerOpen(true)}
      onDeleteMealEntry={app.deleteMealEntry}
    />
  );
}
