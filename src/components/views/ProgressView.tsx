'use client';

// Fields used: MetricEntry.date, weightKg, bodyFatPercentage, muscleMassKg, bmi, visceralFat, bodyAge, restingMetabolismKcal;
// MonthlyMeasurement.id, month, date, chestCm, waistCm, hipsCm, bicepsCm, thighsCm, calvesCm, shouldersCm, neckCm;
// BodyCompositionDetails.date, overall.{weightKg,bmi,bodyFatPercentage,visceralFat,bodyAge,restingMetabolismKcal},
// trunk/arms/legs.{fatPercentage,musclePercentage}; userProfile (passed to analysis).

import React, { useState } from 'react';
import { MetricEntry, MonthlyMeasurement, BodyCompositionDetails, UserProfile } from '@/types';
import { OriginBadge } from '../common/OriginBadge';
import { BodySilhouetteVisualizer } from '../common/BodySilhouetteVisualizer';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  Calendar,
  Ruler,
  Scale,
  Percent,
  Calculator,
  HeartPulse,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface ProgressViewProps {
  userProfile: UserProfile;
  metrics: MetricEntry[];
  measurements: MonthlyMeasurement[];
  composition: BodyCompositionDetails;
  onOpenAIAnalysis: () => void;
  onAddMeasurement: (m: MonthlyMeasurement) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userProfile,
  metrics,
  measurements,
  composition,
  onOpenAIAnalysis,
  onAddMeasurement,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'fat' | 'muscle' | 'bmi' | 'bodyAge' | 'visceralFat'>('weight');
  const [showAddModal, setShowAddModal] = useState(false);

  // New measurement form state
  const [newMonth, setNewMonth] = useState('October 2026');
  const [newChest, setNewChest] = useState('105');
  const [newWaist, setNewWaist] = useState('81.5');
  const [newHips, setNewHips] = useState('98');
  const [newBiceps, setNewBiceps] = useState('38.2');
  const [newThighs, setNewThighs] = useState('59.5');
  const [newCalves, setNewCalves] = useState('38');
  const [newShoulders, setNewShoulders] = useState('122');
  const [newNeck, setNewNeck] = useState('39.5');

  const latestMeasure = measurements[0] || measurements[measurements.length - 1];
  const previousMeasure = measurements[1] || measurements[0];

  const handleSaveNewMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MonthlyMeasurement = {
      id: `measure-${Date.now()}`,
      month: newMonth,
      date: new Date().toISOString().split('T')[0],
      chestCm: Number(newChest),
      waistCm: Number(newWaist),
      hipsCm: Number(newHips),
      bicepsCm: Number(newBiceps),
      thighsCm: Number(newThighs),
      calvesCm: Number(newCalves),
      shouldersCm: Number(newShoulders),
      neckCm: Number(newNeck),
    };
    onAddMeasurement(entry);
    setShowAddModal(false);
  };

  const getMetricData = () => {
    return metrics.map((m) => {
      let val = m.weightKg;
      let unit = 'kg';
      if (selectedMetric === 'fat') {
        val = m.bodyFatPercentage;
        unit = '%';
      } else if (selectedMetric === 'muscle') {
        val = m.muscleMassKg;
        unit = 'kg';
      } else if (selectedMetric === 'bmi') {
        val = m.bmi;
        unit = '';
      } else if (selectedMetric === 'bodyAge') {
        val = m.bodyAge ?? 0;
        unit = 'yrs';
      } else if (selectedMetric === 'visceralFat') {
        val = m.visceralFat ?? 0;
        unit = 'lvl';
      }
      return { date: m.date, val, unit };
    });
  };

  const metricPoints = getMetricData();
  const values = metricPoints.map((p) => p.val);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const svgWidth = 640;
  const svgHeight = 200;
  const padding = 25;

  const pointsString =
    metricPoints.length > 0
      ? metricPoints
          .map((p, idx) => {
            const divisor = Math.max(metricPoints.length - 1, 1);
            const x = padding + (idx / divisor) * (svgWidth - padding * 2);
            const y = svgHeight - padding - ((p.val - minVal) / range) * (svgHeight - padding * 2);
            return `${x},${y}`;
          })
          .join(' ')
      : `${padding},${svgHeight - padding}`;

  const areaPath = `M ${padding},${svgHeight - padding} L ${pointsString.replace(/,/g, ' ')} L ${svgWidth - padding},${svgHeight - padding} Z`;

  return (
    <div id="progress-view" className="space-y-6 animate-in fade-in">
      {/* Header Banner & Deep AI Trigger */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Progress & Body Analytics
            </h2>
            <OriginBadge origin="MEASURED" />
          </div>
          <p className="text-xs text-[#9AA3A0] mt-1">
            Segmental scans, circumferential measurements, and clinical recomposition metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-open-deep-ai-analysis"
            type="button"
            onClick={onOpenAIAnalysis}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8F34A]/20 to-[#5DA9FF]/20 border border-[#B8F34A]/40 text-[#F5F7F2] hover:border-[#B8F34A] text-xs font-bold flex items-center gap-2 transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-[#B8F34A] group-hover:rotate-12 transition-transform" />
            Generate AI Bio-Report
          </button>
          <button
            id="btn-add-monthly-measurement"
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] text-xs font-black flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Measurement
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B8F34A]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Biometric Trajectory Chart
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'weight', label: 'Weight', icon: Scale },
              { id: 'fat', label: 'Body Fat %', icon: Percent },
              { id: 'muscle', label: 'Muscle Mass', icon: Activity },
              { id: 'bmi', label: 'BMI', icon: Calculator },
              { id: 'bodyAge', label: 'Body Age', icon: HeartPulse },
              { id: 'visceralFat', label: 'Visceral Fat', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-select-metric-${tab.id}`}
                  type="button"
                  onClick={() => setSelectedMetric(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#B8F34A] text-[#0B0D0F] font-bold shadow-sm'
                      : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Line Chart */}
        <div className="relative w-full h-56 sm:h-64 bg-[#0B0D0F]/70 border border-[#252B30]/60 rounded-xl p-3 flex items-center justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8F34A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#B8F34A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0.25, 0.5, 0.75].map((ratio, i) => (
              <line
                key={i}
                x1={padding}
                y1={svgHeight * ratio}
                x2={svgWidth - padding}
                y2={svgHeight * ratio}
                stroke="#252B30"
                strokeDasharray="4,4"
              />
            ))}

            {/* Area */}
            <path d={areaPath} fill="url(#progressGradient)" />

            {/* Line */}
            <polyline
              fill="none"
              stroke="#B8F34A"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />

            {/* Points */}
            {metricPoints.map((p, idx) => {
              const x = padding + (idx / (metricPoints.length - 1)) * (svgWidth - padding * 2);
              const y = svgHeight - padding - ((p.val - minVal) / range) * (svgHeight - padding * 2);
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className="fill-[#0B0D0F] stroke-[#B8F34A] stroke-2 group-hover:r-7 transition-all"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {p.val} {p.unit}
                  </text>
                  <text
                    x={x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="fill-[#9AA3A0] text-[10px] font-mono"
                  >
                    {p.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Segmental DEXA Body Silhouette Scan */}
      <BodySilhouetteVisualizer composition={composition} />

      {/* Monthly Circumferential Measurements Table */}
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5DA9FF]/15 text-[#5DA9FF] flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Monthly Circumference Audit (cm)</h3>
              <p className="text-xs text-[#9AA3A0]">Tracking hypertrophy vs localized waist reductions</p>
            </div>
          </div>

          <div className="text-xs text-[#45D483] font-bold bg-[#45D483]/10 px-3 py-1.5 rounded-xl border border-[#45D483]/20 self-start sm:self-auto">
            Waist: -3.5 cm (3 months)
          </div>
        </div>

        {/* Measurements Comparison Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#252B30] text-[#9AA3A0] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Body Zone</th>
                {measurements.map((m) => (
                  <th key={m.id} className="py-3 px-3 font-bold text-white">
                    {m.month}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">30-Day Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B30]/60">
              {[
                { label: 'Chest', key: 'chestCm', goal: 'gain' },
                { label: 'Waist (Umbilicus)', key: 'waistCm', goal: 'drop' },
                { label: 'Hips / Glutes', key: 'hipsCm', goal: 'maintain' },
                { label: 'Biceps (Flexed)', key: 'bicepsCm', goal: 'gain' },
                { label: 'Thighs (Mid-quad)', key: 'thighsCm', goal: 'gain' },
                { label: 'Calves', key: 'calvesCm', goal: 'gain' },
                { label: 'Shoulders (Circumference)', key: 'shouldersCm', goal: 'gain' },
                { label: 'Neck', key: 'neckCm', goal: 'maintain' },
              ].map((row) => {
                const currentVal = (latestMeasure as any)[row.key];
                const prevVal = (previousMeasure as any)[row.key];
                const delta = Math.round((currentVal - prevVal) * 10) / 10;
                const isFavorable =
                  (row.goal === 'drop' && delta < 0) ||
                  (row.goal === 'gain' && delta > 0) ||
                  (row.goal === 'maintain' && Math.abs(delta) < 0.5);

                return (
                  <tr key={row.key} className="hover:bg-[#181D22]/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{row.label}</td>
                    {measurements.map((m) => (
                      <td key={m.id} className="py-3 px-3 font-mono text-[#F5F7F2]">
                        {(m as any)[row.key]} cm
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isFavorable ? 'text-[#45D483]' : 'text-[#F5B942]'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta} cm
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Measurement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 text-[#F5F7F2] shadow-2xl relative my-8">
            <h3 className="text-lg font-bold text-white mb-1">Add Monthly Tape Measurement</h3>
            <p className="text-xs text-[#9AA3A0] mb-4">
              Enter updated tape measurements in centimeters (cm)
            </p>

            <form onSubmit={handleSaveNewMeasurement} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Month / Label</label>
                <input
                  type="text"
                  required
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHips}
                    onChange={(e) => setNewHips(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Biceps (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBiceps}
                    onChange={(e) => setNewBiceps(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newThighs}
                    onChange={(e) => setNewThighs(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9AA3A0] mb-1">Shoulders (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newShoulders}
                    onChange={(e) => setNewShoulders(e.target.value)}
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#B8F34A]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#181D22] text-xs font-bold text-[#9AA3A0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-black text-xs hover:bg-[#C8FF68]"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
