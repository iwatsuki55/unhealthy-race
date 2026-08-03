import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCardioSessionAction } from "@/app/cardio/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { routeRepository } from "@/modules/routes/infrastructure";
import { cardioSessionRepository } from "@/modules/cardio/infrastructure";
import { CardioSessionForm } from "@/modules/cardio/presentation/cardio-session-form";

interface EditCardioSessionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCardioSessionPage({ params }: EditCardioSessionPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const [session, routes] = await Promise.all([
    cardioSessionRepository.findById(userId, id),
    routeRepository.listByUser(userId)
  ]);

  if (!session) {
    notFound();
  }

  const updateSession = updateCardioSessionAction.bind(null, session.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/cardio/${session.id}`}
        >
          Back to cardio
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Edit Cardio</h1>
      </div>

      <section>
        <CardioSessionForm
          action={updateSession}
          cancelHref={`/cardio/${session.id}`}
          routes={routes}
          session={session}
          submitLabel="Save cardio"
        />
      </section>
    </div>
  );
}
