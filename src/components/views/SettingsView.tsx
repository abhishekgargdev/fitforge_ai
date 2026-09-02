'use client';

// Fields used: unitSystem, theme, aiPersona, audioChimes.
// Actions: restart onboarding, public landing, sign out, export account, delete account.
// Nutrition prefs live on profile from onboarding (not edited here). Wearable/notification
// marketing copy besides rest-timer chimes is not persisted.

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Volume2,
  Shield,
  Sparkles,
  Moon,
  Sun,
  Download,
  Trash2,
  Compass,
  LogOut,
  Sliders,
} from 'lucide-react';
import { LoadingButton } from '../common/LoadingButton';
import type { AiPersona, UserSettings } from '@/types';

interface SettingsViewProps {
  onRestartOnboarding?: () => void;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

const defaultSettings: UserSettings = {
  unitSystem: 'metric',
  theme: 'dark',
  aiPersona: 'scientific',
  audioChimes: true,
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  onRestartOnboarding,
  onGoToLanding,
  onSignOut,
}) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Unable to load settings.');
        setSettings(json.data.settings);
        setLoaded(true);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Unable to load settings.');
      });
  }, []);

  const persist = async (next: UserSettings, extra?: { restartOnboarding?: boolean }) => {
    setSaveError('');
    const previous = settings;
    setSettings(next);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...next, ...extra }),
    });
    const json = await res.json();
    if (!res.ok) {
      setSettings(previous);
      setSaveError(json.error?.message || 'Unable to save settings.');
      return false;
    }
    setSettings(json.data.settings);
    return true;
  };

  const exportAccount = async () => {
    setSaveError('');
    const res = await fetch('/api/account/export');
    const json = await res.json();
    if (!res.ok) {
      setSaveError(json.error?.message || 'Unable to export account.');
      return;
    }
    const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fitforge-ai-export.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your FitForge AI account and all saved data? This cannot be undone.'
    );
    if (!confirmed) return;
    setBusy(true);
    setSaveError('');
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error?.message || 'Unable to delete account.');
        return;
      }
      window.location.assign('/login');
    } finally {
      setBusy(false);
    }
  };

  const restartOnboarding = async () => {
    setBusy(true);
    const ok = await persist(settings, { restartOnboarding: true });
    setBusy(false);
    if (ok) onRestartOnboarding?.();
  };

  return (
    <div id="settings-view" className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#B8F34A]" />
          System Preferences & Configuration
        </h2>
        <p className="text-xs text-[#9AA3A0] mt-1">
          Customize engine units, audio feedback, AI coaching tone, and data storage
        </p>
        {(loadError || saveError) && (
          <p className="text-xs font-bold text-[#F05D5E] mt-3">{loadError || saveError}</p>
        )}
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#9AA3A0]">
          Units of Measurement
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!loaded}
            onClick={() => persist({ ...settings, unitSystem: 'metric' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.unitSystem === 'metric'
                ? 'bg-[#181D22] border-[#B8F34A] text-white ring-1 ring-[#B8F34A]'
                : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
            }`}
          >
            <div className="text-xs font-bold text-white mb-1">Metric System (Default)</div>
            <div className="text-[11px] text-[#9AA3A0]">Kilograms (kg), Centimeters (cm), Milliliters (ml)</div>
          </button>

          <button
            type="button"
            disabled={!loaded}
            onClick={() => persist({ ...settings, unitSystem: 'imperial' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.unitSystem === 'imperial'
                ? 'bg-[#181D22] border-[#B8F34A] text-white ring-1 ring-[#B8F34A]'
                : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
            }`}
          >
            <div className="text-xs font-bold text-white mb-1">Imperial System</div>
            <div className="text-[11px] text-[#9AA3A0]">Pounds (lbs), Inches (in), Fluid Ounces (fl oz)</div>
          </button>
        </div>
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          {settings.theme === 'light' ? (
            <Sun className="w-4 h-4 text-[#B8F34A]" />
          ) : (
            <Moon className="w-4 h-4 text-[#B8F34A]" />
          )}
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Appearance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { id: 'dark', title: 'Dark', desc: 'Default FitForge night console.' },
              { id: 'light', title: 'Light', desc: 'High-contrast daylight surfaces.' },
              { id: 'system', title: 'System', desc: 'Follow the device color scheme.' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!loaded}
              onClick={() => persist({ ...settings, theme: item.id })}
              className={`p-4 rounded-xl border text-left transition-all ${
                settings.theme === item.id
                  ? 'bg-[#181D22] border-[#B8F34A] text-white'
                  : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">{item.title}</div>
              <div className="text-[11px] text-[#9AA3A0] leading-relaxed">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B8F34A]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            FitForge AI Coach Persona
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'scientific' as AiPersona,
              title: 'Evidence-Based & Clinical',
              desc: 'High precision biomechanics, anatomical cues & exact macronutrient stoichiometry.',
            },
            {
              id: 'motivational' as AiPersona,
              title: 'High-Energy Athletic',
              desc: 'Energetic encouragement with focus on mind-muscle connection and PRs.',
            },
            {
              id: 'strict' as AiPersona,
              title: 'Elite Drill Sergeant',
              desc: 'Zero excuses, strict adherence metrics, tough love accountability.',
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!loaded}
              onClick={() => persist({ ...settings, aiPersona: item.id })}
              className={`p-4 rounded-xl border text-left transition-all ${
                settings.aiPersona === item.id
                  ? 'bg-[#181D22] border-[#B8F34A] text-white'
                  : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">{item.title}</div>
              <div className="text-[11px] text-[#9AA3A0] leading-relaxed">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#B8F34A]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Workout Plan Generation Mode
          </h3>
        </div>
        <p className="text-xs text-[#9AA3A0]">
          Choose whether AI periodically regenerates your weekly split or if you prefer full manual control over your workouts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!loaded}
            onClick={() => persist({ ...settings, planMode: 'ai' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              (settings.planMode || 'ai') === 'ai'
                ? 'bg-[#181D22] border-[#B8F34A] text-white ring-1 ring-[#B8F34A]'
                : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
            }`}
          >
            <div className="text-xs font-bold text-white mb-1">AI Adaptive (Default)</div>
            <div className="text-[11px] text-[#9AA3A0]">
              Automated weekly plan generation and AI-driven adaptations based on your progress.
            </div>
          </button>
          <button
            type="button"
            disabled={!loaded}
            onClick={() => persist({ ...settings, planMode: 'manual' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.planMode === 'manual'
                ? 'bg-[#181D22] border-[#B8F34A] text-white ring-1 ring-[#B8F34A]'
                : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
            }`}
          >
            <div className="text-xs font-bold text-white mb-1">Manual Control</div>
            <div className="text-[11px] text-[#9AA3A0]">
              AI will not auto-generate or overwrite your plan. You maintain full manual control.
            </div>
          </button>
        </div>
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#181D22] text-[#B8F34A] flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Workout Rest Audio Chime</span>
            <span className="text-xs text-[#9AA3A0]">Synthesize Web Audio chime on rest countdown complete</span>
          </div>
        </div>

        <button
          type="button"
          disabled={!loaded}
          onClick={() => persist({ ...settings, audioChimes: !settings.audioChimes })}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
            settings.audioChimes ? 'bg-[#B8F34A]' : 'bg-[#252B30]'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-[#0B0D0F] transition-transform ${
              settings.audioChimes ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#B8F34A]" />
            <span className="text-sm font-bold text-white block">Guided Athlete Onboarding</span>
          </div>
          <span className="text-xs text-[#9AA3A0]">
            Re-run the 5-step biometric and goal calibration wizard to adjust your baseline
          </span>
        </div>

        {onRestartOnboarding && (
          <LoadingButton
            type="button"
            id="btn-settings-restart-onboarding"
            onClick={restartOnboarding}
            isLoading={busy}
            loadingText="Launch Onboarding Flow"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            className="px-4 py-2.5 bg-[#181D22] border border-[#B8F34A]/40 text-[#B8F34A] hover:bg-[#B8F34A] hover:text-[#0B0D0F]"
          >
            Launch Onboarding Flow
          </LoadingButton>
        )}
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-white block">Athlete Session & Portal</span>
          <span className="text-xs text-[#9AA3A0]">Switch to the public landing showcase or sign out of your account</span>
        </div>

        <div className="flex items-center gap-2">
          {onGoToLanding && (
            <button
              type="button"
              id="btn-settings-goto-landing"
              onClick={onGoToLanding}
              className="px-4 py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-white hover:text-[#5DA9FF] hover:border-[#5DA9FF]/50 flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#5DA9FF]" /> Public Landing
            </button>
          )}

          {onSignOut && (
            <button
              type="button"
              id="btn-settings-sign-out"
              onClick={onSignOut}
              className="px-4 py-2 rounded-xl bg-[#181D22] border border-[#F05D5E]/30 text-xs font-bold text-[#F05D5E] hover:bg-[#F05D5E]/20 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#B8F34A]" />
            <span className="text-sm font-bold text-white block">Privacy & Data</span>
          </div>
          <span className="text-xs text-[#9AA3A0]">Export your account JSON or permanently delete everything we store</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!loaded}
            onClick={exportAccount}
            className="px-4 py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-white hover:text-[#B8F34A] flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>

          <LoadingButton
            type="button"
            onClick={deleteAccount}
            isLoading={busy}
            loadingText="Delete Account"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            className="px-4 py-2 !bg-[#F05D5E]/15 border border-[#F05D5E]/30 text-[#F05D5E] hover:!bg-[#F05D5E]/25"
          >
            Delete Account
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};
