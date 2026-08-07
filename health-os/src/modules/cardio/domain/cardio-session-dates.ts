function getTimeZoneOffsetMs(timezone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(valueByType.year),
    Number(valueByType.month) - 1,
    Number(valueByType.day),
    Number(valueByType.hour),
    Number(valueByType.minute),
    Number(valueByType.second)
  );

  return asUtc - date.getTime();
}

export function dateOnlyStringToUtcDate(dateString: string, timezone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new Error("Cardio session date must be an ISO date string.");
  }

  const [, year, month, day] = match;
  const localAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
  const firstPass = new Date(localAsUtc - getTimeZoneOffsetMs(timezone, new Date(localAsUtc)));

  return new Date(localAsUtc - getTimeZoneOffsetMs(timezone, firstPass));
}
