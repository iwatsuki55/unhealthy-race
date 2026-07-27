import Link from "next/link";

import { createRouteAction } from "@/app/routes/actions";
import { RouteForm } from "@/modules/routes/presentation/route-form";

export default function NewRoutePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/routes">
          Back to routes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">New Route</h1>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <RouteForm action={createRouteAction} submitLabel="Create route" />
      </section>
    </div>
  );
}
