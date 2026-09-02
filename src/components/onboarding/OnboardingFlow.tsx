'use client';

// Fields used: name, gender, age, heightCm, weightKg, targetWeightKg, bodyFatPercentage, fitnessGoal,
// focusMuscles, experienceLevel, trainingDaysPerWeek, workoutDurationMinutes, availableEquipment,
// dietPreference, mealsPerDay, foodPreferences, allergies.

import React, { useState } from 'react';
import {
  UserProfile,
  FitnessGoal,
  ExperienceLevel,
  EquipmentType,
  DietPreference,
} from '@/types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Scale,
  Dumbbell,
  Flame,
  Activity,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { LoadingButton } from '../common/LoadingButton';
import { BrandLogo } from '../common/BrandLogo';
import {
  activityFactorFromTrainingDays,
  bmr as calcBmr,
  macroTargets,
  tdee as calcTdee,
} from '@/lib/calculations';

interface OnboardingFlowProps {
  initialProfile?: Partial<UserProfile>;
  onCompleteOnboarding: () => void;
  onCancelToLanding?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile = {},
  onCompleteOnboarding,
  onCancelToLanding,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(initialProfile.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialProfile.gender || 'male');
  const [age, setAge] = useState<number>(initialProfile.age || 28);
  const [heightCm, setHeightCm] = useState<number>(initialProfile.heightCm || 180);
  const [weightKg, setWeightKg] = useState<number>(initialProfile.weightKg || 80.4);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(78);
  const [bodyFat, setBodyFat] = useState<number>(initialProfile.bodyFatPercentage || 22.4);

  // Goal & Focus
  const [goal, setGoal] = useState<FitnessGoal>(initialProfile.fitnessGoal || 'build_muscle');
  const [focusMuscles, setFocusMuscles] = useState<string[]>(
    initialProfile.focusMuscles || ['Chest', 'Back', 'Shoulders']
  );

