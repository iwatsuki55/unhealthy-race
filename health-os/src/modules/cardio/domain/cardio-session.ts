import type { EntityId, Timestamped, UserOwned } from "@/core/shared";

import type { CardioActivityType } from "./cardio-activity";

export interface CardioSession extends Timestamped, UserOwned {
  id: EntityId;
  routeId: EntityId | null;
  activityType: CardioActivityType;
  runDate: Date;
  startedAt: Date | null;
  durationSeconds: number;
  distanceMeters: number | null;
  averagePaceSecondsPerKm: number | null;
  averageHeartRate: number | null;
  maximumHeartRate: number | null;
  cadenceStepsPerMinute: number | null;
  calories: number | null;
  temperatureCelsius: number | null;
  humidityPercent: number | null;
  shoes: string | null;
  screenshotAttachmentRef: string | null;
  perceivedEffort: number | null;
  notes: string | null;
}

export type Run = CardioSession;
