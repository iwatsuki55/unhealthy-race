import Link from "next/link";

import { createRunAction } from "@/app/running/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { routeRepository } from "@/modules/routes/infrastructure";
import { RunForm } from "@/modules/running/presentation/run-form";

export default async function NewRunPage() {
  const userId = await getCurrentUserId();
  const routes = await routeRepository.listByUser(userId);

  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/running">
          Back to running
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-normal">Log Run</h1>
          <Link
            className="text-sm font-medium text-primary hover:text-primary/80"
            href="/workout-import/new?type=running"
          >
            Import from screenshots
          </Link>
        </div>
      </div>

      <section>
        <RunForm
          action={createRunAction}
          cancelHref="/running"
          routes={routes}
          submitLabel="Save run"
        />
      </section>
    </div>
  );
}
