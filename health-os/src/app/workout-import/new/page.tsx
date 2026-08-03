import Link from "next/link";

import { WorkoutImportLoader } from "@/modules/workout-import/presentation";

interface NewWorkoutImportPageProps {
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function NewWorkoutImportPage({ searchParams }: NewWorkoutImportPageProps) {
  const { type } = await searchParams;
  const importType = type === "cardio" || type === "running" ? "cardio" : "strength";
  const backHref = importType === "cardio" ? "/cardio" : "/strength";
  const title = importType === "cardio" ? "Import Cardio" : "Import Workout";

  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href={backHref}>
          Back to {importType === "cardio" ? "cardio" : "strength"}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Upload multiple screenshots, check the image order, and review a draft before anything is
          saved.
        </p>
      </div>

      <WorkoutImportLoader importType={importType} />
    </div>
  );
}
