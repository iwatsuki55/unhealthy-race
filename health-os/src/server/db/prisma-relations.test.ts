import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";

const shouldRunDbTests = process.env.DATABASE_URL?.startsWith("postgres") ?? false;
const dbTest = shouldRunDbTests ? test : test.skip;
const prisma = shouldRunDbTests ? new PrismaClient() : null;

function getPrisma() {
  if (!prisma) {
    throw new Error("Postgres DATABASE_URL is required for database relation tests.");
  }

  return prisma;
}

async function createTestUser(email: string) {
  return getPrisma().user.create({
    data: {
      email,
      displayName: "Test User",
      timezone: "Asia/Tokyo",
      unitSystem: "metric"
    }
  });
}

dbTest("deleting a run does not delete its route", async () => {
  const user = await createTestUser(`run-route-${Date.now()}@health-os.test`);
  const prisma = getPrisma();
  const route = await prisma.route.create({
    data: {
      userId: user.id,
      name: "Integration Route",
      distanceMeters: 5000,
      surfaceType: "road",
      difficulty: "easy"
    }
  });
  const run = await prisma.run.create({
    data: {
      userId: user.id,
      routeId: route.id,
      runDate: new Date("2026-07-27T00:00:00.000+09:00"),
      durationSeconds: 1800,
      distanceMeters: 5000,
      averagePaceSecondsPerKm: 360
    }
  });

  await prisma.run.delete({ where: { id: run.id } });

  assert.equal(await prisma.route.count({ where: { id: route.id } }), 1);
  await prisma.user.delete({ where: { id: user.id } });
});

dbTest("deleting a strength session cascades exercises and sets", async () => {
  const user = await createTestUser(`strength-${Date.now()}@health-os.test`);
  const prisma = getPrisma();
  const session = await prisma.strengthSession.create({
    data: {
      userId: user.id,
      sessionDate: new Date("2026-07-27T00:00:00.000+09:00"),
      workoutType: "upper",
      exercises: {
        create: [
          {
            exerciseName: "Bench Press",
            exerciseOrder: 1,
            equipmentType: "free_weight",
            sets: {
              create: [{ setOrder: 1, reps: 8, weightValue: 60, weightUnit: "kg" }]
            }
          }
        ]
      }
    },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  });
  const exerciseId = session.exercises[0].id;
  const setId = session.exercises[0].sets[0].id;

  await prisma.strengthSession.delete({ where: { id: session.id } });

  assert.equal(await prisma.strengthExercise.count({ where: { id: exerciseId } }), 0);
  assert.equal(await prisma.strengthSet.count({ where: { id: setId } }), 0);
  await prisma.user.delete({ where: { id: user.id } });
});

dbTest("user-owned queries filter inaccessible records", async () => {
  const prisma = getPrisma();
  const [owner, other] = await Promise.all([
    createTestUser(`owner-${Date.now()}@health-os.test`),
    createTestUser(`other-${Date.now()}@health-os.test`)
  ]);
  const goal = await prisma.goal.create({
    data: {
      userId: owner.id,
      title: "Private Goal",
      module: "running",
      goalType: "running_distance",
      targetValue: 100,
      targetUnit: "km",
      periodStart: new Date("2026-07-27T00:00:00.000+09:00"),
      periodEnd: new Date("2026-08-27T00:00:00.000+09:00")
    }
  });

  assert.equal(await prisma.goal.findFirst({ where: { id: goal.id, userId: other.id } }), null);
  await prisma.user.delete({ where: { id: owner.id } });
  await prisma.user.delete({ where: { id: other.id } });
});
