"use client";

import { useCallback, useEffect, useState } from "react";
import { ProgressView } from "@/components/views/ProgressView";
import { AIAnalysisModal } from "@/components/modals/AIAnalysisModal";
import type {
  BodyCompositionDetails,
  MonthlyMeasurement,
  UserProfile,
} from "@/types";

const emptyComposition: BodyCompositionDetails = {
  date: "",
  overall: {
    weightKg: 0,
    bmi: 0,
    bodyFatPercentage: 0,
    visceralFat: 0,
    bodyAge: 0,
    restingMetabolismKcal: 0,
  },
  trunk: { fatPercentage: 0, musclePercentage: 0 },
  arms: { fatPercentage: 0, musclePercentage: 0 },
  legs: { fatPercentage: 0, musclePercentage: 0 },
};

export default function ProgressPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<MonthlyMeasurement[]>([]);
  const [composition, setComposition] = useState<BodyCompositionDetails>(emptyComposition);
  const [previousComposition, setPreviousComposition] = useState<BodyCompositionDetails | null>(
    null
  );
  const [waistDeltaCm, setWaistDeltaCm] = useState<number | undefined>();
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/measurements?limit=24")
      .then((res) => res.json())
      .then((json) => setMeasurements(json.data?.monthly || []))
      .catch(() => setMeasurements([]));

    fetch("/api/measurements/latest")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.composition) setComposition(json.data.composition);
        setPreviousComposition(json.data?.previousComposition || null);
      })
      .catch(() => {
        setComposition(emptyComposition);
        setPreviousComposition(null);
      });

    fetch("/api/progress/summary?range=3m")
      .then((res) => res.json())
      .then((json) => {
        if (typeof json.data?.waist?.absDelta === "number") {
          setWaistDeltaCm(json.data.waist.absDelta);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.profile) setProfile(json.data.profile);
      })
      .catch(() => undefined);
  }, [load]);

  if (!profile) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#12161A] border border-[#252B30] h-28 animate-pulse" />
          ))}
        </div>
        <div className="p-6 rounded-2xl bg-[#12161A] border border-[#252B30] h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <ProgressView
        userProfile={profile}
        measurements={measurements}
        composition={composition}
        previousComposition={previousComposition}
        waistDeltaCm={waistDeltaCm}
        onOpenAIAnalysis={() => setAnalysisOpen(true)}
        onMeasurementSaved={load}
      />
      {analysisOpen && (
        <AIAnalysisModal userProfile={profile} onClose={() => setAnalysisOpen(false)} range="3m" />
      )}
    </>
  );
}
