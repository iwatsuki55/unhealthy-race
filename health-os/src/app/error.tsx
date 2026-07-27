"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold tracking-normal">Something went wrong</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Health OS could not load this screen. The underlying health details are not shown here.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/today">Back to Today</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
