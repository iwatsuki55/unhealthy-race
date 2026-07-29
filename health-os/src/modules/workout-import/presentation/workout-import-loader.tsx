"use client";

import dynamic from "next/dynamic";

const WorkoutImportClient = dynamic(
  () => import("./workout-import-client").then((module) => module.WorkoutImportClient),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">Preparing import workspace...</p>
      </section>
    )
  }
);

export function WorkoutImportLoader() {
  return <WorkoutImportClient />;
}
