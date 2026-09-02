import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'small';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'small') {
    return (
      <div className={`w-8 h-8 rounded-lg bg-[#B8F34A] flex items-center justify-center text-[#0B0D0F] font-black text-base shadow-[0_0_12px_rgba(184,243,74,0.35)] ${className}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" stroke="currentColor" strokeWidth="0.5">
          <path d="M4 3h16v4H8v4h10v4H8v6H4V3z" />
          <path d="M19 18l1.5 3-3-1.5 1.5-1.5z" fill="#0B0D0F" />
        </svg>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8F34A] to-[#8EE020] flex items-center justify-center text-[#0B0D0F] shadow-[0_0_16px_rgba(184,243,74,0.3)] transition-transform hover:scale-105 ${className}`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          {/* Stylized athletic F with AI spark notch */}
          <path d="M5 3.5h14.5c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5H9.5v2.5h8c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5h-8V20c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1V4.5c0-.6.4-1 1-1z" />
          <circle cx="18.5" cy="5" r="1.5" className="fill-[#0B0D0F] animate-pulse" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8F34A] to-[#9AEB28] flex items-center justify-center text-[#0B0D0F] shadow-[0_0_18px_rgba(184,243,74,0.35)] shrink-0">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M5 3.5h14.5c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5H9.5v2.5h8c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5h-8V20c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1V4.5c0-.6.4-1 1-1z" />
          <circle cx="18.5" cy="5" r="1.5" className="fill-[#0B0D0F]" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#5DA9FF] ring-2 ring-[#0B0D0F]" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-[#F5F7F2]">FitForge</span>
          <span className="px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-[#B8F34A]/15 text-[#B8F34A] border border-[#B8F34A]/30">
            AI
          </span>
        </div>
        <span className="text-[10px] uppercase font-semibold tracking-widest text-[#9AA3A0]">
          Precision Fitness Engine
        </span>
      </div>
    </div>
  );
};
