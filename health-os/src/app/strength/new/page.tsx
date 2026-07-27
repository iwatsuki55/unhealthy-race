import Link from "next/link";

import { createStrengthSessionAction } from "@/app/strength/actions";
import { StrengthSessionForm } from "@/modules/strength/presentation/strength-session-form";

export default function NewStrengthSessionPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/strength">
          Back to strength
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Log Strength Session</h1>
      </div>

      <section>
        <StrengthSessionForm action={createStrengthSessionAction} submitLabel="Save session" />
      </section>
    </div>
  );
}
