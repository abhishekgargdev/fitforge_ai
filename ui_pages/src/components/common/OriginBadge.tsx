import React from 'react';
import { DataOrigin } from '../../types';
import { Sparkles, Gauge, Calculator } from 'lucide-react';

interface OriginBadgeProps {
  origin: DataOrigin;
  size?: 'sm' | 'md';
  className?: string;
}

export const OriginBadge: React.FC<OriginBadgeProps> = ({ origin, size = 'sm', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  if (origin === 'MEASURED') {
    return (
      <span
        id="badge-origin-measured"
        className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider bg-[#5DA9FF]/10 text-[#5DA9FF] border border-[#5DA9FF]/25 ${sizeClasses} ${className}`}
        title="Direct physical metric from scale, DEXA scan, or calipers"
      >
        <Gauge className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        Measured
      </span>
    );
  }

  if (origin === 'CALCULATED') {
    return (
      <span
        id="badge-origin-calculated"
        className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider bg-[#9AA3A0]/15 text-[#9AA3A0] border border-[#9AA3A0]/25 ${sizeClasses} ${className}`}
        title="Mathematically derived from weight, height, reps, or volume formulas"
      >
        <Calculator className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        Calculated
      </span>
    );
  }

  return (
    <span
      id="badge-origin-ai"
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider bg-[#B8F34A]/15 text-[#B8F34A] border border-[#B8F34A]/30 ${sizeClasses} ${className}`}
      title="Synthesized by FitForge AI intelligence model based on your bio-metrics"
    >
      <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5 animate-pulse' : 'w-3 h-3 animate-pulse'} />
      AI Recommendation
    </span>
  );
};
