import Link from "next/link";

import { createRunAction } from "@/app/running/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { routeRepository } from "@/modules/routes/infrastructure";
import { RunForm } from "@/modules/running/presentation/run-form";

export default async function NewRunPage() {
  const userId = await getCurrentUserId();
  const routes = await routeRepository.listByUser(userId);

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/running">
          Back to running
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Log Run</h1>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <RunForm action={createRunAction} routes={routes} submitLabel="Save run" />
      </section>
    </div>
  );
}
