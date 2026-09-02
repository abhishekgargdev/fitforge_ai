'use client';

import React, { useState } from 'react';
import { ActiveNavTab, UserProfile } from '@/types';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  Apple,
  TrendingUp,
  Bot,
  User,
  Settings,
  Menu,
  X,
  Flame,
  Compass,
  LogOut,
  HeartPulse,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  userProfile: UserProfile;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  onGoToLanding,
  onSignOut,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomItems = [
    { id: 'dashboard' as ActiveNavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'workouts' as ActiveNavTab, label: 'Workouts', icon: Dumbbell },
    { id: 'ai_coach' as ActiveNavTab, label: 'AI Coach', icon: Bot, isCenter: true },
    { id: 'nutrition' as ActiveNavTab, label: 'Nutrition', icon: Apple },
    { id: 'progress' as ActiveNavTab, label: 'Progress', icon: TrendingUp },
  ];

  const handleSelect = (tab: ActiveNavTab) => {
    onSelectTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Top Mobile Bar */}
      <div
        id="mobile-top-bar"
        className="md:hidden flex items-center justify-between px-4 py-3 bg-[#12161A] border-b border-[#252B30] sticky top-0 z-40"
      >
        <BrandLogo variant="full" className="scale-90 origin-left" />
        <div className="flex items-center gap-2">
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl bg-[#181D22] border border-[#252B30] text-[#F5F7F2]"
            aria-label="Open full menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide-out Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm h-full bg-[#12161A] border-l border-[#252B30] p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#252B30]">
                <BrandLogo variant="full" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg bg-[#181D22] text-[#9AA3A0] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User overview badge */}
              <div className="mt-4 p-3 rounded-xl bg-[#181D22] border border-[#252B30] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-black flex items-center justify-center text-sm">
                  {userProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{userProfile.name}</div>
                  <div className="text-xs text-[#B8F34A]">4 Days / Wk • Intermediate</div>
                </div>
              </div>

              {/* Menu items */}
              <div className="mt-6 space-y-1.5">
                {[
                  { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'workouts' as ActiveNavTab, label: 'Workouts', icon: Dumbbell },
                  { id: 'exercises' as ActiveNavTab, label: 'Exercise Library', icon: BookOpen },
                  { id: 'nutrition' as ActiveNavTab, label: 'Nutrition & Diary', icon: Apple },
                  { id: 'progress' as ActiveNavTab, label: 'Progress & Scans', icon: TrendingUp },
                  { id: 'recovery' as ActiveNavTab, label: 'Recovery Protocols', icon: HeartPulse },
                  { id: 'ai_coach' as ActiveNavTab, label: 'FitForge AI Coach', icon: Bot, highlight: true },
                  { id: 'profile' as ActiveNavTab, label: 'Profile Settings', icon: User },
                  { id: 'settings' as ActiveNavTab, label: 'System & Preferences', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold'
                          : 'text-[#9AA3A0] hover:text-white hover:bg-[#181D22]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#0B0D0F]' : item.highlight ? 'text-[#B8F34A]' : 'text-[#9AA3A0]'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick portal navigation */}
              <div className="mt-4 pt-4 border-t border-[#252B30] space-y-2">
                {onGoToLanding && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onGoToLanding();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#5DA9FF] hover:bg-[#181D22]"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Public Landing Page</span>
                  </button>
                )}
                {onSignOut && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F05D5E] hover:bg-[#181D22]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#252B30] text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#9AA3A0]">
                <Flame className="w-4 h-4 text-[#F5B942]" />
                <span>FitForge AI v2.5 • Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Bar */}
      <nav
        id="mobile-bottom-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12161A]/95 backdrop-blur-md border-t border-[#252B30] px-2 py-2 flex items-center justify-around"
      >
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                id={`btn-mobile-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`relative -top-3 p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#B8F34A] text-[#0B0D0F] shadow-[0_0_18px_rgba(184,243,74,0.5)] scale-110'
                    : 'bg-[#181D22] text-[#B8F34A] border border-[#B8F34A]/40'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">AI</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`btn-mobile-nav-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-[#B8F34A]' : 'text-[#9AA3A0] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
