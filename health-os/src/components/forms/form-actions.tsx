"use client";

import Link from "next/link";
import type { Route } from "next";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  cancelHref: string;
  submitLabel: string;
}

export function FormActions({ cancelHref, submitLabel }: FormActionsProps) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap gap-3">
      <Button className="h-11 px-5" disabled={pending} type="submit">
        {pending ? "Saving..." : submitLabel}
      </Button>
      <Button asChild className="h-11 px-5" variant="outline">
        <Link aria-disabled={pending} href={cancelHref as Route}>
          Cancel
        </Link>
      </Button>
    </div>
  );
}
