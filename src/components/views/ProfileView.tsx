'use client';

// Fields used: UserProfile.name, email, age, gender, heightCm, weightKg, bodyFatPercentage,
// fitnessGoal, experienceLevel, trainingDaysPerWeek (chips). Email is display-only.
// memberSince from users.createdAt. Wearable cards are static UI (not persisted).

import React, { useEffect, useState } from 'react';
import { UserProfile, FitnessGoal, ExperienceLevel } from '@/types';
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
        </div>

        <div className="pt-4 border-t border-[#252B30] flex justify-end">
          <button
            id="btn-save-profile"
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(184,243,74,0.3)] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Biometric Updates
          </button>
        </div>
      </form>

      {/* Connected Health Ecosystem */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Connected Hardware & Sensor Ecosystem</h3>
        <p className="text-xs text-[#9AA3A0] mb-4">Sync real-time heart rate, resting metabolic rate, and steps</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Watch className="w-5 h-5 text-[#5DA9FF]" />
              <div>
                <span className="text-xs font-bold text-white block">Apple Watch / HealthKit</span>
                <span className="text-[10px] text-[#45D483]">Synced 12m ago</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#45D483]" />
          </div>

          <div className="p-4 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#B8F34A]" />
              <div>
                <span className="text-xs font-bold text-white block">Garmin Connect</span>
                <span className="text-[10px] text-[#45D483]">Connected</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#45D483]" />
          </div>

          <div className="p-4 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <Watch className="w-5 h-5 text-[#9AA3A0]" />
              <div>
                <span className="text-xs font-bold text-white block">Whoop 4.0 Strap</span>
                <span className="text-[10px] text-[#9AA3A0]">Not Connected</span>
              </div>
            </div>
            <button className="text-[10px] font-bold text-[#B8F34A] hover:underline">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
};
