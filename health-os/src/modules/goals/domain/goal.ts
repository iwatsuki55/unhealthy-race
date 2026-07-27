import type { EntityId, Timestamped, UserOwned } from "@/core/shared";

export type GoalModule = (typeof goalModules)[number];
export type GoalType = (typeof goalTypes)[number];
export type GoalStatus = (typeof goalStatuses)[number];

export const goalModules = [
  "running",
  "strength",
  "weight",
  "body_fat",
  "race",
  "health",
  "general"
] as const;

export const goalTypes = [
  "running_distance",
  "running_frequency",
  "pace",
  "race_completion",
  "race_time",
  "strength_frequency",
  "weight_target",
  "weight_change",
  "body_fat_target",
  "body_fat_change",
  "custom_health",
  "custom"
] as const;

export const goalStatuses = ["active", "completed", "paused", "archived"] as const;

export interface Goal extends Timestamped, UserOwned {
  id: EntityId;
  title: string;
  module: GoalModule;
  goalType: GoalType;
  targetValue: number;
  targetUnit: string;
  currentValue: number | null;
  raceDate: Date | null;
  raceDistanceMeters: number | null;
  raceTargetTimeSeconds: number | null;
  periodStart: Date;
  periodEnd: Date;
  status: GoalStatus;
  notes: string | null;
}

export interface GoalProgress {
  goalId: EntityId;
  currentValue: number | null;
  targetValue: number;
  progressRatio: number | null;
}
