'use client';

// Fields used: Exercise.id, name, bodyPart, targetMuscle, secondaryMuscles, equipment, difficulty,
// instructions[], gifUrl/imageUrl, musclesWorkedVisual, commonMistakes[], tips[], related exercises.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise } from '@/types';
import { AlertTriangle, ChevronLeft, Sparkles } from 'lucide-react';

interface ExerciseDetailViewProps {
  exerciseId: string;
}

export const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ exerciseId }) => {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [related, setRelated] = useState<Exercise[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`/api/exercises/${exerciseId}`).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Exercise not found.');
        return json.data.exercise as Exercise;
      }),
      fetch(`/api/exercises/${exerciseId}/related`).then(async (res) => {
        const json = await res.json();
        if (!res.ok) return [] as Exercise[];
        return (json.data.items || []) as Exercise[];
      }),
    ])
      .then(([current, relatedItems]) => {
        if (cancelled) return;
        setExercise(current);
        setRelated(relatedItems);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load exercise.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  if (loading) return <p className="text-sm text-[#9AA3A0]">Loading form guide…</p>;
  if (error || !exercise) return <p className="text-sm text-[#F05D5E]">{error || 'Exercise not found.'}</p>;

  return (
    <div id="exercise-detail-view" className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/exercises')}
        className="text-xs font-bold text-[#9AA3A0] hover:text-white flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" /> Back to library
      </button>

      <div className="bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-[#B8F34A] px-2 py-0.5 rounded-md bg-[#B8F34A]/10">
            {exercise.targetMuscle}
          </span>
          <span className="text-xs text-[#9AA3A0] capitalize">• {exercise.equipment}</span>
          <span className="text-xs text-[#9AA3A0] capitalize">• {exercise.difficulty}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-2">{exercise.name}</h2>
        {exercise.bodyPart && (
          <p className="text-xs text-[#9AA3A0] mt-1 capitalize">Body part: {exercise.bodyPart}</p>
        )}

        <div className="mt-5 space-y-5">
          <div className="w-full h-64 rounded-2xl overflow-hidden bg-black/60 border border-[#252B30]">
            <img
              src={exercise.gifUrl || exercise.imageUrl}
              alt={exercise.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181D22] to-[#1A221E] border border-[#B8F34A]/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#B8F34A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-[#B8F34A] block mb-1">
                FitForge AI Movement Analysis Cue
              </strong>
              <p className="text-xs sm:text-sm text-[#F5F7F2] leading-relaxed">
                {exercise.tips?.[0] ||
                  'Maintain neutral spine alignment and control eccentric deceleration.'}
              </p>
            </div>
          </div>

          <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252B30]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-2">
              Muscle Engagement Matrix
            </h4>
            <div className="flex flex-wrap gap-2">
              <div className="text-xs font-bold text-white bg-[#0B0D0F] px-3 py-1.5 rounded-xl border border-[#B8F34A]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B8F34A]" />
                Primary:{' '}
                {exercise.musclesWorkedVisual?.primary?.join(', ') || exercise.targetMuscle}
              </div>
              {exercise.secondaryMuscles.length > 0 && (
                <div className="text-xs font-bold text-[#9AA3A0] bg-[#0B0D0F] px-3 py-1.5 rounded-xl border border-[#252B30] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5DA9FF]" />
                  Secondary: {exercise.secondaryMuscles.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-3">
              Step-by-Step Execution
            </h4>
            <div className="space-y-2">
              {exercise.instructions.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#181D22] border border-[#252B30] flex items-start gap-3 text-xs"
                >
                  <span className="w-5 h-5 rounded-md bg-[#0B0D0F] text-[#B8F34A] font-black flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-[#F5F7F2] leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {exercise.commonMistakes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3A0] mb-3">
                Common Mistakes to Avoid
              </h4>
              <div className="space-y-2">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/25 flex items-start gap-2.5 text-xs text-[#F5F7F2]"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#F05D5E] shrink-0 mt-0.5" />
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Related movements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/exercises/${item.id}`)}
                className="text-left p-3 rounded-2xl bg-[#12161A] border border-[#252B30] hover:border-[#B8F34A]/50"
              >
                <div className="text-[10px] uppercase font-bold text-[#9AA3A0]">{item.targetMuscle}</div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-[11px] text-[#9AA3A0] capitalize">{item.equipment}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
