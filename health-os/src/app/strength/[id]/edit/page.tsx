import Link from "next/link";
import { notFound } from "next/navigation";

import { updateStrengthSessionAction } from "@/app/strength/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { strengthSessionRepository } from "@/modules/strength/infrastructure";
import { StrengthSessionForm } from "@/modules/strength/presentation/strength-session-form";

interface EditStrengthSessionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStrengthSessionPage({ params }: EditStrengthSessionPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const session = await strengthSessionRepository.findById(userId, id);

  if (!session) {
    notFound();
  }

  const updateSession = updateStrengthSessionAction.bind(null, session.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/strength/${session.id}`}
        >
          Back to session
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Edit Strength Session</h1>
      </div>

      <section>
        <StrengthSessionForm
          action={updateSession}
          cancelHref={`/strength/${session.id}`}
          session={session}
          submitLabel="Save session"
        />
      </section>
    </div>
  );
}
