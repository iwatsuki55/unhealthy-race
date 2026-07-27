import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold tracking-normal">Record not found</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          This record may have been deleted, archived elsewhere, or may not belong to the current
          user.
        </p>
        <Button asChild className="mt-5">
          <Link href="/today">Back to Today</Link>
        </Button>
      </section>
    </main>
  );
}
