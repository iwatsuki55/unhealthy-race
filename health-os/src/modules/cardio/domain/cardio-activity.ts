export const cardioActivityTypeValues = [
  "outdoor_run",
  "treadmill_run",
  "outdoor_walk",
  "treadmill_walk",
  "exercise_bike",
  "outdoor_cycling",
  "hiking",
  "rowing",
  "swimming",
  "stair_climber",
  "elliptical",
  "other"
] as const;

export type CardioActivityType = (typeof cardioActivityTypeValues)[number];

export interface CardioActivityConfig {
  label: string;
  supportsDistance: boolean;
  requiresDistance: boolean;
  supportsRoute: boolean;
  showsPace: boolean;
  supportsCadence: boolean;
}

export const cardioActivityConfigs: Record<CardioActivityType, CardioActivityConfig> = {
  outdoor_run: {
    label: "Outdoor Run",
    supportsDistance: true,
    requiresDistance: true,
    supportsRoute: true,
    showsPace: true,
    supportsCadence: true
  },
  treadmill_run: {
    label: "Treadmill Run",
    supportsDistance: true,
    requiresDistance: true,
    supportsRoute: false,
    showsPace: true,
    supportsCadence: true
  },
  outdoor_walk: {
    label: "Outdoor Walk",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: true,
    showsPace: true,
    supportsCadence: true
  },
  treadmill_walk: {
    label: "Treadmill Walk",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: true,
    supportsCadence: true
  },
  exercise_bike: {
    label: "Exercise Bike",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: false,
    supportsCadence: false
  },
  outdoor_cycling: {
    label: "Outdoor Cycling",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: true,
    showsPace: false,
    supportsCadence: false
  },
  hiking: {
    label: "Hiking",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: true,
    showsPace: true,
    supportsCadence: false
  },
  rowing: {
    label: "Rowing",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: false,
    supportsCadence: false
  },
  swimming: {
    label: "Swimming",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: false,
    supportsCadence: false
  },
  stair_climber: {
    label: "Stair Climber",
    supportsDistance: false,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: false,
    supportsCadence: false
  },
  elliptical: {
    label: "Elliptical",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: false,
    supportsCadence: false
  },
  other: {
    label: "Other",
    supportsDistance: true,
    requiresDistance: false,
    supportsRoute: false,
    showsPace: false,
    supportsCadence: false
  }
};

export function getCardioActivityConfig(activityType: CardioActivityType) {
  return cardioActivityConfigs[activityType];
}

export function getCardioActivityLabel(activityType: CardioActivityType) {
  return getCardioActivityConfig(activityType).label;
}
