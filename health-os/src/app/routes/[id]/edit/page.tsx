import Link from "next/link";
import { notFound } from "next/navigation";

import { updateRouteAction } from "@/app/routes/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { RouteForm } from "@/modules/routes/presentation/route-form";
import { routeRepository } from "@/modules/routes/infrastructure";

interface EditRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRoutePage({ params }: EditRoutePageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const route = await routeRepository.findById(userId, id);

  if (!route) {
    notFound();
  }

  const updateRoute = updateRouteAction.bind(null, route.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/routes/${route.id}`}
        >
          Back to route
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Edit Route</h1>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <RouteForm action={updateRoute} route={route} submitLabel="Save route" />
      </section>
    </div>
  );
}
