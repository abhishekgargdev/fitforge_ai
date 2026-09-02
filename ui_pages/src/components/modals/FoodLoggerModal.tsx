import React, { useState } from 'react';
import { FoodItem, MealCategory, LoggedMealEntry } from '../../types';
import { foodDatabase } from '../../data/mockData';
import { Search, Plus, X, Flame, Sparkles, Check, Scale } from 'lucide-react';

interface FoodLoggerModalProps {
  onClose: () => void;
  onLogFood: (entry: LoggedMealEntry) => void;
  defaultMeal?: MealCategory;
}

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  onClose,
  onLogFood,
  defaultMeal = 'breakfast',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(defaultMeal);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(foodDatabase[0] || null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customServing, setCustomServing] = useState('100g');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const filteredFoods = foodDatabase.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServingMultiplier(1);
  };

  const handleLogSelected = () => {
    if (!selectedFood) return;

    const entry: LoggedMealEntry = {
      id: `meal-${Date.now()}`,
      name: selectedFood.name,
      mealCategory: selectedMeal,
      serving: `${servingMultiplier} × ${selectedFood.servingSize}`,
      caloriesKcal: Math.round(selectedFood.caloriesKcal * servingMultiplier),
      proteinGrams: Math.round(selectedFood.proteinGrams * servingMultiplier * 10) / 10,
      carbsGrams: Math.round(selectedFood.carbsGrams * servingMultiplier * 10) / 10,
      fatGrams: Math.round(selectedFood.fatGrams * servingMultiplier * 10) / 10,
      timeLogged: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogFood(entry);
    onClose();
  };

  const handleLogCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    const entry: LoggedMealEntry = {
      id: `meal-${Date.now()}`,
      name: customName,
      mealCategory: selectedMeal,
      serving: customServing || '1 serving',
      caloriesKcal: Number(customCalories) || 0,
      proteinGrams: Number(customProtein) || 0,
      carbsGrams: Number(customCarbs) || 0,
      fatGrams: Number(customFat) || 0,
      timeLogged: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogFood(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        id="modal-food-logger"
        className="w-full max-w-xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5B942]/20 text-[#F5B942] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Log Food & Macros</h2>
            </div>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Select verified whole foods or input custom nutrition labels
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Selector */}
        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
            Target Meal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMeal(m)}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedMeal === m
                    ? 'bg-[#B8F34A] text-[#0B0D0F] shadow-sm'
                    : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Switch: Verified Library vs Custom Food */}
        <div className="mt-4 flex border-b border-[#252B30]">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`pb-2 px-4 text-xs font-bold transition-colors ${
              activeTab === 'search'
                ? 'text-[#B8F34A] border-b-2 border-[#B8F34A]'
                : 'text-[#9AA3A0] hover:text-white'
            }`}
          >
            Database Search
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2 px-4 text-xs font-bold transition-colors ${
              activeTab === 'custom'
                ? 'text-[#B8F34A] border-b-2 border-[#B8F34A]'
                : 'text-[#9AA3A0] hover:text-white'
            }`}
          >
            + Custom Food
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="mt-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken breast, oats, eggs, rice, avocado..."
                className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
              />
            </div>

            {/* Food List */}
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {filteredFoods.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#181D22] border-[#B8F34A]'
                        : 'bg-[#0B0D0F]/50 border-[#252B30] hover:border-[#9AA3A0]/40'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white block">{food.name}</span>
                      <span className="text-[11px] text-[#9AA3A0]">
                        Serving: {food.servingSize} • {food.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#B8F34A] block">{food.caloriesKcal} kcal</span>
                      <span className="text-[10px] text-[#9AA3A0]">
                        P: {food.proteinGrams}g | C: {food.carbsGrams}g | F: {food.fatGrams}g
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Food Serving Adjuster & Live Totals */}
            {selectedFood && (
              <div className="p-4 bg-[#181D22] border border-[#252B30] rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-white">
                    Selected: <span className="text-[#B8F34A]">{selectedFood.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9AA3A0]">Portion:</span>
                    {[0.5, 1, 1.5, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setServingMultiplier(val)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          servingMultiplier === val
                            ? 'bg-[#B8F34A] text-[#0B0D0F]'
                            : 'bg-[#0B0D0F] text-[#9AA3A0] border border-[#252B30]'
                        }`}
                      >
                        {val}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                    <span className="text-[10px] text-[#9AA3A0] block">Calories</span>
                    <span className="font-bold text-white">
                      {Math.round(selectedFood.caloriesKcal * servingMultiplier)} kcal
                    </span>
                  </div>
                  <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                    <span className="text-[10px] text-[#5DA9FF] block">Protein</span>
                    <span className="font-bold text-white">
                      {Math.round(selectedFood.proteinGrams * servingMultiplier * 10) / 10}g
                    </span>
                  </div>
                  <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                    <span className="text-[10px] text-[#F5B942] block">Carbs</span>
                    <span className="font-bold text-white">
                      {Math.round(selectedFood.carbsGrams * servingMultiplier * 10) / 10}g
                    </span>
                  </div>
                  <div className="bg-[#0B0D0F] p-2 rounded-xl border border-[#252B30]">
                    <span className="text-[10px] text-[#F05D5E] block">Fat</span>
                    <span className="font-bold text-white">
                      {Math.round(selectedFood.fatGrams * servingMultiplier * 10) / 10}g
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0] hover:text-white"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-log-food"
                type="button"
                disabled={!selectedFood}
                onClick={handleLogSelected}
                className="px-6 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add to {selectedMeal}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogCustom} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Food / Drink Name</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Whey Protein Shake, Homemade Pasta"
                className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Serving Size</label>
                <input
                  type="text"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  placeholder="e.g. 1 scoop (32g)"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  placeholder="e.g. 240"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5DA9FF] mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="24"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#F5B942] mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  placeholder="4"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#F05D5E] mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  placeholder="2"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs"
              >
                Save & Log
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
