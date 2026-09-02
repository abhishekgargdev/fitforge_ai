"use client";

import { ProgressView } from "@/components/views/ProgressView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function ProgressPage() {
  const app = useMockApp();
  return (
    <ProgressView
      userProfile={app.userProfile}
      metrics={app.progressHistory}
      measurements={app.measurements}
      composition={app.bodyComposition}
      onOpenAIAnalysis={() => app.setAiAnalysisOpen(true)}
      onAddMeasurement={app.addMeasurement}
    />
  );
}
