'use client';

// Fields used: BodyCompositionDetails.date, overall.{weightKg,bmi,bodyFatPercentage,visceralFat,bodyAge,restingMetabolismKcal},
// trunk/arms/legs.{fatPercentage,musclePercentage}; optional previousComposition for measured deltas.

import React, { useState } from 'react';
import { BodyCompositionDetails } from '@/types';
import { OriginBadge } from './OriginBadge';
import { Flame, Dumbbell } from 'lucide-react';
import { absoluteDelta } from '@/lib/calculations';

interface BodySilhouetteVisualizerProps {
  composition: BodyCompositionDetails;
  previousComposition?: BodyCompositionDetails | null;
  chronologicalAge?: number;
  className?: string;
}

function deltaLabel(current: number, previous: number | undefined, unit = '%') {
  if (previous == null) return '—';
  const delta = absoluteDelta(current, previous);
  if (delta === 0) return `0${unit}`;
  return `${delta > 0 ? '↑' : '↓'} ${Math.abs(delta)}${unit}`;
}

export const BodySilhouetteVisualizer: React.FC<BodySilhouetteVisualizerProps> = ({
  composition,
  previousComposition,
  chronologicalAge,
  className = '',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'trunk' | 'arms' | 'legs'>('trunk');
  const prev = previousComposition;

  const regionData = {
    trunk: {
      title: 'Trunk & Core Area',
      fat: composition.trunk.fatPercentage,
      muscle: composition.trunk.musclePercentage,
      fatPrev: prev?.trunk.fatPercentage,
      musclePrev: prev?.trunk.musclePercentage,
      notes: 'Contains primary visceral fat reserves and core musculature (pectorals, abdominals, erectors, lats).',
    },
    arms: {
      title: 'Upper Limbs & Shoulders',
      fat: composition.arms.fatPercentage,
      muscle: composition.arms.musclePercentage,
      fatPrev: prev?.arms.fatPercentage,
      musclePrev: prev?.arms.musclePercentage,
      notes: 'Biceps, triceps, deltoids, and forearms. Localized lean mass vs subcutaneous fat.',
    },
    legs: {
      title: 'Lower Body & Posterior Chain',
      fat: composition.legs.fatPercentage,
      muscle: composition.legs.musclePercentage,
      fatPrev: prev?.legs.fatPercentage,
      musclePrev: prev?.legs.musclePercentage,
      notes: 'Quadriceps, hamstrings, glutes, and calves. Primary glycogen storage engine.',
    },
  };

  const current = regionData[selectedRegion];
  const ageDelta =
    chronologicalAge && composition.overall.bodyAge
      ? chronologicalAge - composition.overall.bodyAge
      : 0;

  return (
    <div
      id="body-composition-visualizer"
      className={`bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6 text-[#F5F7F2] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">Segmental Body Composition</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#5DA9FF]/15 text-[#5DA9FF] border border-[#5DA9FF]/30">
              DEXA / Bio-Impedance Scan
            </span>
          </div>
          <p className="text-xs text-[#9AA3A0] mt-0.5">
            Click on body zones to inspect localized muscle & fat distribution
          </p>
        </div>

        <div className="inline-flex p-1 bg-[#181D22] border border-[#252B30] rounded-xl self-start sm:self-auto">
          {(['trunk', 'arms', 'legs'] as const).map((region) => (
            <button
              key={region}
              id={`tab-region-${region}`}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedRegion === region
                  ? 'bg-[#B8F34A] text-[#0B0D0F] shadow-sm font-bold'
                  : 'text-[#9AA3A0] hover:text-[#F5F7F2]'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#0B0D0F]/60 rounded-xl border border-[#252B30]/60 relative">
          <svg
            viewBox="0 0 200 320"
            className="w-48 h-72 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer select-none"
          >
            <circle
              cx="100"
              cy="28"
              r="18"
              className="fill-[#1A2127] stroke-[#364149] stroke-[1.5]"
            />
            <path
              d="M93 45 h14 v12 h-14 z"
              className="fill-[#1A2127] stroke-[#364149] stroke-[1.5]"
            />

            <g
              onClick={() => setSelectedRegion('arms')}
              className="transition-all duration-200"
            >
              <path
                d="M68 62 C60 70 48 95 44 125 C41 145 42 165 47 175 C51 175 55 168 57 150 C60 130 68 95 76 72 Z"
                className={`transition-all ${
                  selectedRegion === 'arms'
                    ? 'fill-[#B8F34A]/80 stroke-[#B8F34A] stroke-2 filter drop-shadow-[0_0_8px_rgba(184,243,74,0.4)]'
                    : 'fill-[#1E262E] hover:fill-[#2A3540] stroke-[#364149]'
                }`}
              />
              <path
                d="M132 62 C140 70 152 95 156 125 C159 145 158 165 153 175 C149 175 145 168 143 150 C140 130 132 95 124 72 Z"
                className={`transition-all ${
                  selectedRegion === 'arms'
                    ? 'fill-[#B8F34A]/80 stroke-[#B8F34A] stroke-2 filter drop-shadow-[0_0_8px_rgba(184,243,74,0.4)]'
                    : 'fill-[#1E262E] hover:fill-[#2A3540] stroke-[#364149]'
                }`}
              />
            </g>

            <g
              onClick={() => setSelectedRegion('trunk')}
              className="transition-all duration-200"
            >
              <path
                d="M74 57 C85 55 115 55 126 57 C130 75 128 115 124 145 C118 152 82 152 76 145 C72 115 70 75 74 57 Z"
                className={`transition-all ${
                  selectedRegion === 'trunk'
                    ? 'fill-[#B8F34A]/80 stroke-[#B8F34A] stroke-2 filter drop-shadow-[0_0_8px_rgba(184,243,74,0.4)]'
                    : 'fill-[#1E262E] hover:fill-[#2A3540] stroke-[#364149]'
                }`}
              />
              <line x1="100" y1="60" x2="100" y2="140" stroke="#364149" strokeDasharray="2,2" />
              <line x1="85" y1="85" x2="115" y2="85" stroke="#364149" strokeDasharray="2,2" />
              <line x1="88" y1="110" x2="112" y2="110" stroke="#364149" strokeDasharray="2,2" />
            </g>

            <g
              onClick={() => setSelectedRegion('legs')}
              className="transition-all duration-200"
            >
              <path
                d="M77 148 C85 152 96 154 98 158 C96 195 92 235 90 270 C88 285 82 305 76 308 C70 308 72 290 73 270 C75 235 70 190 68 165 Z"
                className={`transition-all ${
                  selectedRegion === 'legs'
                    ? 'fill-[#B8F34A]/80 stroke-[#B8F34A] stroke-2 filter drop-shadow-[0_0_8px_rgba(184,243,74,0.4)]'
                    : 'fill-[#1E262E] hover:fill-[#2A3540] stroke-[#364149]'
                }`}
              />
              <path
                d="M123 148 C115 152 104 154 102 158 C104 195 108 235 110 270 C112 285 118 305 124 308 C130 308 128 290 127 270 C125 235 130 190 132 165 Z"
                className={`transition-all ${
                  selectedRegion === 'legs'
                    ? 'fill-[#B8F34A]/80 stroke-[#B8F34A] stroke-2 filter drop-shadow-[0_0_8px_rgba(184,243,74,0.4)]'
                    : 'fill-[#1E262E] hover:fill-[#2A3540] stroke-[#364149]'
                }`}
              />
            </g>
          </svg>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#181D22] border border-[#252B30] rounded-full text-[11px] font-bold text-[#B8F34A] whitespace-nowrap">
            Selected: <span className="text-white capitalize">{selectedRegion}</span>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#181D22] border border-[#252B30] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8F34A]" />
                {current.title}
              </h4>
              <OriginBadge origin="MEASURED" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#12161A] p-3 rounded-lg border border-[#252B30]/80">
                <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#F5B942]" />
                    Fat %
                  </span>
                  <span className="text-[10px] text-[#45D483] font-semibold">
                    {deltaLabel(current.fat, current.fatPrev)}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white">{current.fat}%</div>
                <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#F5B942] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(current.fat * 2.5, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#12161A] p-3 rounded-lg border border-[#252B30]/80">
                <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-1">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-[#B8F34A]" />
                    Muscle %
                  </span>
                  <span className="text-[10px] text-[#45D483] font-semibold">
                    {deltaLabel(current.muscle, current.musclePrev)}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#B8F34A]">{current.muscle}%</div>
                <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#B8F34A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(current.muscle, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#9AA3A0] leading-relaxed bg-[#0B0D0F]/40 p-2.5 rounded-lg border border-[#252B30]/40">
              <strong className="text-white font-semibold">Region notes: </strong>
              {current.notes}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#181D22]/80 border border-[#252B30] p-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-[#9AA3A0] block">Visceral Fat</span>
              <span className="text-base font-extrabold text-white">{composition.overall.visceralFat}</span>
              <span className="text-[10px] text-[#9AA3A0] block font-medium">Measured level</span>
            </div>
            <div className="bg-[#181D22]/80 border border-[#252B30] p-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-[#9AA3A0] block">Body Age</span>
              <span className="text-base font-extrabold text-[#B8F34A]">{composition.overall.bodyAge} yrs</span>
              <span className="text-[10px] text-[#5DA9FF] block font-medium">
                {ageDelta === 0
                  ? 'vs chronological age'
                  : `${Math.abs(ageDelta)} yrs ${ageDelta > 0 ? 'younger' : 'older'}`}
              </span>
            </div>
            <div className="bg-[#181D22]/80 border border-[#252B30] p-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-[#9AA3A0] block">BMR (Resting)</span>
              <span className="text-base font-extrabold text-white">{composition.overall.restingMetabolismKcal}</span>
              <span className="text-[10px] text-[#9AA3A0] block font-medium">kcal/day</span>
              <div className="mt-1 flex justify-center">
                <OriginBadge origin="CALCULATED" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
