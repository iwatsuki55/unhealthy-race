export function metersToKilometersInput(meters: number | undefined) {
  if (meters === undefined) {
    return "";
  }

  return Number((meters / 1000).toFixed(2)).toString();
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

export function durationInputToSeconds(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return value;
  }

  const trimmed = value.trim();

  if (!/^(?:\d+:)?[0-5]?\d:[0-5]\d$/.test(trimmed)) {
    return value;
  }

  const parts = trimmed.split(":").map(Number);

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
