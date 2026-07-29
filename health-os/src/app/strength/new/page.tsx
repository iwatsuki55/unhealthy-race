import Link from "next/link";
import { Upload } from "lucide-react";

import { createStrengthSessionAction } from "@/app/strength/actions";
import { Button } from "@/components/ui/button";
import { StrengthSessionForm } from "@/modules/strength/presentation/strength-session-form";

export default function NewStrengthSessionPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/strength">
            Back to strength
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Log Strength Session</h1>
        </div>
        <Button asChild>
          <Link href="/workout-import/new">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import Workout
          </Link>
        </Button>
      </div>

      <section>
        <StrengthSessionForm
          action={createStrengthSessionAction}
          cancelHref="/strength"
          submitLabel="Save session"
        />
      </section>
    </div>
  );
}
