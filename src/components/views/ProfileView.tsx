'use client';

// Fields used: UserProfile.name, email, age, gender, heightCm, weightKg, bodyFatPercentage,
// fitnessGoal, experienceLevel, trainingDaysPerWeek (chips). Email is display-only.
// memberSince from users.createdAt. Wearable cards are static UI (not persisted).

import React, { useEffect, useState } from 'react';
import { UserProfile, FitnessGoal, ExperienceLevel, EquipmentType } from '@/types';
import { OriginBadge } from '../common/OriginBadge';
import {
  User,
  Shield,
  Dumbbell,
  Scale,
  Save,
  CheckCircle2,
  Watch,
  Smartphone,
  Flame,
  Target,
} from 'lucide-react';
import { LoadingButton } from '../common/LoadingButton';

interface ProfileViewProps {
  userProfile: UserProfile;
  memberSince?: string | null;
  onUpdateProfile: (updated: UserProfile) => void | Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  memberSince,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const memberLabel = memberSince
    ? new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const fitnessGoalOptions = [
    'lose_fat',
    'build_muscle',
    'maintain',
    'improve_fitness',
    'strength',
    'general_health',
  ] as const;

  const experienceOptions = ['beginner', 'intermediate', 'advanced'] as const;
  const dietOptions = ['non_vegetarian', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other'] as const;
  const equipmentOptions: EquipmentType[] = [
    'full_gym',
    'dumbbells',
    'barbell',
    'machines',
    'resistance_bands',
    'bodyweight',
    'home_gym',
  ];

  const toggleEquipment = (equipment: EquipmentType) => {
    const current = formData.availableEquipment || [];
    const next = current.includes(equipment)
      ? current.filter((item) => item !== equipment)
      : [...current, equipment];
    setFormData({ ...formData, availableEquipment: next as EquipmentType[] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile-view" className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#B8F34A] to-[#45D483] text-[#0B0D0F] font-black text-3xl flex items-center justify-center shadow-lg shrink-0">
          {formData.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-white">{formData.name}</h2>
              <p className="text-xs text-[#9AA3A0]">
                {formData.email}
                {memberLabel ? ` • Member since ${memberLabel}` : ''}
              </p>
            </div>
            <div className="self-center sm:self-auto">
              <OriginBadge origin="MEASURED" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-3 py-1 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-semibold text-white capitalize">
              Goal: {formData.fitnessGoal.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-semibold text-[#B8F34A] capitalize">
              {formData.experienceLevel} Level
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-semibold text-[#5DA9FF]">
              {formData.trainingDaysPerWeek} Days / Week
            </span>
          </div>
        </div>
      </div>

      {/* Edit Bio-Metrics Form */}
      <form onSubmit={handleSubmit} className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#252B30]">
          <div>
            <h3 className="text-base font-bold text-white">Biometrics & Body Composition</h3>
            <p className="text-xs text-[#9AA3A0]">Used by the AI engine to compute TDEE, volume tolerance, and macros</p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-[#45D483] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Profile Updated!
            </span>
          )}
          {saveError && (
            <span className="text-xs font-bold text-[#F05D5E]">{saveError}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Biological Sex
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Current Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Target Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.targetWeightKg ?? formData.weightKg}
              onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Body Fat %
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.bodyFatPercentage}
              onChange={(e) => setFormData({ ...formData, bodyFatPercentage: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Workout Duration (min)
            </label>
            <input
              type="number"
              value={formData.workoutDurationMinutes}
              onChange={(e) => setFormData({ ...formData, workoutDurationMinutes: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Fitness Goal
            </label>
            <select
              value={formData.fitnessGoal}
              onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value as any })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            >
              {fitnessGoalOptions.map((goal) => (
                <option key={goal} value={goal}>{goal.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            >
              {experienceOptions.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
            Focus Muscles
          </label>
          <input
            type="text"
            value={formData.focusMuscles.join(', ')}
            onChange={(e) => setFormData({ ...formData, focusMuscles: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })}
            placeholder="Chest, Back, Legs"
            className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
          />
        </div>

        <div className="pt-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
            Available Equipment
          </label>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((equipment) => {
              const isSelected = (formData.availableEquipment || []).includes(equipment);
              return (
                <button
                  key={equipment}
                  type="button"
                  onClick={() => toggleEquipment(equipment)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${
                    isSelected
                      ? 'bg-[#B8F34A] text-[#0B0D0F] border-[#B8F34A]'
                      : 'bg-[#0B0D0F] border-[#252B30] text-[#9AA3A0]'
                  }`}
                >
                  {equipment.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Diet Preference
            </label>
            <select
              value={formData.dietPreference}
              onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as any })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            >
              {dietOptions.map((diet) => (
                <option key={diet} value={diet}>{diet.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Meals Per Day
            </label>
            <input
              type="number"
              value={formData.mealsPerDay}
              onChange={(e) => setFormData({ ...formData, mealsPerDay: Number(e.target.value) })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>
        </div>

        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Food Preferences
            </label>
            <input
              type="text"
              value={formData.foodPreferences}
              onChange={(e) => setFormData({ ...formData, foodPreferences: e.target.value })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1">
              Allergies
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
          </div>
        </div>

        {/* Specific Training Days */}
        <div className="pt-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA3A0] mb-1.5">
            Specific Training Days (AI Schedules Workouts Only On These Days)
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {[
              { id: 'mon', label: 'Mon' },
              { id: 'tue', label: 'Tue' },
              { id: 'wed', label: 'Wed' },
              { id: 'thu', label: 'Thu' },
              { id: 'fri', label: 'Fri' },
              { id: 'sat', label: 'Sat' },
              { id: 'sun', label: 'Sun' },
            ].map((day) => {
              const currentDays = formData.trainingDays || ['mon', 'wed', 'fri', 'sat'];
              const isSelected = currentDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => {
                    let next: string[];
                    if (isSelected) {
                      if (currentDays.length <= 2) return;
                      next = currentDays.filter((d) => d !== day.id);
                    } else {
                      next = [...currentDays, day.id];
                    }
                    setFormData({
                      ...formData,
                      trainingDays: next,
                      trainingDaysPerWeek: next.length,
                    });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-[#B8F34A] text-[#0B0D0F]'
                      : 'bg-[#0B0D0F] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#252B30] flex justify-end">
          <LoadingButton
            id="btn-save-profile"
            type="submit"
            isLoading={isSaving}
            loadingText="Saving..."
            icon={<Save className="w-4 h-4" />}
            className="px-6 py-2.5 shadow-[0_0_15px_rgba(184,243,74,0.3)] transition-all"
          >
            Save Biometric Updates
          </LoadingButton>
        </div>
      </form>

   
    </div>
  );
};