  // Experience & Split
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialProfile.experienceLevel || 'intermediate'
  );
  const [daysPerWeek, setDaysPerWeek] = useState<number>(
    initialProfile.trainingDaysPerWeek || 4
  );
  const [workoutDuration, setWorkoutDuration] = useState<number>(
    initialProfile.workoutDurationMinutes || 60
  );
  const [equipment, setEquipment] = useState<EquipmentType[]>(
    initialProfile.availableEquipment || ['full_gym', 'barbell', 'dumbbells']
  );

  // Nutrition
  const [dietPref, setDietPref] = useState<DietPreference>(
    initialProfile.dietPreference || 'non_vegetarian'
  );
  const [mealsPerDay, setMealsPerDay] = useState<number>(initialProfile.mealsPerDay || 4);
  const [foodPreferences, setFoodPreferences] = useState<string>(
    initialProfile.foodPreferences || ''
  );
  const [allergies, setAllergies] = useState<string>(initialProfile.allergies || '');

  // Step 5 Animation Simulation
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationPhase, setCalibrationPhase] = useState<number>(0);

  const toggleMuscleFocus = (muscle: string) => {
    if (focusMuscles.includes(muscle)) {
      setFocusMuscles(focusMuscles.filter((m) => m !== muscle));
    } else {
      setFocusMuscles([...focusMuscles, muscle]);
    }
  };

  const toggleEquipment = (eq: EquipmentType) => {
    if (equipment.includes(eq)) {
      if (equipment.length > 1) {
        setEquipment(equipment.filter((item) => item !== eq));
      }
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const bmrValue = calcBmr({ weightKg, heightCm, age, gender });
  const tdee = calcTdee(bmrValue, activityFactorFromTrainingDays(daysPerWeek));
  const macros = macroTargets({ tdeeKcal: tdee, weightKg, goal });
  const targetCalories = macros.targetCaloriesKcal;
  const targetProtein = macros.targetProteinGrams;
  const targetFat = macros.targetFatGrams;
  const targetCarbs = macros.targetCarbsGrams;

  const handleNextStep = () => {
    if (step === 4) {
      // Trigger calibration sequence on step 5
      setStep(5);
      setIsCalibrating(true);
      setCalibrationPhase(1);
      setTimeout(() => setCalibrationPhase(2), 700);
      setTimeout(() => setCalibrationPhase(3), 1400);
      setTimeout(() => {
        setIsCalibrating(false);
      }, 2000);
    } else {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          age: Number(age),
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          targetWeightKg: Number(targetWeightKg),
          bodyFatPercentage: Number(bodyFat),
          fitnessGoal: goal,
          focusMuscles,
          experienceLevel: experience,
          trainingDaysPerWeek: Number(daysPerWeek),
          workoutDurationMinutes: Number(workoutDuration),
          availableEquipment: equipment,
          dietPreference: dietPref,
          mealsPerDay: Number(mealsPerDay),
          foodPreferences: foodPreferences.trim(),
          allergies: allergies.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error?.message || 'Unable to save your profile.');
        return;
      }
      onCompleteOnboarding();
    } catch {
      setSubmitError('Unable to save your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="onboarding-flow-container"
      className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col justify-between selection:bg-[#B8F34A] selection:text-[#0B0D0F]"
    >
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-[#252B30] bg-[#12161A]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#9AA3A0]">
              Step <span className="text-[#B8F34A]">{step}</span> of {totalSteps}
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'bg-[#B8F34A] w-8'
                      : s < step
                      ? 'bg-[#45D483]'
                      : 'bg-[#252B30]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          {/* STEP 1: Bio-Metrics & Basic Stats */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8F34A]/10 text-[#B8F34A] text-xs font-bold mb-2 border border-[#B8F34A]/20">
                  <Scale className="w-3.5 h-3.5" />
                  <span>STEP 1: CLINICAL BIO-METRICS</span>
                </div>
                <h2 className="text-2xl font-black text-white">Let's Calibrate Your Baseline</h2>
                <p className="text-xs text-[#9AA3A0] mt-1">
                  Accurate biological measurements ensure precise BMR calculations and progressive volume load.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="input-onboarding-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                          gender === g
                            ? 'bg-[#B8F34A] text-[#0B0D0F]'
                            : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={15}
                    max={90}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    min={120}
                    max={230}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    min={35}
                    max={200}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                    min={35}
                    max={200}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goal & Target Muscle Emphasis */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5DA9FF]/10 text-[#5DA9FF] text-xs font-bold mb-2 border border-[#5DA9FF]/20">
                  <Flame className="w-3.5 h-3.5" />
                  <span>STEP 2: PHYSIQUE OBJECTIVE</span>
                </div>
                <h2 className="text-2xl font-black text-white">What is Your Primary Goal?</h2>
                <p className="text-xs text-[#9AA3A0] mt-1">
                  FitForge will adjust periodization volume, rest intervals, and macronutrient ratios accordingly.
                </p>
              </div>

              {/* Goal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'build_muscle',
                    title: 'Lean Hypertrophy',
                    desc: 'Maximize myofibrillar muscle hypertrophy with progressive volume splits.',
                  },
                  {
                    id: 'lose_fat',
                    title: 'Aggressive Fat Loss',
                    desc: 'Preserve lean mass in a structured caloric deficit with high protein.',
                  },
                  {
                    id: 'maintain',
                    title: 'Body Recomposition',
                    desc: 'Simultaneous fat reduction and muscle gain at maintenance calories.',
                  },
                  {
                    id: 'strength',
                    title: 'Max Strength & Power',
                    desc: 'Heavy compound specialization (Squat, Bench, Deadlift, OHP).',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setGoal(item.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      goal === item.id
                        ? 'bg-[#181D22] border-[#B8F34A] shadow-[0_0_15px_rgba(184,243,74,0.15)]'
                        : 'bg-[#0B0D0F] border-[#252B30] hover:border-[#9AA3A0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        {goal === item.id && <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" />}
                      </div>
                      <p className="text-xs text-[#9AA3A0]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Muscle Emphasis Pills */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-2">
                  Target Muscle Group Emphasis (Select 2-4)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Core'].map(
                    (m) => {
                      const isSelected = focusMuscles.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMuscleFocus(m)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold'
                              : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Experience, Schedule & Equipment */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5B942]/10 text-[#F5B942] text-xs font-bold mb-2 border border-[#F5B942]/20">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>STEP 3: TRAINING ENVIRONMENT</span>
                </div>
                <h2 className="text-2xl font-black text-white">Experience & Workout Routine</h2>
                <p className="text-xs text-[#9AA3A0] mt-1">
                  We customize the exercise selection to match your gym equipment and available days.
                </p>
              </div>

              <div className="space-y-4">
                {/* Experience */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Training Experience
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'beginner', label: 'Beginner (<1 yr)' },
                      { id: 'intermediate', label: 'Intermediate (1-3 yrs)' },
                      { id: 'advanced', label: 'Advanced (3+ yrs)' },
                    ].map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setExperience(e.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                          experience === e.id
                            ? 'bg-[#B8F34A] text-[#0B0D0F]'
                            : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Training Days */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Days Available Per Week
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDaysPerWeek(days)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          daysPerWeek === days
                            ? 'bg-[#B8F34A] text-[#0B0D0F]'
                            : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                        }`}
                      >
                        {days} Days / Wk
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Typical Session Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[45, 60, 75, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setWorkoutDuration(mins)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          workoutDuration === mins
                            ? 'bg-[#B8F34A] text-[#0B0D0F]'
                            : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Equipment */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Available Equipment Access
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'full_gym', label: 'Full Commercial Gym' },
                      { id: 'barbell', label: 'Barbells & Plates' },
                      { id: 'dumbbells', label: 'Dumbbells & Bench' },
                      { id: 'machines', label: 'Cables & Machines' },
                      { id: 'bodyweight', label: 'Bodyweight / Pullup Bar' },
                      { id: 'resistance_bands', label: 'Resistance Bands' },
                    ].map((eq) => {
                      const isSelected = equipment.includes(eq.id as any);
                      return (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => toggleEquipment(eq.id as any)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#181D22] border border-[#B8F34A] text-white'
                              : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0]'
                          }`}
                        >
                          <span>{eq.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B8F34A]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Dietary Architecture & Meal Scheduling */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45D483]/10 text-[#45D483] text-xs font-bold mb-2 border border-[#45D483]/20">
                  <Activity className="w-3.5 h-3.5" />
                  <span>STEP 4: NUTRITIONAL ARCHITECTURE</span>
                </div>
                <h2 className="text-2xl font-black text-white">Fueling & Macro Strategy</h2>
                <p className="text-xs text-[#9AA3A0] mt-1">
                  Configure dietary preferences for automated recipes and whole-food meal distributions.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Dietary Pattern
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'non_vegetarian', label: 'High Protein (Omnivore)' },
                      { id: 'vegetarian', label: 'Vegetarian' },
                      { id: 'vegan', label: 'Plant-Based / Vegan' },
                      { id: 'pescatarian', label: 'Pescatarian' },
                      { id: 'keto', label: 'Low Carb / Keto' },
                      { id: 'other', label: 'Flexible Standard' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDietPref(d.id as any)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                          dietPref === d.id
                            ? 'bg-[#181D22] border border-[#B8F34A] text-white'
                            : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0]'
                        }`}
                      >
                        <span>{d.label}</span>
                        {dietPref === d.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#B8F34A]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                      Meals Per Day
                    </label>
                    <select
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(Number(e.target.value))}
                      className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                    >
                      <option value={3}>3 Main Meals</option>
                      <option value={4}>4 Meals (3 + Post-Workout Shake)</option>
                      <option value={5}>5 Meals (High Frequency)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                      Food Allergies or Exclusions
                    </label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Peanuts, Lactose, Shellfish (Optional)"
                      className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                    Food Preferences
                  </label>
                  <textarea
                    value={foodPreferences}
                    onChange={(e) => setFoodPreferences(e.target.value)}
                    placeholder="e.g. High protein, lean poultry, oats, greek yogurt"
                    rows={3}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AI Engine Calibration & Program Synthesis */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in">
              {isCalibrating ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#B8F34A]/10 border-2 border-[#B8F34A] flex items-center justify-center text-[#B8F34A] animate-spin">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Synthesizing Your FitForge AI Blueprint...
                    </h3>
                    <p className="text-xs text-[#9AA3A0] mt-1">
                      {calibrationPhase === 1 && 'Calculating Mifflin-St Jeor BMR and metabolic baseline...'}
                      {calibrationPhase === 2 && 'Calibrating optimal hypertrophy weekly volume sets...'}
                      {calibrationPhase === 3 && 'Finalizing periodized split schedule & macro targets...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8F34A]/10 text-[#B8F34A] text-xs font-bold mb-2 border border-[#B8F34A]/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>STEP 5: CALIBRATION COMPLETE</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">Your Personalized Athlete Profile</h2>
                    <p className="text-xs text-[#9AA3A0] mt-1">
                      Your custom periodized program and dietary targets are generated and ready to track.
                    </p>
                  </div>

                  {/* Summary Card Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Calorie & Macro Target */}
                    <div className="bg-[#0B0D0F] p-5 rounded-2xl border border-[#252B30]">
                      <div className="flex items-center justify-between text-xs text-[#9AA3A0] uppercase font-bold mb-2">
                        <span>Daily Calorie Target</span>
                        <span className="text-[#B8F34A] font-mono">[CALCULATED]</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{targetCalories.toLocaleString()}</span>
                        <span className="text-xs text-[#B8F34A] font-bold">kcal / day</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#252B30] grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-[#5DA9FF] font-bold">PROTEIN</div>
                          <div className="font-bold text-white">{targetProtein}g</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#F5B942] font-bold">CARBS</div>
                          <div className="font-bold text-white">{targetCarbs}g</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#F05D5E] font-bold">FATS</div>
                          <div className="font-bold text-white">{targetFat}g</div>
                        </div>
                      </div>
                    </div>

                    {/* Split Protocol */}
                    <div className="bg-[#0B0D0F] p-5 rounded-2xl border border-[#252B30]">
                      <div className="flex items-center justify-between text-xs text-[#9AA3A0] uppercase font-bold mb-2">
                        <span>Training Schedule</span>
                        <span className="text-[#5DA9FF] font-mono">[AI SPLIT]</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {daysPerWeek}-Day Upper/Lower Hypertrophy
                      </div>
                      <p className="text-xs text-[#9AA3A0] mt-1">
                        Focus: <strong className="text-white">{(focusMuscles || []).slice(0, 3).join(', ') || 'Full Body'}</strong>
                      </p>
                      <div className="mt-3 pt-3 border-t border-[#252B30] flex items-center justify-between text-xs text-[#9AA3A0]">
                        <span>Est Duration: {workoutDuration} mins</span>
                        <span className="text-[#45D483] font-bold">RPE Auto-Regulation</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/40 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#B8F34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-bold text-[#B8F34A] block mb-1">
                        FitForge AI Telemetry Active
                      </strong>
                      <p className="text-xs text-[#F5F7F2] leading-relaxed">
                        Your baseline is recorded in your local secure store. You can adjust your targets or generate new workout splits anytime in Settings.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {submitError && (
            <div className="mt-4 p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 flex items-center gap-2 text-xs text-[#F05D5E]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[#252B30] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isCalibrating}
                className="px-4 py-2.5 rounded-xl border border-[#252B30] text-xs font-bold text-[#9AA3A0] hover:text-white hover:bg-[#181D22] flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancelToLanding}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#9AA3A0] hover:text-white"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                id="btn-onboarding-next"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-2xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs uppercase tracking-wider shadow-[0_2px_14px_rgba(184,243,74,0.3)] transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <LoadingButton
                id="btn-onboarding-launch-app"
                onClick={handleFinalLaunch}
                isLoading={isSubmitting}
                disabled={isCalibrating}
                loadingText="Saving profile..."
                icon={<Sparkles className="w-4 h-4" />}
                className="px-8 py-3.5 uppercase tracking-wider shadow-[0_4px_20px_rgba(184,243,74,0.4)] hover:scale-105"
              >
                Launch My FitForge Dashboard
              </LoadingButton>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-[#9AA3A0]">
        All recommendations are strictly calculated using exercise physiology and sports nutrition principles.
      </footer>
    </div>
  );
};
