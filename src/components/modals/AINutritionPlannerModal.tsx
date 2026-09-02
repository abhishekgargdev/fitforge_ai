'use client';

// Fields used: userProfile.fitnessGoal; DietType; calories, protein, carbs, fat, diet, meals/day,
// preferences, allergies, budget, cuisine; generated planTitle, dailyCalories, proteinGrams,
// carbsGrams, fatGrams, fiberGrams, meals[].mealName, caloriesKcal, foods[], resolvedFoods.

import React, { useEffect, useState } from 'react';
import { UserProfile, DietType } from '@/types';
import { Sparkles, X, Check, Utensils, ShoppingBag } from 'lucide-react';

type NutritionPlanResult = {
  planTitle: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  meals: Array<{
    mealName: string;
    mealCategory?: string;
    caloriesKcal: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    foods: string[];
  }>;
  groceryList?: string[];
};

interface AINutritionPlannerModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onApplyPlan: (plan: NutritionPlanResult) => void;
}

export const AINutritionPlannerModal: React.FC<AINutritionPlannerModalProps> = ({
  userProfile,
  onClose,
  onApplyPlan,
}) => {
  const [dietType, setDietType] = useState<DietType>('high_protein');
  const [dailyCalories, setDailyCalories] = useState(2200);
  const [targetProtein, setTargetProtein] = useState(160);
  const [targetCarbs, setTargetCarbs] = useState(220);
  const [targetFat, setTargetFat] = useState(70);
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [allergies, setAllergies] = useState(userProfile.allergies || '');
  const [preferences, setPreferences] = useState(userProfile.foodPreferences || '');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [cuisine, setCuisine] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedResult, setGeneratedResult] = useState<NutritionPlanResult | null>(null);

  useEffect(() => {
    fetch('/api/nutrition-goals')
      .then((res) => res.json())
      .then((json) => {
        const goals = json.data?.goals;
        if (!goals) return;
        setDailyCalories(goals.targetCaloriesKcal);
        setTargetProtein(goals.targetProteinGrams);
        setTargetCarbs(goals.targetCarbsGrams);
        setTargetFat(goals.targetFatGrams);
        if (goals.dietType) setDietType(goals.dietType);
        if (goals.mealsPerDay) setMealsPerDay(goals.mealsPerDay);
        if (goals.allergies) setAllergies(goals.allergies);
        if (goals.preferences) setPreferences(goals.preferences);
        if (goals.budget) setBudget(goals.budget);
        if (goals.cuisine) setCuisine(goals.cuisine);
      })
      .catch(() => undefined);
  }, []);

  const dietOptions: { id: DietType; label: string; desc: string }[] = [
    { id: 'balanced', label: 'Balanced Athletic', desc: 'Standard 40/30/30 macro split' },
    { id: 'high_protein', label: 'High Protein Hypertrophy', desc: '2.0g+ per kg bodyweight' },
    { id: 'low_carb', label: 'Low Carb Cut', desc: 'Accelerated glycogen depletion' },
    { id: 'keto', label: 'Ketogenic', desc: 'Ultra-low carb, healthy fats' },
    { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant-forward with eggs & dairy' },
    { id: 'vegan', label: '100% Vegan', desc: 'Pure plant-based protein sources' },
    { id: 'mediterranean', label: 'Mediterranean', desc: 'Whole grains, fish & olive oils' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/nutrition-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: userProfile.fitnessGoal,
          dietType,
          targetCalories: dailyCalories,
          targetProteinGrams: targetProtein,
          targetCarbsGrams: targetCarbs,
          targetFatGrams: targetFat,
          mealsCount: mealsPerDay,
          restrictions: allergies
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          allergies,
          preferences,
          budget,
          cuisine,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Nutrition plan unavailable');
      setGeneratedResult(json.data);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to generate a nutrition plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = async () => {
    if (!generatedResult) return;
    setErrorMsg('');
    try {
      const res = await fetch('/api/nutrition-goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCaloriesKcal: generatedResult.dailyCalories || dailyCalories,
          targetProteinGrams: generatedResult.proteinGrams || targetProtein,
          targetCarbsGrams: generatedResult.carbsGrams || targetCarbs,
          targetFatGrams: generatedResult.fatGrams || targetFat,
          targetFiberGrams: Math.max(10, generatedResult.fiberGrams || 25),
          dietType,
          mealsPerDay,
          preferences,
          allergies,
          budget,
          cuisine,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to save nutrition goals.');
      onApplyPlan(generatedResult);
      onClose();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to apply nutrition plan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        id="modal-ai-nutrition-planner"
        className="w-full max-w-2xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-8"
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B8F34A]/20 text-[#B8F34A] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">AI Nutrition & Meal Planner</h2>
            </div>
            <p className="text-xs text-[#9AA3A0] mt-1">
              AI proposes foods by name; calories and macros come from the food database
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedResult ? (
          <div className="mt-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Nutritional Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dietOptions.map((d) => {
                  const isSelected = dietType === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDietType(d.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#B8F34A]/15 border-[#B8F34A] text-white shadow-sm'
                          : 'bg-[#181D22] border-[#252B30] text-[#9AA3A0] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{d.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#B8F34A]" />}
                      </div>
                      <p className="text-[11px] text-[#9AA3A0] mt-0.5">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Daily Caloric Target ({dailyCalories} kcal)
              </label>
              <input
                type="range"
                min="1600"
                max="3800"
                step="50"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(Number(e.target.value))}
                className="w-full accent-[#B8F34A] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5DA9FF] mb-1">Protein (g)</label>
                <input
                  type="number"
                  min={40}
                  max={400}
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#F5B942] mb-1">Carbs (g)</label>
                <input
                  type="number"
                  min={20}
                  max={800}
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(Number(e.target.value))}
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#F05D5E] mb-1">Fat (g)</label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={targetFat}
                  onChange={(e) => setTargetFat(Number(e.target.value))}
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Meals Per Day ({mealsPerDay} meals)
              </label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMealsPerDay(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      mealsPerDay === num
                        ? 'bg-[#B8F34A] text-[#0B0D0F]'
                        : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                    }`}
                  >
                    {num} Meals
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                  Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. peanuts, lactose"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                  Cuisine
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Indian, Mediterranean"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Budget
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setBudget(level)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize ${
                      budget === level
                        ? 'bg-[#B8F34A] text-[#0B0D0F]'
                        : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Preferences
              </label>
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. high fiber, 15-minute dinners"
                className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
              />
            </div>

            {errorMsg ? <p className="text-xs text-[#F05D5E]">{errorMsg}</p> : null}
          </div>
        ) : (
          <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            <div className="p-4 rounded-2xl bg-[#181D22] border border-[#B8F34A]/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">{generatedResult.planTitle}</h3>
                <span className="text-xs font-bold text-[#B8F34A]">
                  {generatedResult.dailyCalories} kcal / day
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                  <span className="text-[10px] text-[#5DA9FF] block">Protein</span>
                  <span className="font-bold text-white">{generatedResult.proteinGrams}g</span>
                </div>
                <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                  <span className="text-[10px] text-[#F5B942] block">Carbs</span>
                  <span className="font-bold text-white">{generatedResult.carbsGrams}g</span>
                </div>
                <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                  <span className="text-[10px] text-[#F05D5E] block">Fat</span>
                  <span className="font-bold text-white">{generatedResult.fatGrams}g</span>
                </div>
                <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                  <span className="text-[10px] text-[#45D483] block">Fiber</span>
                  <span className="font-bold text-white">{generatedResult.fiberGrams ?? 0}g</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0]">
                Daily Meal Architecture
              </h4>
              {generatedResult.meals?.map((meal, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#181D22] border border-[#252B30] text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#B8F34A]" />
                      {meal.mealName}
                    </span>
                    <span className="font-bold text-[#B8F34A]">{meal.caloriesKcal} kcal</span>
                  </div>
                  <ul className="text-[11px] text-[#9AA3A0] list-disc list-inside space-y-0.5">
                    {meal.foods?.map((f, fIdx) => (
                      <li key={fIdx}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {generatedResult.groceryList && (
              <div className="p-4 rounded-xl bg-[#0B0D0F]/70 border border-[#252B30]">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#5DA9FF]" />
                  Weekly Grocery Checklist
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-[#9AA3A0]">
                  {generatedResult.groceryList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8F34A]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errorMsg ? <p className="text-xs text-[#F05D5E]">{errorMsg}</p> : null}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#252B30] flex items-center justify-end gap-3">
          {generatedResult ? (
            <>
              <button
                type="button"
                onClick={() => setGeneratedResult(null)}
                className="px-4 py-2.5 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0]"
              >
                Reconfigure
              </button>
              <button
                id="btn-apply-ai-nutrition"
                type="button"
                onClick={() => void handleApply()}
                className="px-6 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs shadow-sm"
              >
                Apply Nutrition Plan
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0]"
              >
                Cancel
              </button>
              <button
                id="btn-generate-ai-nutrition"
                type="button"
                disabled={isGenerating}
                onClick={() => void handleGenerate()}
                className="px-6 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(184,243,74,0.3)] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                {isGenerating ? 'Synthesizing...' : 'Generate Plan'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
