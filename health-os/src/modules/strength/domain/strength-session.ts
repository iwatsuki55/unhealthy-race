import type { EntityId, Timestamped, UserOwned, WeightUnit } from "@/core/shared";

export type WorkoutType = (typeof workoutTypes)[number];
export type EquipmentType = (typeof equipmentTypes)[number];

export const workoutTypes = ["full_body", "upper", "lower", "push", "pull", "legs"] as const;
export const equipmentTypes = ["machine", "free_weight", "bodyweight"] as const;

export interface StrengthSet extends Timestamped {
  id: EntityId;
  exerciseId: EntityId;
  setOrder: number;
  reps: number;
  weightValue: number | null;
  weightUnit: WeightUnit;
  restSeconds: number | null;
  perceivedEffort: number | null;
  notes: string | null;
}

export interface StrengthExercise extends Timestamped {
  id: EntityId;
  sessionId: EntityId;
  exerciseName: string;
  exerciseOrder: number;
  equipmentType: EquipmentType;
  notes: string | null;
  sets: StrengthSet[];
}

export interface StrengthSession extends Timestamped, UserOwned {
  id: EntityId;
  sessionDate: Date;
  startedAt: Date | null;
  durationSeconds: number | null;
  workoutType: WorkoutType;
  location: string | null;
  notes: string | null;
  exercises: StrengthExercise[];
}
