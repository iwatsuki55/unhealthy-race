"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  confirmMessage: string;
  label: string;
  pendingLabel?: string;
}

export function ConfirmDeleteButton({
  confirmMessage,
  label,
  pendingLabel = "Deleting..."
}: ConfirmDeleteButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      variant="outline"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
