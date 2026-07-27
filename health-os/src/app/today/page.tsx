import Link from "next/link";
import type { Route as NextRoute } from "next";
import { Dumbbell, Flag, Map, NotebookPen, Plus, Route, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const quickActions: Array<{
  href: NextRoute;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/running/new", label: "Log Run", icon: Route },
  { href: "/strength/new", label: "Log Strength", icon: Dumbbell },
  { href: "/journal/new", label: "Journal", icon: NotebookPen },
  { href: "/routes/new", label: "New Route", icon: Map },
  { href: "/goals/new", label: "New Goal", icon: Flag }
];

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Today</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            Choose the next useful action.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Priority 0 keeps this screen intentionally simple: navigation, quick logging paths, and
            empty states are in place before business logic is added.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-sm font-medium">Today&apos;s workout</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No workout logic yet. This area will later surface today&apos;s focus from goals and
            recent training context.
          </p>
        </div>
      </section>

      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="quick-actions-title" className="text-lg font-semibold tracking-normal">
            Quick logging
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Button asChild className="h-11 justify-start" key={action.href} variant="outline">
                <Link href={action.href}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {["Active goals", "Recent activity", "Latest journal"].map((title) => (
          <div className="min-h-36 rounded-lg border border-border bg-card p-4" key={title}>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold tracking-normal">{title}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Empty state placeholder. Data queries and domain behavior will be added after the
              foundation milestone.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
