import React, { useState } from 'react';
import { Settings, Volume2, Bell, Shield, Sparkles, Moon, Sun, Download, Trash2, Compass, LogOut, Sliders } from 'lucide-react';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
  onRestartOnboarding?: () => void;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  onResetData,
  onRestartOnboarding,
  onGoToLanding,
  onSignOut,
}) => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [audioChimes, setAudioChimes] = useState(true);
  const [aiPersona, setAiPersona] = useState<'scientific' | 'motivational' | 'strict'>('scientific');

  return (
    <div id="settings-view" className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#B8F34A]" />
          System Preferences & Configuration
        </h2>
        <p className="text-xs text-[#9AA3A0] mt-1">
          Customize engine units, audio feedback, AI coaching tone, and data storage
        </p>
      </div>

      {/* Unit Settings */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#9AA3A0]">
          Units of Measurement
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUnitSystem('metric')}
            className={`p-4 rounded-xl border text-left transition-all ${
              unitSystem === 'metric'
                ? 'bg-[#181D22] border-[#B8F34A] text-white ring-1 ring-[#B8F34A]'
                : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
            }`}
          >
            <div className="text-xs font-bold text-white mb-1">Metric System (Default)</div>
            <div className="text-[11px] text-[#9AA3A0]">Kilograms (kg), Centimeters (cm), Milliliters (ml)</div>
          </button>

          <button
            type="button"
            onClick={() => setUnitSystem('imperial')}
            className={`p-4 rounded-xl border text-left transition-all ${
              unitSystem === 'imperial'
                ? 'bg-[#181D22] border-[#B8F34A] text-white ring-1 ring-[#B8F34A]'
                : 'bg-[#0B0D0F]/40 border-[#252B30] text-[#9AA3A0]'
            }`}
          >
            <div className="text-xs font-bold text-white mb-1">Imperial System</div>
            <div className="text-[11px] text-[#9AA3A0]">Pounds (lbs), Inches (in), Fluid Ounces (fl oz)</div>
          </button>
        </div>
      </div>

      {/* AI Coach Tuning */}
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
              id: 'scientific',
              title: 'Evidence-Based & Clinical',
              desc: 'High precision biomechanics, anatomical cues & exact macronutrient stoichiometry.',
            },
            {
              id: 'motivational',
              title: 'High-Energy Athletic',
              desc: 'Energetic encouragement with focus on mind-muscle connection and PRs.',
            },
            {
              id: 'strict',
              title: 'Elite Drill Sergeant',
              desc: 'Zero excuses, strict adherence metrics, tough love accountability.',
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAiPersona(item.id as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                aiPersona === item.id
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

      {/* Audio & Feedback */}
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
          onClick={() => setAudioChimes(!audioChimes)}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
            audioChimes ? 'bg-[#B8F34A]' : 'bg-[#252B30]'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-[#0B0D0F] transition-transform ${
              audioChimes ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Onboarding & Setup Calibration */}
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
          <button
            type="button"
            id="btn-settings-restart-onboarding"
            onClick={onRestartOnboarding}
            className="px-4 py-2.5 rounded-xl bg-[#181D22] border border-[#B8F34A]/40 text-[#B8F34A] hover:bg-[#B8F34A] hover:text-[#0B0D0F] font-bold text-xs transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Onboarding Flow</span>
          </button>
        )}
      </div>

      {/* Account Session & Landing Page */}
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

      {/* Data Management & Export */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-white block">Local Data Management</span>
          <span className="text-xs text-[#9AA3A0]">Export your logs to JSON or reset back to initial seed data</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ exportDate: new Date() }, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', 'fitforge-ai-export.json');
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-4 py-2 rounded-xl bg-[#181D22] border border-[#252B30] text-xs font-bold text-white hover:text-[#B8F34A] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 rounded-xl bg-[#F05D5E]/15 border border-[#F05D5E]/30 text-xs font-bold text-[#F05D5E] hover:bg-[#F05D5E]/25 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
