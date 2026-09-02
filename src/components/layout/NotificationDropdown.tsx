'use client';

import React from 'react';
import { NotificationItem } from '@/types';
import { Bell, Check, Dumbbell, TrendingUp, Sparkles, Apple, X } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClear: (id: string) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAllRead,
  onClear,
  onClose,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-[#5DA9FF]" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-[#45D483]" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-[#B8F34A]" />;
      case 'nutrition':
        return <Apple className="w-4 h-4 text-[#F5B942]" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      id="notification-dropdown-panel"
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#12161A] border border-[#252B30] rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 text-[#F5F7F2]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#252B30]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#B8F34A]" />
          <h4 className="text-sm font-bold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#B8F34A] text-[#0B0D0F]">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-[#B8F34A] hover:underline font-semibold flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9AA3A0] hover:text-white hover:bg-[#181D22]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9AA3A0]">
            No notifications right now.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-xl border transition-all relative flex gap-3 ${
                !n.read
                  ? 'bg-[#181D22] border-[#B8F34A]/30 shadow-sm'
                  : 'bg-[#0B0D0F]/40 border-[#252B30]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#12161A] border border-[#252B30] flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{n.title}</span>
                  <span className="text-[10px] text-[#9AA3A0]">{n.timestamp}</span>
                </div>
                <p className="text-xs text-[#9AA3A0] mt-0.5 leading-relaxed">{n.message}</p>
              </div>
              <button
                onClick={() => onClear(n.id)}
                className="absolute top-2 right-2 text-[#9AA3A0] hover:text-white"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
