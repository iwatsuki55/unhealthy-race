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
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Log Run</h1>
      </div>

      <section>
        <RunForm action={createRunAction} routes={routes} submitLabel="Save run" />
      </section>
    </div>
  );
}
