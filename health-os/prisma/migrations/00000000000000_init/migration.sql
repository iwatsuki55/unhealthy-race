-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('metric', 'imperial');

-- CreateEnum
CREATE TYPE "SurfaceType" AS ENUM ('road', 'trail', 'track', 'treadmill', 'mixed', 'unknown');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'moderate', 'hard');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('full_body', 'upper', 'lower', 'push', 'pull', 'legs');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('machine', 'free_weight', 'bodyweight');

-- CreateEnum
CREATE TYPE "GoalModule" AS ENUM ('running', 'strength', 'weight', 'body_fat', 'race', 'health', 'general');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('running_distance', 'running_frequency', 'pace', 'race_completion', 'race_time', 'strength_frequency', 'weight_target', 'weight_change', 'body_fat_target', 'body_fat_change', 'custom_health', 'custom');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'completed', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tokyo',
    "unitSystem" "UnitSystem" NOT NULL DEFAULT 'metric',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "estimatedDurationSeconds" INTEGER,
    "elevationGainMeters" INTEGER,
    "description" TEXT,
    "surfaceType" "SurfaceType" NOT NULL DEFAULT 'unknown',
    "difficulty" "Difficulty" NOT NULL DEFAULT 'moderate',
    "googleMapsUrl" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT,
    "runDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "averagePaceSecondsPerKm" INTEGER NOT NULL,
    "averageHeartRate" INTEGER,
    "maximumHeartRate" INTEGER,
    "cadenceStepsPerMinute" INTEGER,
    "calories" INTEGER,
    "temperatureCelsius" DOUBLE PRECISION,
    "humidityPercent" INTEGER,
    "shoes" TEXT,
    "screenshotAttachmentRef" TEXT,
    "perceivedEffort" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strength_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "workoutType" "WorkoutType" NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strength_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strength_exercises" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "exerciseOrder" INTEGER NOT NULL,
    "equipmentType" "EquipmentType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strength_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strength_sets" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setOrder" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weightValue" DOUBLE PRECISION,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'kg',
    "restSeconds" INTEGER,
    "perceivedEffort" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strength_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" "GoalModule" NOT NULL,
    "goalType" "GoalType" NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "targetUnit" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "raceDate" TIMESTAMP(3),
    "raceDistanceMeters" INTEGER,
    "raceTargetTimeSeconds" INTEGER,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "moodRating" INTEGER,
    "fatigueRating" INTEGER,
    "recoveryRating" INTEGER,
    "workStressRating" INTEGER,
    "alcoholNote" TEXT,
    "saunaNote" TEXT,
    "tagsJson" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "routes_userId_idx" ON "routes"("userId");

-- CreateIndex
CREATE INDEX "runs_userId_runDate_idx" ON "runs"("userId", "runDate");

-- CreateIndex
CREATE INDEX "runs_routeId_idx" ON "runs"("routeId");

-- CreateIndex
CREATE INDEX "strength_sessions_userId_sessionDate_idx" ON "strength_sessions"("userId", "sessionDate");

-- CreateIndex
CREATE INDEX "strength_exercises_sessionId_idx" ON "strength_exercises"("sessionId");

-- CreateIndex
CREATE INDEX "strength_sets_exerciseId_idx" ON "strength_sets"("exerciseId");

-- CreateIndex
CREATE INDEX "goals_userId_status_idx" ON "goals"("userId", "status");

-- CreateIndex
CREATE INDEX "goals_userId_module_idx" ON "goals"("userId", "module");

-- CreateIndex
CREATE INDEX "journal_entries_userId_entryDate_idx" ON "journal_entries"("userId", "entryDate");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strength_sessions" ADD CONSTRAINT "strength_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strength_exercises" ADD CONSTRAINT "strength_exercises_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "strength_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strength_sets" ADD CONSTRAINT "strength_sets_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "strength_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
