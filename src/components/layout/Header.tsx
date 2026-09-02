'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, NotificationItem, ActiveNavTab } from '@/types';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Bell,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onClearNotification: (id: string) => void;
  onNavigate: (tab: ActiveNavTab) => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onOpenQuickAction: (action: 'ai_coach' | 'workout' | 'nutrition') => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotification,
  onNavigate,
  onToggleTheme,
  isDark,
  onOpenQuickAction,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-app-header"
      className="bg-[#0B0D0F]/80 backdrop-blur-md border-b border-[#252B30] px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-colors"
    >
      {/* Left side: Greeting + Date */}
      <div>
        <h1 className="text-lg md:text-xl font-extrabold text-[#F5F7F2] tracking-tight flex items-center gap-2">
          Good morning, {userProfile.name.split(' ')[0]} <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-xs text-[#9AA3A0] mt-0.5 flex items-center gap-2">
          <span>{todayFormatted}</span>
          <span className="w-1 h-1 rounded-full bg-[#252B30]" />
          <span className="text-[#B8F34A] font-semibold">Phase 2: Hypertrophy & Recomp</span>
        </p>
      </div>

      {/* Right side: Quick Action CTA + Theme Toggle + Notifications + Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick AI Trigger */}
        <button
          id="btn-header-ask-coach"
          type="button"
          onClick={() => onOpenQuickAction('ai_coach')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B8F34A]/20 to-[#5DA9FF]/20 border border-[#B8F34A]/40 text-white hover:border-[#B8F34A] text-xs font-bold transition-all shadow-sm group"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B8F34A] group-hover:rotate-12 transition-transform" />
          <span>Ask FitForge AI</span>
        </button>

        {/* Theme switch */}
        <button
          id="btn-header-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-[#12161A] border border-[#252B30] text-[#9AA3A0] hover:text-white transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-[#F5B942]" /> : <Moon className="w-4 h-4 text-[#5DA9FF]" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="btn-header-notifications"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#12161A] border border-[#252B30] text-[#9AA3A0] hover:text-white relative transition-colors"
            title="View Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B8F34A] text-[#0B0D0F] font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onMarkAllRead={onMarkAllNotificationsRead}
              onClear={onClearNotification}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* User Avatar */}
        <div
          id="btn-header-user-avatar"
          onClick={() => onNavigate('profile')}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B8F34A] to-[#45D483] text-[#0B0D0F] font-extrabold flex items-center justify-center text-xs shadow-md cursor-pointer hover:scale-105 transition-transform"
          title="My Profile"
        >
          {userProfile.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};
