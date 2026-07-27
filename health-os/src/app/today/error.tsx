"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TodayError() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h1 className="text-xl font-semibold tracking-normal">Today could not load</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        The daily overview hit an unexpected problem. Your module pages are still available.
      </p>
      <Button asChild className="mt-5">
        <Link href="/running">Open Running Log</Link>
      </Button>
    </div>
  );
}
