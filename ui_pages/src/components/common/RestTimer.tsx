import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Bell } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  onComplete,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play audio chime using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 3 beep tones: 600Hz -> 800Hz -> 1000Hz
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playTone(587.33, now, 0.12);
      playTone(880.0, now + 0.15, 0.18);
      playTone(1174.66, now + 0.35, 0.35);
    } catch (e) {
      console.log('Audio chime not allowed or supported', e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAdjust = (delta: number) => {
    setTimeLeft((prev) => Math.max(0, prev + delta));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
  };

  const progressPercentage = ((initialSeconds - timeLeft) / (initialSeconds || 1)) * 100;

  return (
    <div
      id="rest-timer-widget"
      className={`bg-[#181D22] border border-[#252B30] rounded-2xl p-4 flex flex-col items-center justify-between text-[#F5F7F2] ${className}`}
    >
      <div className="w-full flex items-center justify-between text-xs text-[#9AA3A0] mb-2">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[#B8F34A]">
          <Bell className="w-3.5 h-3.5" />
          Rest Interval Timer
        </span>
        <span className="font-mono text-[11px]">{isRunning ? 'Active Rest' : 'Paused'}</span>
      </div>

      {/* Digits Display */}
      <div className="relative my-2 flex items-center justify-center">
        <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_12px_rgba(184,243,74,0.15)]">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full my-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            timeLeft === 0 ? 'bg-[#45D483]' : 'bg-[#B8F34A]'
          }`}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-2 w-full justify-center">
        <button
          id="btn-timer-minus30"
          type="button"
          onClick={() => handleAdjust(-30)}
          className="p-2 rounded-xl bg-[#12161A] border border-[#252B30] hover:border-[#B8F34A]/40 text-[#9AA3A0] hover:text-white text-xs font-bold"
          title="Subtract 30 seconds"
        >
          -30s
        </button>

        <button
          id="btn-timer-toggle"
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className={`px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all ${
            isRunning
              ? 'bg-[#F05D5E]/20 text-[#F05D5E] border border-[#F05D5E]/40 hover:bg-[#F05D5E]/30'
              : 'bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Start Rest
            </>
          )}
        </button>

        <button
          id="btn-timer-plus30"
          type="button"
          onClick={() => handleAdjust(30)}
          className="p-2 rounded-xl bg-[#12161A] border border-[#252B30] hover:border-[#B8F34A]/40 text-[#9AA3A0] hover:text-white text-xs font-bold"
          title="Add 30 seconds"
        >
          +30s
        </button>

        <button
          id="btn-timer-reset"
          type="button"
          onClick={handleReset}
          className="p-2 rounded-xl bg-[#12161A] border border-[#252B30] hover:text-white text-[#9AA3A0]"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
