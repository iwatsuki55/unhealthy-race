export function metersToKilometersInput(meters: number | undefined) {
  return meters === undefined ? "" : (meters / 1000).toString();
}

export function kilometersInputToMeters(value: FormDataEntryValue | null) {
  const kilometers = Number(value);

  return Number.isFinite(kilometers) ? Math.round(kilometers * 1000) : value;
}

export function secondsToDurationInput(seconds: number | null | undefined) {
  if (!seconds) {
    return "";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

export function durationInputToSeconds(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return value;
  }

  const parts = value.split(":").map(Number);

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
