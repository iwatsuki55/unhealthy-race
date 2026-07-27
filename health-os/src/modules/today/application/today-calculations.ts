export interface DateRange {
  start: Date;
  end: Date;
}

export interface GoalProgressInput {
  goalId: string;
  goalType: string;
  currentValue: number | null;
  targetValue: number;
}

export interface GoalProgressResult {
  goalId: string;
  currentValue: number | null;
  targetValue: number;
  progressRatio: number | null;
  progressPercent: number | null;
  direction: "more_is_better" | "less_is_better" | "manual";
  canCalculate: boolean;
}

export interface RecentActivityInput {
  id: string;
  date: Date;
}

const lowerIsBetterGoalTypes = new Set(["weight_target", "body_fat_target", "pace", "race_time"]);
const manualGoalTypes = new Set(["custom_health", "custom"]);

function getTimeZoneParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short"
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekday: values.weekday
  };
}

function getTimeZoneOffsetMilliseconds(date: Date, timezone: string) {
  const parts = getTimeZoneParts(date, timezone);
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return zonedAsUtc - date.getTime();
}

function makeZonedDate(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  const offset = getTimeZoneOffsetMilliseconds(utcGuess, timezone);
  const firstPass = new Date(utcGuess.getTime() - offset);
  const nextOffset = getTimeZoneOffsetMilliseconds(firstPass, timezone);

  return new Date(utcGuess.getTime() - nextOffset);
}

function addLocalDays(year: number, month: number, day: number, days: number) {
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

function mondayIndex(weekday: string) {
  const indexes: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6
  };

  return indexes[weekday] ?? 0;
}

export function getLocalDayRange(date: Date, timezone: string): DateRange {
  const parts = getTimeZoneParts(date, timezone);
  const nextDay = addLocalDays(parts.year, parts.month, parts.day, 1);

  return {
    start: makeZonedDate(timezone, parts.year, parts.month, parts.day),
    end: makeZonedDate(timezone, nextDay.year, nextDay.month, nextDay.day)
  };
}

export function getMondayWeekRange(date: Date, timezone: string): DateRange {
  const parts = getTimeZoneParts(date, timezone);
  const startDay = addLocalDays(parts.year, parts.month, parts.day, -mondayIndex(parts.weekday));
  const endDay = addLocalDays(startDay.year, startDay.month, startDay.day, 7);

  return {
    start: makeZonedDate(timezone, startDay.year, startDay.month, startDay.day),
    end: makeZonedDate(timezone, endDay.year, endDay.month, endDay.day)
  };
}

export function isInRange(date: Date, range: DateRange) {
  return date >= range.start && date < range.end;
}

function clampRatio(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function calculateGoalProgress(goal: GoalProgressInput): GoalProgressResult {
  const base = {
    goalId: goal.goalId,
    currentValue: goal.currentValue,
    targetValue: goal.targetValue
  };

  if (goal.currentValue === null || manualGoalTypes.has(goal.goalType)) {
    return {
      ...base,
      progressRatio: null,
      progressPercent: null,
      direction: "manual",
      canCalculate: false
    };
  }

  const direction = lowerIsBetterGoalTypes.has(goal.goalType) ? "less_is_better" : "more_is_better";
  const ratio =
    direction === "less_is_better"
      ? clampRatio(goal.targetValue / goal.currentValue)
      : clampRatio(goal.currentValue / goal.targetValue);

  return {
    ...base,
    progressRatio: ratio,
    progressPercent: Math.round(ratio * 100),
    direction,
    canCalculate: true
  };
}

export function sortRecentActivity<T extends RecentActivityInput>(items: T[]) {
  return [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
}
