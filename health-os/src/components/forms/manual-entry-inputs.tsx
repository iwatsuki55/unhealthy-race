"use client";

import type { InputHTMLAttributes } from "react";
import { useEffect, useState } from "react";

import { normalizeDurationInput } from "@/lib/format";

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

export function DurationInput({
  onBlur,
  title = "Use mm:ss, hh:mm:ss, or compact digits such as 3500 for 35:00.",
  ...props
}: Omit<TextUnitInputProps, "inputMode" | "pattern" | "unit">) {
  return (
    <TextUnitInput
      inputMode="numeric"
      pattern="^(?:(?:\\d+:)?[0-5]?\\d:[0-5]\\d|\\d{1,6})$"
      title={title}
      unit="mm:ss"
      onBlur={(event) => {
        const normalized = normalizeDurationInput(event.currentTarget.value);

        if (normalized) {
          event.currentTarget.value = normalized;
          event.currentTarget.dispatchEvent(new Event("input", { bubbles: true }));
        }

        onBlur?.(event);
      }}
      {...props}
    />
  );
}

function splitDurationInput(value: string | undefined) {
  const normalized = value ? normalizeDurationInput(value) : "";

  if (!normalized) {
    return { hours: "", minutes: "", seconds: "" };
  }

  const parts = normalized.split(":");

  if (parts.length === 3) {
    return {
      hours: Number(parts[0]).toString(),
      minutes: Number(parts[1]).toString(),
      seconds: Number(parts[2]).toString()
    };
  }

  return {
    hours: "",
    minutes: Number(parts[0]).toString(),
    seconds: Number(parts[1]).toString()
  };
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function buildDurationValue(hours: string, minutes: string, seconds: string) {
  if (!hours && !minutes && !seconds) {
    return "";
  }

  const normalizedHours = hours ? Number(hours) : 0;
  const normalizedMinutes = minutes ? Number(minutes) : 0;
  const normalizedSeconds = seconds ? Number(seconds) : 0;

  if (normalizedHours > 0) {
    return [
      normalizedHours,
      normalizedMinutes.toString().padStart(2, "0"),
      normalizedSeconds.toString().padStart(2, "0")
    ].join(":");
  }

  return `${normalizedMinutes}:${normalizedSeconds.toString().padStart(2, "0")}`;
}

export function SplitDurationInput({
  defaultValue,
  idPrefix,
  name
}: {
  defaultValue?: string;
  idPrefix: string;
  name: string;
}) {
  const initialValue = splitDurationInput(defaultValue);
  const [hours, setHours] = useState(initialValue.hours);
  const [minutes, setMinutes] = useState(initialValue.minutes);
  const [seconds, setSeconds] = useState(initialValue.seconds);
  const compactInputClass =
    "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

  return (
    <div className="grid gap-2">
      <input name={name} type="hidden" value={buildDurationValue(hours, minutes, seconds)} />
      <div className="grid grid-cols-3 gap-2">
        <label
          className="grid gap-1 text-xs font-medium text-muted-foreground"
          htmlFor={`${idPrefix}-hours`}
        >
          Hours
          <input
            className={compactInputClass}
            id={`${idPrefix}-hours`}
            inputMode="numeric"
            maxLength={3}
            pattern="\d*"
            placeholder="0"
            type="text"
            value={hours}
            onChange={(event) => setHours(onlyDigits(event.currentTarget.value).slice(0, 3))}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
        <label
          className="grid gap-1 text-xs font-medium text-muted-foreground"
          htmlFor={`${idPrefix}-minutes`}
        >
          Min
          <input
            className={compactInputClass}
            id={`${idPrefix}-minutes`}
            inputMode="numeric"
            maxLength={2}
            pattern="\d*"
            placeholder="45"
            type="text"
            value={minutes}
            onChange={(event) => setMinutes(onlyDigits(event.currentTarget.value).slice(0, 2))}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
        <label
          className="grid gap-1 text-xs font-medium text-muted-foreground"
          htmlFor={`${idPrefix}-seconds`}
        >
          Sec
          <input
            className={compactInputClass}
            id={`${idPrefix}-seconds`}
            inputMode="numeric"
            maxLength={2}
            pattern="\d*"
            placeholder="00"
            type="text"
            value={seconds}
            onChange={(event) => setSeconds(onlyDigits(event.currentTarget.value).slice(0, 2))}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      </div>
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
  const normalized = normalizeDurationInput(value);

  if (!normalized) {
    return null;
  }

  const parts = normalized.split(":").map(Number);

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
