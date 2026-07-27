export type EntityId = string;
export type ISODateString = string;
export type ISODateTimeString = string;

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOwned {
  userId: EntityId;
}

export type UnitSystem = (typeof unitSystems)[number];

export const unitSystems = ["metric", "imperial"] as const;

export type Difficulty = (typeof difficulties)[number];

export const difficulties = ["easy", "moderate", "hard"] as const;

export type WeightUnit = (typeof weightUnits)[number];

export const weightUnits = ["kg", "lb"] as const;

export type Rating = number;

export interface DateRange {
  start: Date;
  end: Date;
}
