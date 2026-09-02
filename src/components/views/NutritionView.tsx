'use client';

// Fields used: LoggedMealEntry.id, name, serving, mealCategory, caloriesKcal, proteinGrams, carbsGrams, fatGrams, timeLogged.

import React, { useState } from 'react';
import { LoggedMealEntry, MealCategory } from '@/types';
import { OriginBadge } from '../common/OriginBadge';
import {
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Droplet,
  PieChart,
  ChevronRight,
  TrendingUp,
  Apple,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from 'lucide-react';

interface NutritionViewProps {
  loggedMeals: LoggedMealEntry[];
  onOpenFoodLogger: (meal?: MealCategory) => void;
  onOpenAIPlanner: () => void;
  onDeleteMealEntry: (id: string) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  loggedMeals,
  onOpenFoodLogger,
  onOpenAIPlanner,
  onDeleteMealEntry,
}) => {
  const [waterMilliliters, setWaterMilliliters] = useState(2500);
  const targetWaterMl = 3500;

  const targetCalories = 2200;
  const targetProtein = 160;
  const targetCarbs = 220;
  const targetFat = 70;

  const totalCalories = loggedMeals.reduce((acc, curr) => acc + curr.caloriesKcal, 0);
  const totalProtein = loggedMeals.reduce((acc, curr) => acc + curr.proteinGrams, 0);
  const totalCarbs = loggedMeals.reduce((acc, curr) => acc + curr.carbsGrams, 0);
  const totalFat = loggedMeals.reduce((acc, curr) => acc + curr.fatGrams, 0);

  const mealsByCategory: Record<MealCategory, LoggedMealEntry[]> = {
    breakfast: loggedMeals.filter((m) => m.mealCategory === 'breakfast'),
    lunch: loggedMeals.filter((m) => m.mealCategory === 'lunch'),
    dinner: loggedMeals.filter((m) => m.mealCategory === 'dinner'),
    snack: loggedMeals.filter((m) => m.mealCategory === 'snack'),
  };

  const getCategoryMeta = (cat: MealCategory) => {
    switch (cat) {
      case 'breakfast':
        return { title: 'Breakfast', icon: Coffee, target: '~500 kcal' };
      case 'lunch':
        return { title: 'Lunch', icon: Sun, target: '~700 kcal' };
      case 'dinner':
        return { title: 'Dinner', icon: Moon, target: '~700 kcal' };
      case 'snack':
        return { title: 'Snacks & Supplements', icon: Cookie, target: '~300 kcal' };
    }
  };

  const handleAddWater = (amount: number) => {
    setWaterMilliliters((prev) => Math.min(5000, Math.max(0, prev + amount)));
  };

  return (
    <div id="nutrition-view" className="space-y-6 animate-in fade-in">
      {/* Top Banner & AI CTA */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Nutrition & Macro Architecture
            </h2>
            <OriginBadge origin="CALCULATED" />
          </div>
          <p className="text-xs text-[#9AA3A0] mt-1">
            Maintain high metabolic efficiency with optimal protein distribution and hydration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-nutrition-open-ai"
            type="button"
            onClick={onOpenAIPlanner}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8F34A]/20 to-[#5DA9FF]/20 border border-[#B8F34A]/40 text-[#F5F7F2] hover:border-[#B8F34A] text-xs font-bold flex items-center gap-2 transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-[#B8F34A] group-hover:rotate-12 transition-transform" />
            AI Meal Plan Generator
          </button>
          <button
            id="btn-nutrition-log-food-top"
            type="button"
            onClick={() => onOpenFoodLogger()}
            className="px-5 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(184,243,74,0.3)] transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Log Food
          </button>
        </div>
      </div>

      {/* 2-Column: Big Calorie & Macro Visuals (7 cols) + Water & AI Nutrition Cue (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calorie & Macro Target Gauges (7 cols) */}
        <div className="lg:col-span-7 bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F5B942]" />
                Daily Caloric Balance
              </h3>
              <span className="text-xs text-[#9AA3A0] font-mono">
                Target: {targetCalories.toLocaleString()} kcal
              </span>
            </div>

            {/* Big Numbers */}
            <div className="bg-[#181D22] border border-[#252B30] rounded-xl p-5 mb-5">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {totalCalories.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#9AA3A0]"> / {targetCalories} kcal</span>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-[#9AA3A0] block">Remaining</span>
                  <span className="text-xl font-bold text-[#B8F34A] font-mono">
                    {Math.max(0, targetCalories - totalCalories)} kcal
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#0B0D0F] h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-[#B8F34A] to-[#45D483] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 3 Macro Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Protein */}
              <div className="bg-[#181D22] p-4 rounded-xl border border-[#252B30]">
                <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-1 font-bold">
                  <span className="text-[#5DA9FF]">Protein</span>
                  <span>{Math.round((totalProtein / targetProtein) * 100)}%</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {Math.round(totalProtein)} <span className="text-xs text-[#9AA3A0]">/ {targetProtein}g</span>
                </div>
                <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#5DA9FF] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalProtein / targetProtein) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-[#181D22] p-4 rounded-xl border border-[#252B30]">
                <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-1 font-bold">
                  <span className="text-[#F5B942]">Carbs</span>
                  <span>{Math.round((totalCarbs / targetCarbs) * 100)}%</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {Math.round(totalCarbs)} <span className="text-xs text-[#9AA3A0]">/ {targetCarbs}g</span>
                </div>
                <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#F5B942] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalCarbs / targetCarbs) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="bg-[#181D22] p-4 rounded-xl border border-[#252B30]">
                <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-1 font-bold">
                  <span className="text-[#F05D5E]">Fat</span>
                  <span>{Math.round((totalFat / targetFat) * 100)}%</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {Math.round(totalFat)} <span className="text-xs text-[#9AA3A0]">/ {targetFat}g</span>
                </div>
                <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#F05D5E] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalFat / targetFat) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#252B30]/60 text-xs text-[#9AA3A0] flex justify-between">
            <span>Macro Split: 30% Protein • 45% Carbs • 25% Fat</span>
            <span className="text-[#45D483] font-semibold">TDEE Adjusted</span>
          </div>
        </div>

        {/* Right Col: Hydration Tracker & AI Nutrition Insight (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Water Intake Tracker */}
          <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5DA9FF]/15 text-[#5DA9FF] flex items-center justify-center">
                  <Droplet className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Hydration Engine</h3>
                  <span className="text-xs text-[#9AA3A0]">Cellular volumization</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#5DA9FF]">
                {(waterMilliliters / 1000).toFixed(1)} / {(targetWaterMl / 1000).toFixed(1)} L
              </span>
            </div>

            {/* Water bar */}
            <div className="w-full bg-[#0B0D0F] h-3 rounded-full overflow-hidden my-3">
              <div
                className="bg-gradient-to-r from-[#5DA9FF] to-[#80E1D9] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((waterMilliliters / targetWaterMl) * 100, 100)}%` }}
              />
            </div>

            {/* Quick add water buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAddWater(250)}
                className="py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#5DA9FF] hover:border-[#5DA9FF]/40"
              >
                +250 ml
              </button>
              <button
                type="button"
                onClick={() => handleAddWater(500)}
                className="py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#5DA9FF] hover:border-[#5DA9FF]/40"
              >
                +500 ml
              </button>
              <button
                type="button"
                onClick={() => setWaterMilliliters(0)}
                className="py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white"
              >
                Reset
              </button>
            </div>
          </div>

          {/* AI Pro Nutrition Cue */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/30 flex items-start gap-3 text-xs text-[#F5F7F2]">
            <Sparkles className="w-5 h-5 text-[#B8F34A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#B8F34A] block mb-1">FitForge AI Nutrition Analysis:</strong>
              Your protein intake (112g) is on track for the day. For dinner, aim for ~48g protein (e.g. wild salmon or grilled chicken breast) to reach the 160g muscle synthesis threshold.
            </div>
          </div>
        </div>
      </div>

      {/* Daily Meals Breakdown Accordion/Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>Today's Meal Diary</span>
          <span className="text-xs text-[#9AA3A0]">
            {loggedMeals.length} Total items logged
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((cat) => {
            const meta = getCategoryMeta(cat);
            const Icon = meta.icon;
            const items = mealsByCategory[cat];
            const catCalories = items.reduce((acc, curr) => acc + curr.caloriesKcal, 0);

            return (
              <div
                key={cat}
                id={`meal-section-${cat}`}
                className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252B30]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#181D22] text-[#B8F34A] flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-white capitalize">{meta.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#B8F34A] font-mono">
                        {catCalories} kcal
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenFoodLogger(cat)}
                        className="p-1 rounded-lg bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white"
                        title={`Add food to ${cat}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items in meal */}
                  <div className="mt-3 space-y-2">
                    {items.length === 0 ? (
                      <div className="text-center py-4 text-xs text-[#9AA3A0]/60 italic">
                        No food logged yet for {cat}.
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white block">{item.name}</span>
                            <span className="text-[10px] text-[#9AA3A0]">
                              {item.serving} • P:{item.proteinGrams}g C:{item.carbsGrams}g F:{item.fatGrams}g
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">{item.caloriesKcal} kcal</span>
                            <button
                              type="button"
                              onClick={() => onDeleteMealEntry(item.id)}
                              className="p-1 text-[#9AA3A0] hover:text-[#F05D5E]"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenFoodLogger(cat)}
                    className="text-[11px] text-[#B8F34A] hover:underline font-bold"
                  >
                    + Add Food to {cat}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
