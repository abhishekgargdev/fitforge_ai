"use client";

import { useCallback, useEffect, useState } from "react";
import { NutritionView } from "@/components/views/NutritionView";
import { FoodLoggerModal } from "@/components/modals/FoodLoggerModal";
import { AINutritionPlannerModal } from "@/components/modals/AINutritionPlannerModal";
import type { DailyNutritionTarget, LoggedMealEntry, MealCategory, UserProfile } from "@/types";

const fallbackTargets: DailyNutritionTarget = {
  targetCaloriesKcal: 2200,
  targetProteinGrams: 160,
  targetCarbsGrams: 220,
  targetFatGrams: 70,
  targetFiberGrams: 30,
};

export default function NutritionPage() {
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealEntry[]>([]);
  const [targets, setTargets] = useState<DailyNutritionTarget>(fallbackTargets);
  const [insight, setInsight] = useState("");
  const [waterTargetMl, setWaterTargetMl] = useState(3500);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loggerMeal, setLoggerMeal] = useState<MealCategory | undefined>();
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/food-logs")
      .then((res) => res.json())
      .then((json) => setLoggedMeals(json.data?.items || []))
      .catch(() => setLoggedMeals([]));

    fetch("/api/food-logs/summary")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.goals) setTargets(json.data.goals);
        if (json.data?.insight) setInsight(json.data.insight);
      })
      .catch(() => undefined);

    fetch("/api/nutrition-goals")
      .then((res) => res.json())
      .then((json) => {
        const goals = json.data?.goals;
        if (!goals) return;
        setTargets({
          targetCaloriesKcal: goals.targetCaloriesKcal,
          targetProteinGrams: goals.targetProteinGrams,
          targetCarbsGrams: goals.targetCarbsGrams,
          targetFatGrams: goals.targetFatGrams,
          targetFiberGrams: goals.targetFiberGrams,
        });
        if (goals.waterTargetMl) setWaterTargetMl(goals.waterTargetMl);
      })
      .catch(() => undefined);
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
      <NutritionView
        loggedMeals={loggedMeals}
        targets={targets}
        insight={insight}
        waterTargetMl={waterTargetMl}
        onOpenFoodLogger={(meal) => {
          setLoggerMeal(meal);
          setLoggerOpen(true);
        }}
        onOpenAIPlanner={() => setPlannerOpen(true)}
        onDeleteMealEntry={async (id) => {
          await fetch(`/api/food-logs/${id}`, { method: "DELETE" });
          load();
        }}
      />
      {loggerOpen && (
        <FoodLoggerModal
          defaultMeal={loggerMeal}
          onClose={() => setLoggerOpen(false)}
          onLogFood={() => {
            setLoggerOpen(false);
            load();
          }}
        />
      )}
      {plannerOpen && profile && (
        <AINutritionPlannerModal
          userProfile={profile}
          onClose={() => setPlannerOpen(false)}
          onApplyPlan={() => {
            setPlannerOpen(false);
            load();
          }}
        />
      )}
    </>
  );
}
