import { prisma } from "@/server/db/prisma";

let initialization: Promise<void> | null = null;

const statements = [
  "PRAGMA foreign_keys = ON",
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tokyo',
    "unitSystem" TEXT NOT NULL DEFAULT 'metric',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "routes" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "runs" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "strength_sessions" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "strength_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "exerciseOrder" INTEGER NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "strength_exercises_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "strength_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "strength_sets" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "goals" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "journal_entries" (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
  `CREATE INDEX IF NOT EXISTS "routes_userId_idx" ON "routes"("userId")`,
  `CREATE INDEX IF NOT EXISTS "runs_userId_runDate_idx" ON "runs"("userId", "runDate")`,
  `CREATE INDEX IF NOT EXISTS "runs_routeId_idx" ON "runs"("routeId")`,
  `CREATE INDEX IF NOT EXISTS "strength_sessions_userId_sessionDate_idx" ON "strength_sessions"("userId", "sessionDate")`,
  `CREATE INDEX IF NOT EXISTS "strength_exercises_sessionId_idx" ON "strength_exercises"("sessionId")`,
  `CREATE INDEX IF NOT EXISTS "strength_sets_exerciseId_idx" ON "strength_sets"("exerciseId")`,
  `CREATE INDEX IF NOT EXISTS "goals_userId_status_idx" ON "goals"("userId", "status")`,
  `CREATE INDEX IF NOT EXISTS "goals_userId_module_idx" ON "goals"("userId", "module")`,
  `CREATE INDEX IF NOT EXISTS "journal_entries_userId_entryDate_idx" ON "journal_entries"("userId", "entryDate")`
];

function isSqliteFileDatabase() {
  return process.env.DATABASE_URL?.startsWith("file:") ?? false;
}

export async function ensureSqliteSchema() {
  if (!isSqliteFileDatabase()) {
    return;
  }

  initialization ??= (async () => {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  })();

  await initialization;
}
