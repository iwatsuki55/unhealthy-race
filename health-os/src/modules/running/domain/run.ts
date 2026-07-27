import type { EntityId, Timestamped, UserOwned } from "@/core/shared";

export interface Run extends Timestamped, UserOwned {
  id: EntityId;
  routeId: EntityId | null;
  runDate: Date;
  startedAt: Date | null;
  durationSeconds: number;
  distanceMeters: number;
  averagePaceSecondsPerKm: number;
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
