'use client';

import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  Flame,
  LogOut,
  Compass,
  HeartPulse,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  userProfile: UserProfile;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  isCollapsed,
  onToggleCollapse,
  onGoToLanding,
  onSignOut,
}) => {
  const mainNavItems = [
    { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts' as ActiveNavTab, label: 'Workouts', icon: Dumbbell },
    { id: 'exercises' as ActiveNavTab, label: 'Exercises', icon: BookOpen },
    { id: 'nutrition' as ActiveNavTab, label: 'Nutrition', icon: Apple },
    { id: 'progress' as ActiveNavTab, label: 'Progress', icon: TrendingUp },
    { id: 'recovery' as ActiveNavTab, label: 'Recovery', icon: HeartPulse },
    { id: 'ai_coach' as ActiveNavTab, label: 'AI Coach', icon: Bot, highlight: true },
  ];

  const bottomNavItems = [
    { id: 'profile' as ActiveNavTab, label: 'Profile', icon: User },
    { id: 'settings' as ActiveNavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`hidden md:flex flex-col justify-between border-r border-[#252B30] bg-[#12161A] text-[#F5F7F2] transition-all duration-300 relative z-30 shrink-0 h-screen sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Logo */}
      <div className="p-4 border-b border-[#252B30]/60 flex items-center justify-between">
        {!isCollapsed ? (
          <BrandLogo variant="full" />
        ) : (
          <div className="mx-auto">
            <BrandLogo variant="icon" />
          </div>
        )}
        <button
          id="btn-collapse-sidebar"
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#9AA3A0] hover:text-white hover:bg-[#181D22] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-widest text-[#9AA3A0]">
          {!isCollapsed && 'Main Engine'}
        </div>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group relative ${
                isActive
                  ? 'bg-[#B8F34A] text-[#0B0D0F] shadow-[0_2px_12px_rgba(184,243,74,0.2)] font-bold'
                  : 'text-[#9AA3A0] hover:text-white hover:bg-[#181D22]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#0B0D0F]' : item.highlight ? 'text-[#B8F34A]' : 'text-[#9AA3A0]'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left flex items-center justify-between">
                  {item.label}
                  {item.highlight && !isActive && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#B8F34A]/20 text-[#B8F34A] border border-[#B8F34A]/40 animate-pulse">
                      GenAI
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}

        {/* Streak banner */}
        {!isCollapsed && (
          <div className="mt-6 p-3 rounded-xl bg-gradient-to-r from-[#181D22] to-[#1E262E] border border-[#252B30] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5B942]/15 text-[#F5B942] flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                4-Day Streak 🔥
              </div>
              <div className="text-[10px] text-[#9AA3A0]">92% weekly adherence</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-[#252B30]/60 space-y-1">
        <div className="px-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-[#9AA3A0]">
          {!isCollapsed && 'Account & System'}
        </div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold'
                  : 'text-[#9AA3A0] hover:text-white hover:bg-[#181D22]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 text-[#9AA3A0] group-hover:text-white" />
              {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
            </button>
          );
        })}

        {/* Profile Card Summary */}
        <div
          onClick={() => onSelectTab('profile')}
          className={`mt-2 p-2 rounded-xl bg-[#0B0D0F]/60 border border-[#252B30] flex items-center gap-2.5 cursor-pointer hover:border-[#B8F34A]/40 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#B8F34A] text-[#0B0D0F] font-extrabold flex items-center justify-center text-xs shrink-0">
            {userProfile.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{userProfile.name}</div>
              <div className="text-[10px] text-[#B8F34A] truncate">Intermediate Athlete</div>
            </div>
          )}
        </div>

        {/* Landing Page & Sign Out Buttons */}
        {!isCollapsed && (
          <div className="pt-2 flex items-center gap-1 text-[11px] text-[#9AA3A0]">
            {onGoToLanding && (
              <button
                type="button"
                id="btn-sidebar-landing-preview"
                onClick={onGoToLanding}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#0B0D0F] border border-[#252B30] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                title="View FitForge Landing Page"
              >
                <Compass className="w-3.5 h-3.5 text-[#5DA9FF]" />
                <span>Landing</span>
              </button>
            )}
            {onSignOut && (
              <button
                type="button"
                id="btn-sidebar-sign-out"
                onClick={onSignOut}
                className="py-1.5 px-2.5 rounded-lg bg-[#0B0D0F] border border-[#252B30] hover:text-[#F05D5E] hover:border-[#F05D5E]/40 flex items-center justify-center gap-1.5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
