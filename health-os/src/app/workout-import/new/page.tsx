import Link from "next/link";

import { WorkoutImportLoader } from "@/modules/workout-import/presentation";

export default function NewWorkoutImportPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/strength">
          Back to strength
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Import Workout</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Upload multiple workout screenshots, check the image order, and review a draft before
          anything is saved.
        </p>
      </div>

      <WorkoutImportLoader />
    </div>
  );
}
