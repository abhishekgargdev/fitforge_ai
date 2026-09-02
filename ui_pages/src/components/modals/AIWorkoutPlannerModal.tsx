import React, { useState } from 'react';
import { UserProfile, FitnessGoal, ExperienceLevel, EquipmentType } from '../../types';
import { Sparkles, X, Check, Loader2, Dumbbell, Zap, Flame, Shield } from 'lucide-react';

interface AIWorkoutPlannerModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onApplyGeneratedPlan: (plan: any) => void;
}

export const AIWorkoutPlannerModal: React.FC<AIWorkoutPlannerModalProps> = ({
  userProfile,
  onClose,
  onApplyGeneratedPlan,
}) => {
  const [goal, setGoal] = useState<FitnessGoal>(userProfile.fitnessGoal || 'build_muscle');
  const [daysPerWeek, setDaysPerWeek] = useState(userProfile.trainingDaysPerWeek || 4);
  const [duration, setDuration] = useState(userProfile.workoutDurationMinutes || 60);
  const [experience, setExperience] = useState<ExperienceLevel>(userProfile.experienceLevel || 'intermediate');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(
    userProfile.availableEquipment || ['full_gym', 'barbell', 'dumbbells']
  );
  const [focusMuscles, setFocusMuscles] = useState<string[]>(['Chest', 'Back', 'Shoulders', 'Legs']);
  const [preferences, setPreferences] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const stepsList = [
    'Analyzing your bio-profile & biomechanics...',
    'Checking your recent volume & training history...',
    'Selecting optimal compound & isolation exercises...',
    'Building progressive overload curve & rest intervals...',
    'Creating your personalized FitForge AI plan...',
  ];

  const equipmentOptions: { id: EquipmentType; label: string }[] = [
    { id: 'full_gym', label: 'Full Commercial Gym' },
    { id: 'barbell', label: 'Barbell & Olympic Plates' },
    { id: 'dumbbells', label: 'Dumbbells Set' },
    { id: 'machines', label: 'Cable & Selectorized Machines' },
    { id: 'resistance_bands', label: 'Resistance Bands' },
    { id: 'bodyweight', label: 'Calisthenics / Bodyweight' },
    { id: 'home_gym', label: 'Home Gym Rack' },
  ];

  const muscleOptions = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'];

  const toggleEquipment = (eq: EquipmentType) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const toggleMuscle = (muscle: string) => {
    setFocusMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((item) => item !== muscle) : [...prev, muscle]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(0);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < stepsList.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const res = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          daysPerWeek,
          duration,
          experience,
          equipment: selectedEquipment,
          focusMuscles,
          preferences,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);
      setTimeout(() => {
        setIsGenerating(false);
        onApplyGeneratedPlan(data);
      }, 500);
    } catch (e) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      // Fallback
      onApplyGeneratedPlan({
        planTitle: '8-Week Precision Hypertrophy Plan',
        daysPerWeek,
        weeklySchedule: [],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        id="modal-ai-workout-planner"
        className="w-full max-w-2xl bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#252B30]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B8F34A]/20 text-[#B8F34A] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Build Your Workout Plan</h2>
            </div>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Let FitForge AI engineer a science-backed periodization plan based on your body and goals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Loading Animation */}
        {isGenerating ? (
          <div className="py-14 text-center flex flex-col items-center justify-center space-y-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#B8F34A]/20 border-t-[#B8F34A] animate-spin" />
              <Dumbbell className="w-8 h-8 text-[#B8F34A] animate-pulse" />
            </div>

            <div className="max-w-md w-full px-4">
              <h3 className="text-lg font-bold text-white mb-2">Synthesizing Workout Plan</h3>
              <p className="text-xs text-[#B8F34A] font-semibold min-h-[20px] transition-all">
                {stepsList[generationStep]}
              </p>

              <div className="w-full bg-[#0B0D0F] h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-[#B8F34A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${((generationStep + 1) / stepsList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            {/* Goal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Primary Goal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'lose_fat', label: 'Fat Loss', icon: Flame },
                  { id: 'build_muscle', label: 'Muscle Gain', icon: Dumbbell },
                  { id: 'strength', label: 'Pure Strength', icon: Zap },
                  { id: 'maintain', label: 'Recomposition', icon: Shield },
                  { id: 'improve_fitness', label: 'Cardio & Fitness', icon: Sparkles },
                ].map((g) => {
                  const Icon = g.icon;
                  const isSelected = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as FitnessGoal)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#B8F34A]/15 border-[#B8F34A] text-white shadow-sm'
                          : 'bg-[#181D22] border-[#252B30] text-[#9AA3A0] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#B8F34A]' : 'text-[#9AA3A0]'}`} />
                      <span>{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Training Days & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                  Training Frequency ({daysPerWeek} Days / Week)
                </label>
                <div className="flex gap-1.5">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDaysPerWeek(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        daysPerWeek === num
                          ? 'bg-[#B8F34A] text-[#0B0D0F]'
                          : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                      }`}
                    >
                      {num}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                  Session Duration ({duration} min)
                </label>
                <div className="flex gap-1.5">
                  {[30, 45, 60, 75, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        duration === mins
                          ? 'bg-[#B8F34A] text-[#0B0D0F]'
                          : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperience(exp)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                      experience === exp
                        ? 'bg-[#B8F34A]/15 border-[#B8F34A] text-white'
                        : 'bg-[#181D22] border-[#252B30] text-[#9AA3A0] hover:text-white'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Equipment Multi-select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Available Equipment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equipmentOptions.map((eq) => {
                  const isChecked = selectedEquipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-[#181D22] border-[#B8F34A] text-white'
                          : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
                      }`}
                    >
                      <span>{eq.label}</span>
                      {isChecked && <Check className="w-4 h-4 text-[#B8F34A]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Focus Muscles */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Focus Muscle Groups
              </label>
              <div className="flex flex-wrap gap-1.5">
                {muscleOptions.map((muscle) => {
                  const isSelected = focusMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => toggleMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold'
                          : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
                Special Preferences or Injuries (Optional)
              </label>
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. Focus on shoulder health, no overhead lunges, include drop-sets"
                className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
              />
            </div>
          </div>
        )}

        {/* Footer CTA */}
        {!isGenerating && (
          <div className="mt-6 pt-4 border-t border-[#252B30] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white text-xs font-bold"
            >
              Cancel
            </button>
            <button
              id="btn-submit-ai-generate-workout"
              type="button"
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs flex items-center gap-2 shadow-[0_0_18px_rgba(184,243,74,0.35)] transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Generate Workout Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
