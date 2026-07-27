"use client";

import type { InputHTMLAttributes } from "react";
import { useEffect, useState } from "react";

type TextUnitInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  name: string;
  unit: string;
};

export function TextUnitInput({ id, name, unit, onFocus, ...props }: TextUnitInputProps) {
  return (
    <div className="flex min-h-11 rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
      <input
        {...props}
        className="min-w-0 flex-1 rounded-l-md bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        id={id}
        name={name}
        type="text"
        onFocus={(event) => {
          event.currentTarget.select();
          onFocus?.(event);
        }}
      />
      <span className="inline-flex select-none items-center border-l border-border px-3 text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

interface QuickFillGroupProps {
  label: string;
  targetId: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}

export function QuickFillGroup({ label, targetId, options }: QuickFillGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      {options.map((option) => (
        <button
          className="h-8 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          key={option.value}
          type="button"
          onClick={() => {
            const input = document.getElementById(targetId);

            if (input instanceof HTMLInputElement) {
              input.value = option.value;
              input.dispatchEvent(new Event("input", { bubbles: true }));
              input.focus();
            }
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function parseDistanceKm(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
    return null;
  }

  const distance = Number(value);

  return Number.isFinite(distance) && distance > 0 ? distance : null;
}

function parseDurationSeconds(value: string) {
  const trimmed = value.trim();

  if (!/^(?:\d+:)?[0-5]?\d:[0-5]\d$/.test(trimmed)) {
    return null;
  }

  const parts = trimmed.split(":").map(Number);

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}

function formatPace(secondsPerKm: number) {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export function PacePreview({
  distanceInputId,
  durationInputId
}: {
  distanceInputId: string;
  durationInputId: string;
}) {
  const [pace, setPace] = useState<string | null>(null);

  useEffect(() => {
    const distanceElement = document.getElementById(distanceInputId);
    const durationElement = document.getElementById(durationInputId);

    if (
      !(distanceElement instanceof HTMLInputElement) ||
      !(durationElement instanceof HTMLInputElement)
    ) {
      return;
    }

    const distanceInput = distanceElement;
    const durationInput = durationElement;

    function updatePreview() {
      const distanceKm = parseDistanceKm(distanceInput.value);
      const durationSeconds = parseDurationSeconds(durationInput.value);

      if (!distanceKm || !durationSeconds) {
        setPace(null);
        return;
      }

      setPace(formatPace(Math.round(durationSeconds / distanceKm)));
    }

    distanceInput.addEventListener("input", updatePreview);
    durationInput.addEventListener("input", updatePreview);
    updatePreview();

    return () => {
      distanceInput.removeEventListener("input", updatePreview);
      durationInput.removeEventListener("input", updatePreview);
    };
  }, [distanceInputId, durationInputId]);

  return (
    <div className="rounded-lg border border-border bg-background p-3" aria-live="polite">
      <p className="text-xs font-medium text-muted-foreground">Average pace</p>
      <p className="mt-1 text-base font-semibold tracking-normal text-foreground">
        {pace ?? "-- /km"}
      </p>
    </div>
  );
}
