CREATE TYPE "CardioActivityType" AS ENUM (
  'outdoor_run',
  'treadmill_run',
  'outdoor_walk',
  'treadmill_walk',
  'exercise_bike',
  'outdoor_cycling',
  'hiking',
  'rowing',
  'swimming',
  'stair_climber',
  'elliptical',
  'other'
);

ALTER TABLE "runs"
  ADD COLUMN "activityType" "CardioActivityType" NOT NULL DEFAULT 'outdoor_run',
  ALTER COLUMN "distanceMeters" DROP NOT NULL,
  ALTER COLUMN "averagePaceSecondsPerKm" DROP NOT NULL;
