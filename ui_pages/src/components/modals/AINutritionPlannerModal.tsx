import React, { useState } from 'react';
import { UserProfile, FitnessGoal, DietType } from '../../types';
import { Sparkles, X, Check, Apple, Utensils, ShoppingBag } from 'lucide-react';

interface AINutritionPlannerModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onApplyPlan: (plan: any) => void;
}

export const AINutritionPlannerModal: React.FC<AINutritionPlannerModalProps> = ({
  userProfile,
  onClose,
  onApplyPlan,
}) => {
  const [dietType, setDietType] = useState<DietType>('high_protein');
  const [dailyCalories, setDailyCalories] = useState(2200);
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [allergies, setAllergies] = useState<string[]>(['No lactose']);
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

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
    try {
      const res = await fetch('/api/ai/nutrition-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: userProfile.fitnessGoal,
          dietType,
          targetCalories: dailyCalories,
          mealsCount: mealsPerDay,
          restrictions: allergies,
          preferences: customNotes,
        }),
      });

      const data = await res.json();
      setGeneratedResult(data);
    } catch (e) {
      // Fallback preview
      setGeneratedResult({
        planTitle: 'High-Protein Muscle Architecture Meal Plan',
        dailyCalories,
        proteinGrams: 165,
        carbsGrams: 215,
        fatGrams: 65,
        meals: [
          {
            mealName: 'Breakfast: Power Oats & Egg Whites',
            caloriesKcal: 520,
            proteinGrams: 42,
            carbsGrams: 60,
            fatGrams: 12,
            foods: ['1 cup Rolled Oats with berries', '4 Egg Whites + 1 Whole Egg', '1 scoop Whey Protein'],
          },
          {
            mealName: 'Lunch: Grilled Chicken & Quinoa Bowl',
            caloriesKcal: 680,
            proteinGrams: 55,
            carbsGrams: 75,
            fatGrams: 16,
            foods: ['200g Grilled Chicken Breast', '1.5 cups Cooked Quinoa', 'Steamed Broccoli with olive oil drizzle'],
          },
          {
            mealName: 'Pre-Workout Snack: Greek Yogurt & Honey',
            caloriesKcal: 310,
            proteinGrams: 25,
            carbsGrams: 35,
            fatGrams: 6,
            foods: ['200g Non-fat Greek Yogurt', '1 Banana', '1 tbsp Honey'],
          },
          {
            mealName: 'Dinner: Wild Salmon & Sweet Potato',
            caloriesKcal: 690,
            proteinGrams: 43,
            carbsGrams: 45,
            fatGrams: 31,
            foods: ['180g Baked Salmon Fillet', '1 Baked Sweet Potato', 'Mixed Green Salad with avocado'],
          },
        ],
        groceryList: [
          'Chicken Breast (1 kg)',
          'Wild Salmon (500g)',
          'Rolled Oats & Quinoa',
          'Greek Yogurt & Eggs',
          'Sweet Potatoes & Broccoli',
          'Fresh Berries & Bananas',
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        id="modal-ai-nutrition-planner"
        className="w-full max-w-2xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B8F34A]/20 text-[#B8F34A] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">AI Nutrition & Meal Planner</h2>
            </div>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Personalized macro targets, meal timing, and weekly grocery breakdown
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!generatedResult ? (
          <div className="mt-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            {/* Diet Pattern */}
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

            {/* Target Calories & Meals Per Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex justify-between text-[10px] text-[#9AA3A0] mt-1 font-mono">
                  <span>1,600 (Aggressive Cut)</span>
                  <span>2,200 (Target)</span>
                  <span>3,800 (Bulk)</span>
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
            </div>

            {/* Dietary Constraints / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Allergies or Preferences
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. No dairy, high fiber, prefer easy 15-minute prep dinners"
                className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
              />
            </div>
          </div>
        ) : (
          /* Generated Plan Output */
          <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            <div className="p-4 rounded-2xl bg-[#181D22] border border-[#B8F34A]/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">{generatedResult.planTitle}</h3>
                <span className="text-xs font-bold text-[#B8F34A]">
                  {generatedResult.dailyCalories} kcal / day
                </span>
              </div>

              {/* Macro Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
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
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0]">
                Daily Meal Architecture
              </h4>
              {generatedResult.meals?.map((meal: any, idx: number) => (
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
                    {meal.foods?.map((f: string, fIdx: number) => (
                      <li key={fIdx}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Groceries Checklist */}
            {generatedResult.groceryList && (
              <div className="p-4 rounded-xl bg-[#0B0D0F]/70 border border-[#252B30]">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#5DA9FF]" />
                  Weekly Grocery Checklist
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-[#9AA3A0]">
                  {generatedResult.groceryList.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8F34A]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
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
                onClick={() => {
                  onApplyPlan(generatedResult);
                  onClose();
                }}
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
                onClick={handleGenerate}
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
