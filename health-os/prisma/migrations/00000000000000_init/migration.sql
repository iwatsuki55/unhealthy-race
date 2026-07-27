-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tokyo',
    "unitSystem" TEXT NOT NULL DEFAULT 'metric',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "estimatedDurationSeconds" INTEGER,
    "elevationGainMeters" INTEGER,
    "description" TEXT,
    "surfaceType" TEXT NOT NULL DEFAULT 'unknown',
    "difficulty" TEXT NOT NULL DEFAULT 'moderate',
    "googleMapsUrl" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "routeId" TEXT,
    "runDate" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "durationSeconds" INTEGER NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "averagePaceSecondsPerKm" INTEGER NOT NULL,
    "averageHeartRate" INTEGER,
    "maximumHeartRate" INTEGER,
    "cadenceStepsPerMinute" INTEGER,
    "calories" INTEGER,
    "temperatureCelsius" REAL,
    "humidityPercent" INTEGER,
    "shoes" TEXT,
    "screenshotAttachmentRef" TEXT,
    "perceivedEffort" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "runs_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strength_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "durationSeconds" INTEGER,
    "workoutType" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "strength_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strength_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "exerciseOrder" INTEGER NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "strength_exercises_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "strength_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strength_sets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "setOrder" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weightValue" REAL,
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "restSeconds" INTEGER,
    "perceivedEffort" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "strength_sets_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "strength_exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "targetUnit" TEXT NOT NULL,
    "currentValue" REAL,
    "raceDate" DATETIME,
    "raceDistanceMeters" INTEGER,
    "raceTargetTimeSeconds" INTEGER,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entryDate" DATETIME NOT NULL,
    "moodRating" INTEGER,
    "fatigueRating" INTEGER,
    "recoveryRating" INTEGER,
    "workStressRating" INTEGER,
    "alcoholNote" TEXT,
    "saunaNote" TEXT,
    "tagsJson" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
