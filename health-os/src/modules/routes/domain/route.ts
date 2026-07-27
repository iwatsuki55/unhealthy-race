import type { Difficulty, EntityId, Timestamped, UserOwned } from "@/core/shared";

export type SurfaceType = (typeof surfaceTypes)[number];

export const surfaceTypes = ["road", "trail", "track", "treadmill", "mixed", "unknown"] as const;

export interface RunningRoute extends Timestamped, UserOwned {
  id: EntityId;
  name: string;
  distanceMeters: number;
  estimatedDurationSeconds: number | null;
  elevationGainMeters: number | null;
  description: string | null;
  surfaceType: SurfaceType;
  difficulty: Difficulty;
  googleMapsUrl: string | null;
  isFavorite: boolean;
  isActive: boolean;
  notes: string | null;
}
