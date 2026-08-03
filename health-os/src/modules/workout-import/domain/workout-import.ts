export const importSessionStatuses = [
  "uploading",
  "ready",
  "analyzing",
  "review_required",
  "completed",
  "failed",
  "cancelled"
] as const;

export const confidenceLevels = ["high", "medium", "low"] as const;

export type ImportSessionStatus = (typeof importSessionStatuses)[number];
export type ConfidenceLevel = (typeof confidenceLevels)[number];

export interface ImportedImage {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  originalOrder: number;
  currentOrder: number;
  duplicateKey: string;
  previewUrl?: string;
  sourceApplication?: string;
}

export interface ImportField<T> {
  value: T | null;
  confidence: ConfidenceLevel;
  sourceImageIds: string[];
  alternatives?: T[];
  conflict?: boolean;
}

export interface WorkoutImportSetDraft {
  setNumber: number;
  weightValue: ImportField<number>;
  reps: ImportField<number>;
  durationSeconds?: ImportField<number>;
  distanceMeters?: ImportField<number>;
  pr?: ImportField<boolean>;
}

export interface WorkoutImportExerciseDraft {
  id: string;
  exerciseName: ImportField<string>;
  equipmentType: ImportField<"machine" | "free_weight" | "bodyweight" | null>;
  order: number;
  sets: WorkoutImportSetDraft[];
}

export interface WorkoutImportDraft {
  title: ImportField<string>;
  workoutDate: ImportField<string>;
  startTime: ImportField<string>;
  durationSeconds: ImportField<number>;
  workoutType: ImportField<string>;
  calories: ImportField<number>;
  totalVolume: ImportField<number>;
  prCount: ImportField<number>;
  notes: ImportField<string>;
  sourceApplication: ImportField<string>;
  exercises: WorkoutImportExerciseDraft[];
}

export interface RunImportDraft {
  title: ImportField<string>;
  activityType: ImportField<string>;
  runDate: ImportField<string>;
  startTime: ImportField<string>;
  distanceMeters: ImportField<number>;
  durationSeconds: ImportField<number>;
  averagePaceSecondsPerKm: ImportField<number>;
  averageHeartRate: ImportField<number>;
  maximumHeartRate: ImportField<number>;
  cadenceStepsPerMinute: ImportField<number>;
  calories: ImportField<number>;
  temperatureCelsius: ImportField<number>;
  humidityPercent: ImportField<number>;
  shoes: ImportField<string>;
  perceivedEffort: ImportField<number>;
  notes: ImportField<string>;
  sourceApplication: ImportField<string>;
}

export interface WorkoutImportSession {
  id: string;
  userId: string;
  status: ImportSessionStatus;
  createdAt: string;
  images: ImportedImage[];
  detectedSourceApplications: string[];
  extractionResult: WorkoutImportDraft | RunImportDraft | null;
  validationWarnings: string[];
}
