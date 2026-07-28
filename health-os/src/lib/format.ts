export function metersToKilometersInput(meters: number | undefined) {
  if (meters === undefined) {
    return "";
  }

  return Number((meters / 1000).toFixed(2)).toString();
}

export function formatDistance(meters: number | null | undefined) {
  return typeof meters === "number" ? `${metersToKilometersInput(meters)} km` : "Not set";
}

export function kilometersInputToMeters(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) {
    return value;
  }

  const kilometers = Number(trimmed);

  return Number.isFinite(kilometers) && kilometers > 0 ? Math.round(kilometers * 1000) : value;
}

export function secondsToDurationInput(seconds: number | null | undefined) {
  if (!seconds) {
    return "";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds]
      .map((part) => part.toString().padStart(2, "0"))
      .join(":");
  }

  return [minutes, remainingSeconds].map((part) => part.toString().padStart(2, "0")).join(":");
}

export function formatDuration(seconds: number | null | undefined, emptyLabel = "Not set") {
  return seconds ? secondsToDurationInput(seconds) : emptyLabel;
}

export function formatPace(secondsPerKm: number | null | undefined) {
  if (!secondsPerKm) {
    return "Not set";
  }

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export function formatHeartRate(value: number | null | undefined, label = "bpm") {
  return value ? `${value} ${label}` : "Not set";
}

export function formatPercentage(value: number | null | undefined) {
  return typeof value === "number" ? `${value}%` : "Not set";
}

export function formatEnumLabel(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(date: Date | null | undefined, timezone = "Asia/Tokyo") {
  return date
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(date)
    : "Not set";
}

export function formatLongDate(date: Date | null | undefined, timezone = "Asia/Tokyo") {
  return date
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        month: "long",
        day: "numeric",
        year: "numeric"
      }).format(date)
    : "Not set";
}

export function formatDateInputValue(date: Date | null | undefined, timezone = "Asia/Tokyo") {
  if (!date) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${valueByType.year}-${valueByType.month}-${valueByType.day}`;
}

export function todayDateInputValue(timezone = "Asia/Tokyo") {
  return formatDateInputValue(new Date(), timezone);
}

export function formatWeight(value: number | null | undefined, unit = "kg") {
  return typeof value === "number" ? `${value} ${unit}` : "Not set";
}

export function durationInputToSeconds(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return value;
  }

  const trimmed = value.trim();
  const normalized = normalizeDurationInput(trimmed);

  if (!normalized) {
    return value;
  }

  const parts = normalized.split(":").map(Number);

  if (parts.some((part) => !Number.isFinite(part))) {
    return value;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return value;
}

export function normalizeDurationInput(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return "";
  }

  if (/^(?:\d+:)?[0-5]?\d:[0-5]\d$/.test(trimmed)) {
    return trimmed;
  }

  if (!/^\d{1,6}$/.test(trimmed)) {
    return null;
  }

  if (trimmed.length <= 2) {
    return `${Number(trimmed)}:00`;
  }

  const padded = trimmed.padStart(trimmed.length <= 4 ? 4 : 6, "0");

  if (padded.length === 4) {
    const minutes = Number(padded.slice(0, 2));
    const seconds = Number(padded.slice(2, 4));

    if (seconds >= 60) {
      return null;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2, 4));
  const seconds = Number(padded.slice(4, 6));

  if (minutes >= 60 || seconds >= 60) {
    return null;
  }

  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, "0")).join(":");
}
