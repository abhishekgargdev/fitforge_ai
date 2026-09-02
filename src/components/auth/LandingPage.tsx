'use client';

// Fields used (marketing calculator only, not persisted): calcGoal, calcWeight, calcHeight, calcActivity.
// Navigation: /register, /login, /dashboard (middleware enforces auth).

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Sparkles,
  Flame,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Scale,
  CheckCircle2,
  ChevronRight,
  Users,
  Award,
  Clock,
  PieChart,
  HelpCircle,
  Play,
  HeartPulse,
  BrainCircuit,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onExploreDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onExploreDemo,
}) => {
  const router = useRouter();
  const goRegister = onGetStarted ?? (() => router.push('/register'));
  const goLogin = onLogin ?? (() => router.push('/login'));
  const goDemo = onExploreDemo ?? (() => router.push('/dashboard'));
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [calcGoal, setCalcGoal] = useState<'lose_fat' | 'build_muscle' | 'recomp'>('recomp');
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcHeight, setCalcHeight] = useState(180);
  const [calcActivity, setCalcActivity] = useState(1.4); // moderate
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live quick calculator estimation
  const bmr = 10 * calcWeight + 6.25 * calcHeight - 5 * 28 + 5; // Mifflin-St Jeor approx for male 28yo
  const tdee = Math.round(bmr * calcActivity);
  const targetCalories =
    calcGoal === 'lose_fat'
      ? Math.round(tdee - 500)
      : calcGoal === 'build_muscle'
      ? Math.round(tdee + 300)
      : tdee;
  const targetProtein = Math.round(calcWeight * 2.0); // 2g per kg
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.round((targetCalories - (targetProtein * 4 + targetFat * 9)) / 4);

  const faqs = [
    {
      q: 'How does FitForge AI generate personalized training plans?',
      a: 'FitForge leverages advanced Gemini sports science intelligence, incorporating your specific training age, recovery threshold, available equipment, and target muscle emphasis. It automatically calculates optimal weekly volume sets per muscle group and progressive overload weight increments.',
    },
    {
      q: 'What is the Segmental DEXA & Body Composition tracker?',
      a: 'Unlike generic weight tracking apps, FitForge maps visceral fat, skeletal muscle mass, and segmental fat percentages across your trunk, arms, and legs. This guarantees you know whether scale changes are water, fat loss, or lean muscle gain.',
    },
    {
      q: 'Can I log workouts and count rest times in real time?',
      a: 'Yes! The Live Active Tracker allows set-by-set weight and repetition logging, RPE difficulty rating, and features an integrated Web Audio countdown clock that chimes when your rest interval completes.',
    },
    {
      q: 'Does it support customized dietary preferences and macros?',
      a: 'FitForge provides evidence-based macronutrient targets tailored to your body weight and training volume. You can generate custom chef-level meal plans with whole foods, complete macro breakdowns, and grocery shopping lists.',
    },
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] font-sans selection:bg-[#B8F34A] selection:text-[#0B0D0F]">
      {/* Top Announcement Bar */}
      <div className="bg-[#12161A] border-b border-[#252B30] py-2 px-4 text-center text-xs text-[#9AA3A0]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-[#B8F34A]/10 text-[#B8F34A] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] border border-[#B8F34A]/20">
            NEW V2.5 RELEASE
          </span>
          <span>Next-Gen Segmental DEXA Analytics & Gemini Biomechanics Engine</span>
          <button
            onClick={goDemo}
            className="text-[#B8F34A] font-bold hover:underline ml-1 inline-flex items-center gap-0.5"
          >
            Launch Interactive Demo →
          </button>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0B0D0F]/90 backdrop-blur-md border-b border-[#252B30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#9AA3A0]">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#biometrics" className="hover:text-white transition-colors">
              Bio-Analytics
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              Macro Calculator
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <button
              id="btn-landing-login"
              onClick={goLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#F5F7F2] hover:text-white hover:bg-[#181D22] border border-transparent hover:border-[#252B30] transition-all"
            >
              Sign In
            </button>
            <button
              id="btn-landing-get-started"
              onClick={goRegister}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(184,243,74,0.25)] transition-all hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B8F34A]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#5DA9FF]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12161A] border border-[#B8F34A]/30 text-xs font-bold text-[#B8F34A] mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Based AI Strength & Biometric Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
              Precision Hypertrophy.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B8F34A] via-[#85F862] to-[#5DA9FF]">
                Zero Guesswork.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#9AA3A0] leading-relaxed max-w-2xl mx-auto mb-8">
              Transform your physique with segmental DEXA body composition tracking, automated progressive overload splits, and real-time AI biomechanics coaching.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="btn-hero-start-onboarding"
                onClick={goRegister}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-sm uppercase tracking-wider shadow-[0_4px_24px_rgba(184,243,74,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Start Free Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-hero-explore-demo"
                onClick={goDemo}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#12161A] border border-[#252B30] text-white hover:border-[#B8F34A]/50 hover:bg-[#181D22] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 text-[#B8F34A] fill-current" />
                <span>Explore Live Dashboard Demo</span>
              </button>
            </div>

            {/* Micro badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#9AA3A0] flex-wrap">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B8F34A]" />
                <span>CSCS Biomechanics Validated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#5DA9FF]" />
                <span>Instant Offline Capability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-[#12161A] border border-[#252B30] p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#252B30] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F05D5E]/80" />
                <span className="w-3 h-3 rounded-full bg-[#F5B942]/80" />
                <span className="w-3 h-3 rounded-full bg-[#45D483]/80" />
                <span className="ml-2 font-mono text-[11px] text-[#9AA3A0]">FitForge Engine v2.5 • Active Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#B8F34A]/10 text-[#B8F34A] text-[10px] font-bold border border-[#B8F34A]/20">
                  LIVE ATHLETE METRICS
                </span>
              </div>
            </div>

            {/* Visual Mock Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Live Biometric Recomp */}
              <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252B30] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-2 font-bold uppercase tracking-wider">
                    <span>Segmental Fat & Muscle</span>
                    <span className="text-[#B8F34A]">[MEASURED]</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">22.4%</span>
                    <span className="text-xs text-[#45D483] font-bold">↓ 1.2% this month</span>
                  </div>
                  <p className="text-xs text-[#9AA3A0] mt-1">Lean Mass: <strong className="text-white">61.2 kg</strong> (Stable)</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#252B30] flex items-center justify-between text-xs">
                  <span className="text-[#9AA3A0]">Trunk Visceral: 5</span>
                  <span className="text-[#B8F34A] font-bold">Recomp Mode Active</span>
                </div>
              </div>

              {/* Card 2: Live Workout Execution */}
              <div className="bg-[#181D22] p-4 rounded-2xl border border-[#B8F34A]/30 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-2 font-bold uppercase tracking-wider">
                    <span>Active Session</span>
                    <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-ping" />
                  </div>
                  <div className="text-base font-bold text-white">Barbell Bench Press</div>
                  <p className="text-xs text-[#B8F34A] font-mono mt-0.5">Set 3/4 • 90kg × 8 reps (RPE 8.5)</p>
                </div>
                <div className="mt-4 bg-[#0B0D0F] p-2.5 rounded-xl border border-[#252B30] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-[#5DA9FF]" />
                    <span className="text-[#9AA3A0]">Rest Interval:</span>
                  </div>
                  <span className="font-mono font-bold text-white text-xs">01:45</span>
                </div>
              </div>

              {/* Card 3: AI Calorie Balance */}
              <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252B30] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#9AA3A0] mb-2 font-bold uppercase tracking-wider">
                    <span>Caloric Target</span>
                    <span className="text-[#5DA9FF]">[CALCULATED]</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">1,540</span>
                    <span className="text-xs text-[#9AA3A0] font-mono">/ 2,200 kcal</span>
                  </div>
                  <p className="text-xs text-[#9AA3A0] mt-1">Protein: <strong className="text-white">112g / 160g</strong></p>
                </div>
                <div className="mt-4 w-full bg-[#0B0D0F] h-2 rounded-full overflow-hidden flex">
                  <div className="bg-[#5DA9FF] h-full" style={{ width: '40%' }} />
                  <div className="bg-[#F5B942] h-full" style={{ width: '25%' }} />
                  <div className="bg-[#F05D5E] h-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section id="features" className="py-20 bg-[#0B0D0F] border-t border-[#252B30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold text-[#B8F34A] tracking-widest">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              Engineered For Maximum Muscular Adaptation
            </h2>
            <p className="text-sm text-[#9AA3A0] mt-3">
              Every tool and metric in FitForge is built upon peer-reviewed exercise science and sports nutrition guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] hover:border-[#B8F34A]/40 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#B8F34A]/10 border border-[#B8F34A]/20 flex items-center justify-center text-[#B8F34A] mb-5">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Segmental DEXA & Composition</h3>
              <p className="text-xs text-[#9AA3A0] leading-relaxed">
                Break down total weight into bone-free lean mass, visceral fat ratings, and segmental trunk vs limb percentages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] hover:border-[#B8F34A]/40 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#5DA9FF]/10 border border-[#5DA9FF]/20 flex items-center justify-center text-[#5DA9FF] mb-5">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Session Tracker & Rest Clock</h3>
              <p className="text-xs text-[#9AA3A0] leading-relaxed">
                Log real-time sets, target RPE, and exercise notes with an integrated sound timer designed for high-density hypertrophy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] hover:border-[#B8F34A]/40 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center text-[#F5B942] mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Workout & Split Architect</h3>
              <p className="text-xs text-[#9AA3A0] leading-relaxed">
                Gemini 2.5 calculates your weekly set volume, fatigue accumulation, and outputs periodized 3, 4, 5, or 6-day splits.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] hover:border-[#B8F34A]/40 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#45D483]/10 border border-[#45D483]/20 flex items-center justify-center text-[#45D483] mb-5">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Macro & Caloric Balance Engine</h3>
              <p className="text-xs text-[#9AA3A0] leading-relaxed">
                Accurately manage protein, carbs, fats, and fiber targets with instant meal logging and automated diet generator recipes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] hover:border-[#B8F34A]/40 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F05D5E]/10 border border-[#F05D5E]/20 flex items-center justify-center text-[#F05D5E] mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Circumferential Bio-Tracking</h3>
              <p className="text-xs text-[#9AA3A0] leading-relaxed">
                Monitor month-over-month caliper and tape measurements across chest, arms, waist, and thighs to verify symmetry.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#12161A] p-6 rounded-3xl border border-[#252B30] hover:border-[#B8F34A]/40 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#B8F34A]/10 border border-[#B8F34A]/20 flex items-center justify-center text-[#B8F34A] mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 AI Biomechanics Coach</h3>
              <p className="text-xs text-[#9AA3A0] leading-relaxed">
                Ask deep physiological questions, debug sticking points on compounds, and receive actionable training adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Target Macro Calculator */}
      <section id="calculator" className="py-20 bg-[#12161A] border-t border-[#252B30]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B0D0F] border border-[#252B30] rounded-3xl p-6 sm:p-10 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#252B30]">
              <div>
                <span className="text-xs uppercase font-bold text-[#B8F34A] tracking-wider">
                  INSTANT BIO-METRIC CALCULATOR
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Preview Your Daily Caloric & Macro Blueprint
                </h2>
              </div>
              <span className="text-xs text-[#9AA3A0] bg-[#181D22] px-3 py-1.5 rounded-xl border border-[#252B30] self-start">
                Mifflin-St Jeor Formula
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs */}
              <div className="lg:col-span-6 space-y-5">
                {/* Goal Selection */}
                <div>
                  <label className="text-xs font-bold text-[#9AA3A0] uppercase tracking-wider block mb-2">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'lose_fat', label: 'Fat Loss' },
                      { id: 'recomp', label: 'Recomp' },
                      { id: 'build_muscle', label: 'Hypertrophy' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setCalcGoal(g.id as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          calcGoal === g.id
                            ? 'bg-[#B8F34A] text-[#0B0D0F]'
                            : 'bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders: Weight & Height */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#9AA3A0]">Weight</span>
                      <span className="text-white font-mono">{calcWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min={45}
                      max={140}
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full accent-[#B8F34A]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#9AA3A0]">Height</span>
                      <span className="text-white font-mono">{calcHeight} cm</span>
                    </div>
                    <input
                      type="range"
                      min={140}
                      max={215}
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(Number(e.target.value))}
                      className="w-full accent-[#B8F34A]"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="text-xs font-bold text-[#9AA3A0] uppercase tracking-wider block mb-2">
                    Weekly Training Frequency
                  </label>
                  <select
                    value={calcActivity}
                    onChange={(e) => setCalcActivity(Number(e.target.value))}
                    className="w-full bg-[#181D22] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                  >
                    <option value={1.2}>Sedentary (1-2 days/week)</option>
                    <option value={1.4}>Moderate (3-4 days heavy lifting)</option>
                    <option value={1.6}>High Volume (5-6 days intense training)</option>
                    <option value={1.8}>Elite Athlete (2x daily sessions)</option>
                  </select>
                </div>
              </div>

              {/* Output Card */}
              <div className="lg:col-span-6 bg-[#181D22] p-6 rounded-2xl border border-[#252B30] flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-[#9AA3A0] mb-1">
                    Calculated Daily Maintenance & Target
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{targetCalories.toLocaleString()}</span>
                    <span className="text-sm font-semibold text-[#B8F34A]">kcal / day</span>
                  </div>
                  <p className="text-xs text-[#9AA3A0] mt-1">
                    Baseline TDEE: {tdee} kcal • {calcGoal === 'lose_fat' ? '500 kcal Deficit' : calcGoal === 'build_muscle' ? '300 kcal Lean Surplus' : 'Isocaloric Recomposition'}
                  </p>

                  {/* Macros breakdown */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-[#0B0D0F] p-3 rounded-xl border border-[#5DA9FF]/30">
                      <div className="text-[10px] uppercase font-bold text-[#5DA9FF]">Protein</div>
                      <div className="text-lg font-black text-white">{targetProtein}g</div>
                      <div className="text-[10px] text-[#9AA3A0]">{(targetProtein * 4)} kcal</div>
                    </div>
                    <div className="bg-[#0B0D0F] p-3 rounded-xl border border-[#F5B942]/30">
                      <div className="text-[10px] uppercase font-bold text-[#F5B942]">Carbs</div>
                      <div className="text-lg font-black text-white">{targetCarbs}g</div>
                      <div className="text-[10px] text-[#9AA3A0]">{(targetCarbs * 4)} kcal</div>
                    </div>
                    <div className="bg-[#0B0D0F] p-3 rounded-xl border border-[#F05D5E]/30">
                      <div className="text-[10px] uppercase font-bold text-[#F05D5E]">Fats</div>
                      <div className="text-lg font-black text-white">{targetFat}g</div>
                      <div className="text-[10px] text-[#9AA3A0]">{(targetFat * 9)} kcal</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={goRegister}
                  className="mt-6 w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <span>Build Full Workout & Diet Plan With This Target</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#0B0D0F] border-t border-[#252B30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-[#B8F34A] tracking-widest">
              MEMBERSHIP TIERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              Invest In Your Physical Trajectory
            </h2>
            <p className="text-sm text-[#9AA3A0] mt-2">
              Start free today or unlock unlimited Gemini AI coach consultations and DEXA segmental tracking.
            </p>

            {/* Billing toggle */}
            <div className="mt-6 inline-flex items-center p-1 bg-[#12161A] border border-[#252B30] rounded-2xl">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#252B30] text-white'
                    : 'text-[#9AA3A0] hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'annual'
                    ? 'bg-[#B8F34A] text-[#0B0D0F]'
                    : 'text-[#9AA3A0] hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/20 font-black">Save 35%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#12161A] p-6 sm:p-8 rounded-3xl border border-[#252B30] flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-white">Starter Athlete</h3>
                <p className="text-xs text-[#9AA3A0] mt-1">Essential workout logging and progress tracking</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-xs text-[#9AA3A0]">/ forever</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-[#F5F7F2]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Standard workout logging
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Rest interval timer with chime
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Basic scale weight trajectory
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Food & macro logger
                  </li>
                </ul>
              </div>

              <button
                onClick={goRegister}
                className="mt-8 w-full py-3 rounded-xl bg-[#181D22] border border-[#252B30] text-white hover:border-[#B8F34A] font-bold text-xs transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="bg-[#181D22] p-6 sm:p-8 rounded-3xl border-2 border-[#B8F34A] flex flex-col justify-between relative shadow-2xl scale-105">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#B8F34A] text-[#0B0D0F] text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                MOST POPULAR FOR ATHLETES
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">FitForge Pro</h3>
                <p className="text-xs text-[#9AA3A0] mt-1">Full AI intelligence, DEXA modeling & periodization</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingPeriod === 'annual' ? '$12' : '$19'}
                  </span>
                  <span className="text-xs text-[#9AA3A0]">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-[#F5F7F2]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Everything in Starter
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Unlimited Gemini AI Workout Generation
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Segmental DEXA Body Composition
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> 24/7 AI Biomechanics Coach Chat
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> AI Meal Plan & Recipe Generator
                  </li>
                </ul>
              </div>

              <button
                onClick={goRegister}
                className="mt-8 w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs uppercase tracking-wider shadow-[0_2px_14px_rgba(184,243,74,0.3)] transition-all hover:scale-105"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Elite Tier */}
            <div className="bg-[#12161A] p-6 sm:p-8 rounded-3xl border border-[#252B30] flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-white">Elite Performance</h3>
                <p className="text-xs text-[#9AA3A0] mt-1">For competitive powerlifters & physique athletes</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingPeriod === 'annual' ? '$29' : '$39'}
                  </span>
                  <span className="text-xs text-[#9AA3A0]">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-[#F5F7F2]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Everything in Pro
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> RPE & Fatigue Auto-Regulation
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Advanced Muscle Symmetry Visualizer
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B8F34A]" /> Priority Gemini 2.5 Inference Speeds
                  </li>
                </ul>
              </div>

              <button
                onClick={goRegister}
                className="mt-8 w-full py-3 rounded-xl bg-[#181D22] border border-[#252B30] text-white hover:border-[#B8F34A] font-bold text-xs transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#12161A] border-t border-[#252B30]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold text-[#B8F34A] tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Everything You Need To Know
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0B0D0F] border border-[#252B30] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-[#B8F34A]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-[#9AA3A0] ${
                      openFaq === idx ? 'rotate-180 text-[#B8F34A]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#9AA3A0] leading-relaxed border-t border-[#252B30]/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-20 bg-gradient-to-b from-[#0B0D0F] to-[#12161A] border-t border-[#252B30] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready To Forge Your Best Physique?
          </h2>
          <p className="text-sm sm:text-base text-[#9AA3A0] mt-4 max-w-xl mx-auto leading-relaxed">
            Join thousands of dedicated lifters using clinical biometrics and Gemini sports science to achieve consistent progressive overload.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={goRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-sm uppercase tracking-wider shadow-[0_4px_24px_rgba(184,243,74,0.3)] transition-all hover:scale-105"
            >
              Start Free Onboarding →
            </button>
            <button
              onClick={goLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#181D22] border border-[#252B30] text-white hover:text-[#B8F34A] font-bold text-sm transition-colors"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0D0F] border-t border-[#252B30] py-12 text-xs text-[#9AA3A0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-[#9AA3A0]">© 2026 FitForge AI Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={goDemo} className="hover:text-[#B8F34A] transition-colors">
              Live Demo
            </button>
            <button onClick={goRegister} className="hover:text-[#B8F34A] transition-colors">
              Onboarding
            </button>
            <button onClick={goLogin} className="hover:text-[#B8F34A] transition-colors">
              Sign In
            </button>
            <a href="#features" className="hover:text-white transition-colors">
              Science
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
