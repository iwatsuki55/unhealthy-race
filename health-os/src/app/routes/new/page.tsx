import Link from "next/link";

import { createRouteAction } from "@/app/routes/actions";
import { RouteForm } from "@/modules/routes/presentation/route-form";

export default function NewRoutePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/routes">
          Back to routes
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">New Route</h1>
      </div>

      <section>
        <RouteForm action={createRouteAction} cancelHref="/routes" submitLabel="Create route" />
      </section>
    </div>
  );
}
