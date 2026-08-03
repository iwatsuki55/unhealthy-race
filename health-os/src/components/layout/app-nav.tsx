import Link from "next/link";
import type { Route as NextRoute } from "next";
import {
  Dumbbell,
  Flag,
  Map,
  NotebookPen,
  Route,
  Settings,
  SunMedium,
  type LucideIcon
} from "lucide-react";

const navItems: Array<{
  href: NextRoute;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/today", label: "Today", icon: SunMedium },
  { href: "/cardio", label: "Cardio", icon: Route },
  { href: "/strength", label: "Strength", icon: Dumbbell },
  { href: "/routes", label: "Routes", icon: Map },
  { href: "/goals", label: "Goals", icon: Flag },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppNav() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3">
        <Link className="mr-4 shrink-0 text-sm font-semibold tracking-normal" href="/today">
          Health OS
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
