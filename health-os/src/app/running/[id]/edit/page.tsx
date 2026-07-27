import Link from "next/link";
import { notFound } from "next/navigation";

import { updateRunAction } from "@/app/running/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { routeRepository } from "@/modules/routes/infrastructure";
import { runRepository } from "@/modules/running/infrastructure";
import { RunForm } from "@/modules/running/presentation/run-form";

interface EditRunPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRunPage({ params }: EditRunPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const [run, routes] = await Promise.all([
    runRepository.findById(userId, id),
    routeRepository.listByUser(userId)
  ]);

  if (!run) {
    notFound();
  }

  const updateRun = updateRunAction.bind(null, run.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/running/${run.id}`}
        >
          Back to run
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Edit Run</h1>
      </div>

      <section>
        <RunForm
          action={updateRun}
          cancelHref={`/running/${run.id}`}
          routes={routes}
          run={run}
          submitLabel="Save run"
        />
      </section>
    </div>
  );
}
