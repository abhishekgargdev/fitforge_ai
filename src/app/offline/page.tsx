'use client';

import React from 'react';
import { WifiOff, RefreshCw, Dumbbell, Flame, Activity } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glowing background accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#B8F34A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <BrandLogo variant="full" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#F05D5E]/10 border border-[#F05D5E]/20 text-[#F05D5E] flex items-center justify-center mx-auto shadow-inner">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white">You're Offline</h1>
          <p className="text-xs text-[#9AA3A0] leading-relaxed">
            FitForge AI is unable to connect to the network right now. Check your internet connection and retry.
          </p>
        </div>

        <div className="p-4 bg-[#0B0D0F]/80 border border-[#252B30] rounded-2xl text-left space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8F34A] block">
            Offline Capabilities
          </span>
          <div className="space-y-2 text-xs text-[#9AA3A0]">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-3.5 h-3.5 text-[#5DA9FF] shrink-0" />
              <span>Exercise catalog & cached GIFs remain accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#45D483] shrink-0" />
              <span>Previous workout history saved locally</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
              <span>Logged nutrition targets remain cached</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(184,243,74,0.3)] transition-all hover:scale-[1.02]"
        >
          <RefreshCw className="w-4 h-4" />
          Reconnect & Refresh
        </button>
      </div>
    </main>
  );
}
