import Link from "next/link";

import { createCardioSessionAction } from "@/app/cardio/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { routeRepository } from "@/modules/routes/infrastructure";
import { CardioSessionForm } from "@/modules/cardio/presentation/cardio-session-form";

export default async function NewCardioSessionPage() {
  const userId = await getCurrentUserId();
  const routes = await routeRepository.listByUser(userId);

  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/cardio">
          Back to cardio
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-normal">Log Cardio</h1>
          <Link
            className="text-sm font-medium text-primary hover:text-primary/80"
            href="/workout-import/new?type=cardio"
          >
            Import from screenshots
          </Link>
        </div>
      </div>

      <section>
        <CardioSessionForm
          action={createCardioSessionAction}
          cancelHref="/cardio"
          routes={routes}
          submitLabel="Save cardio"
        />
      </section>
    </div>
  );
}
