'use client';

// Fields used: FoodItem.id, name, servingSize, servingWeightGrams, caloriesKcal, proteinGrams, carbsGrams, fatGrams, fiberGrams, category, isFavorite;
// LoggedMealEntry.id, name, mealCategory, serving, caloriesKcal, proteinGrams, carbsGrams, fatGrams, fiberGrams, timeLogged.

import React, { useEffect, useState } from 'react';
import { FoodItem, MealCategory, LoggedMealEntry } from '@/types';
import { Search, Plus, X, Flame, Camera, Upload, Sparkles, ShieldCheck } from 'lucide-react';
import { LoadingButton } from '@/components/common/LoadingButton';
import { OriginBadge } from '@/components/common/OriginBadge';

interface FoodLoggerModalProps {
  onClose: () => void;
  onLogFood: (entry: LoggedMealEntry) => void;
  defaultMeal?: MealCategory;
}

function toLoggedEntry(payload: {
  id: string;
  name: string;
  serving?: string;
  mealCategory: MealCategory;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  timeLogged?: string;
  foodId?: string;
}): LoggedMealEntry {
  return {
    id: payload.id,
    foodId: payload.foodId,
    name: payload.name,
    serving: payload.serving,
    mealCategory: payload.mealCategory,
    caloriesKcal: payload.caloriesKcal,
    proteinGrams: payload.proteinGrams,
    carbsGrams: payload.carbsGrams,
    fatGrams: payload.fatGrams,
    fiberGrams: payload.fiberGrams,
    timeLogged:
      payload.timeLogged ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  onClose,
  onLogFood,
  defaultMeal = 'breakfast',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(defaultMeal);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'photo'>('search');

  // Photo Vision state
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [visionEstimate, setVisionEstimate] = useState<Array<{
    foodName: string;
    estimatedQuantity: string;
    caloriesKcal: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  }> | null>(null);

  const [customName, setCustomName] = useState('');
  const [customServing, setCustomServing] = useState('100g');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Search failed');
        setSearchResults(json.data?.items || []);
      } catch (error) {
        setSearchResults([]);
        setErrorMsg(error instanceof Error ? error.message : 'Unable to search foods.');
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServingMultiplier(1);
    setErrorMsg('');
  };

  const persistLog = async (body: Record<string, unknown>) => {
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to log food.');
      const log = json.data.log;
      onLogFood(toLoggedEntry(log));
      onClose();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to log food.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogSelected = () => {
    if (!selectedFood) return;
    void persistLog({
      foodId: selectedFood.id,
      name: selectedFood.name,
      mealCategory: selectedMeal,
      servings: servingMultiplier,
    });
  };

  const handleLogCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;
    void persistLog({
      name: customName,
      serving: customServing || '1 serving',
      mealCategory: selectedMeal,
      caloriesKcal: Number(customCalories) || 0,
      proteinGrams: Number(customProtein) || 0,
      carbsGrams: Number(customCarbs) || 0,
      fatGrams: Number(customFat) || 0,
      fiberGrams: Number(customFiber) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        id="modal-food-logger"
        className="w-full max-w-xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-6"
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5B942]/20 text-[#F5B942] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Log Food & Macros</h2>
            </div>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Search USDA / Open Food Facts, or enter a nutrition label
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            onClick={() => setActiveTab('photo')}
            className={`pb-2 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'photo'
                ? 'text-[#B8F34A] border-b-2 border-[#B8F34A]'
                : 'text-[#9AA3A0] hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            AI Photo Log
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

        {errorMsg ? <p className="mt-3 text-xs text-[#F05D5E]">{errorMsg}</p> : null}

        {activeTab === 'search' ? (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods or paste an 8–14 digit barcode"
                className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
              />
            </div>

            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {searching ? (
                <div className="text-center py-6 text-xs text-[#9AA3A0]">Searching verified foods…</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#9AA3A0]/70">
                  {searchQuery.trim().length < 2
                    ? 'Type at least 2 characters to search.'
                    : 'No matching foods yet.'}
                </div>
              ) : (
                searchResults.map((food) => {
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
                          {food.fiberGrams ? ` • Fiber ${food.fiberGrams}g` : ''}
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
                })
              )}
            </div>

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
              <LoadingButton
                id="btn-confirm-log-food"
                type="button"
                disabled={!selectedFood}
                isLoading={saving}
                loadingText="Saving…"
                onClick={handleLogSelected}
                icon={<Plus className="w-4 h-4" />}
                className="px-6"
              >
                Add to {selectedMeal}
              </LoadingButton>
            </div>
          </div>
        ) : activeTab === 'photo' ? (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-[#181D22] border border-[#252B30] rounded-2xl flex items-center gap-2.5 text-xs text-[#9AA3A0]">
              <ShieldCheck className="w-4 h-4 text-[#45D483] shrink-0" />
              <span>
                Your photo is processed strictly in memory for nutrition estimation and is <strong>never stored on disk or servers</strong>.
              </span>
            </div>

            {!visionEstimate ? (
              <div className="border-2 border-dashed border-[#252B30] hover:border-[#B8F34A]/50 rounded-2xl p-6 text-center transition-all bg-[#0B0D0F]">
                {photoBase64 ? (
                  <div className="space-y-4">
                    <img
                      src={photoBase64}
                      alt="Food preview"
                      className="max-h-48 mx-auto rounded-xl border border-[#252B30] object-cover"
                    />
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoBase64(null);
                          setVisionEstimate(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0] hover:text-white"
                      >
                        Choose Different Photo
                      </button>
                      <LoadingButton
                        type="button"
                        isLoading={analyzingPhoto}
                        loadingText="Analyzing with Vision AI…"
                        onClick={async () => {
                          if (!photoBase64) return;
                          setAnalyzingPhoto(true);
                          setErrorMsg('');
                          try {
                            const res = await fetch('/api/ai/food-image-log', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                imageBase64: photoBase64,
                                mealCategory: selectedMeal,
                              }),
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json.error?.message || 'Failed to analyze photo.');
                            setVisionEstimate(json.data.estimate.identifiedFoods || []);
                          } catch (err) {
                            setErrorMsg(err instanceof Error ? err.message : 'Unable to analyze image.');
                          } finally {
                            setAnalyzingPhoto(false);
                          }
                        }}
                        icon={<Sparkles className="w-4 h-4" />}
                        className="px-6"
                      >
                        Analyze Photo
                      </LoadingButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#B8F34A]/10 text-[#B8F34A] flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Upload or Capture Food Photo</span>
                      <span className="text-[11px] text-[#9AA3A0]">PNG, JPG, or WEBP up to 5MB</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer block rounded-2xl border border-[#252B30] bg-[#181D22] p-3 hover:border-[#B8F34A]/50">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#F5F7F2]">
                          <Upload className="w-4 h-4" /> Upload
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhotoBase64(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <label className="cursor-pointer block rounded-2xl border border-[#252B30] bg-[#181D22] p-3 hover:border-[#B8F34A]/50">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#F5F7F2]">
                          <Camera className="w-4 h-4" /> Capture
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhotoBase64(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B8F34A]" />
                    AI Vision Estimate
                  </span>
                  <OriginBadge origin="AI_RECOMMENDATION" />
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {visionEstimate.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#181D22] border border-[#252B30] rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.foodName}
                          onChange={(e) => {
                            const updated = [...visionEstimate];
                            updated[idx].foodName = e.target.value;
                            setVisionEstimate(updated);
                          }}
                          className="bg-[#0B0D0F] border border-[#252B30] rounded-lg px-2.5 py-1 text-xs text-white font-bold outline-none focus:border-[#B8F34A]"
                        />
                        <span className="text-[11px] text-[#B8F34A] font-bold">{item.caloriesKcal} kcal</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-[#5DA9FF] block">Protein (g)</label>
                          <input
                            type="number"
                            value={item.proteinGrams}
                            onChange={(e) => {
                              const updated = [...visionEstimate];
                              updated[idx].proteinGrams = Number(e.target.value) || 0;
                              setVisionEstimate(updated);
                            }}
                            className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-lg px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#F5B942] block">Carbs (g)</label>
                          <input
                            type="number"
                            value={item.carbsGrams}
                            onChange={(e) => {
                              const updated = [...visionEstimate];
                              updated[idx].carbsGrams = Number(e.target.value) || 0;
                              setVisionEstimate(updated);
                            }}
                            className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-lg px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#F05D5E] block">Fat (g)</label>
                          <input
                            type="number"
                            value={item.fatGrams}
                            onChange={(e) => {
                              const updated = [...visionEstimate];
                              updated[idx].fatGrams = Number(e.target.value) || 0;
                              setVisionEstimate(updated);
                            }}
                            className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-lg px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#9AA3A0] block">Serving</label>
                          <input
                            type="text"
                            value={item.estimatedQuantity}
                            onChange={(e) => {
                              const updated = [...visionEstimate];
                              updated[idx].estimatedQuantity = e.target.value;
                              setVisionEstimate(updated);
                            }}
                            className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-lg px-2 py-1 text-xs text-white text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVisionEstimate(null);
                      setPhotoBase64(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0] hover:text-white"
                  >
                    Reset Photo
                  </button>
                  <LoadingButton
                    type="button"
                    isLoading={saving}
                    loadingText="Saving…"
                    onClick={async () => {
                      if (!visionEstimate || !visionEstimate.length) return;
                      setSaving(true);
                      setErrorMsg('');
                      try {
                        for (const item of visionEstimate) {
                          await persistLog({
                            name: item.foodName,
                            serving: item.estimatedQuantity || '1 portion',
                            mealCategory: selectedMeal,
                            caloriesKcal: item.caloriesKcal,
                            proteinGrams: item.proteinGrams,
                            carbsGrams: item.carbsGrams,
                            fatGrams: item.fatGrams,
                            fiberGrams: item.fiberGrams,
                            source: 'ai_image',
                          });
                        }
                      } catch (err) {
                        setErrorMsg(err instanceof Error ? err.message : 'Unable to confirm log.');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    icon={<Plus className="w-4 h-4" />}
                    className="px-6"
                  >
                    Confirm & Log Food
                  </LoadingButton>
                </div>
              </div>
            )}
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

            <div className="grid grid-cols-4 gap-3">
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
              <div>
                <label className="block text-[11px] font-bold text-[#45D483] mb-1">Fiber (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(e.target.value)}
                  placeholder="3"
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
              <LoadingButton
                type="submit"
                isLoading={saving}
                loadingText="Saving…"
                className="px-6"
              >
                Save & Log
              </LoadingButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
