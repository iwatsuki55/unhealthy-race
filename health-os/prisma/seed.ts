import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ownerEmail = "owner@health-os.local";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production.");
  }

  await prisma.user.deleteMany({
    where: {
      email: ownerEmail
    }
  });

  const user = await prisma.user.create({
    data: {
      email: ownerEmail,
      displayName: "Hidetaka",
      timezone: "Asia/Tokyo",
      unitSystem: "metric"
    }
  });
  const riverLoop = await prisma.route.create({
    data: {
      userId: user.id,
      name: "River Loop",
      distanceMeters: 6200,
      estimatedDurationSeconds: 2400,
      elevationGainMeters: 35,
      surfaceType: "road",
      difficulty: "easy",
      googleMapsUrl: "https://maps.google.com/",
      isFavorite: true,
      isActive: true,
      description: "Easy weekday loop by the river."
    }
  });
  const parkTempo = await prisma.route.create({
    data: {
      userId: user.id,
      name: "Park Tempo",
      distanceMeters: 10000,
      estimatedDurationSeconds: 3300,
      elevationGainMeters: 80,
      surfaceType: "mixed",
      difficulty: "moderate",
      isFavorite: false,
      isActive: true,
      description: "A steady route for longer aerobic work."
    }
  });

  await prisma.run.createMany({
    data: [
      {
        userId: user.id,
        routeId: riverLoop.id,
        runDate: new Date("2026-07-27T00:00:00.000+09:00"),
        startedAt: new Date("2026-07-27T07:15:00.000+09:00"),
        durationSeconds: 2180,
        distanceMeters: 6200,
        averagePaceSecondsPerKm: 352,
        averageHeartRate: 142,
        maximumHeartRate: 165,
        cadenceStepsPerMinute: 172,
        calories: 430,
        temperatureCelsius: 27,
        humidityPercent: 68,
        perceivedEffort: 6,
        notes: "Smooth morning aerobic run."
      },
      {
        userId: user.id,
        routeId: parkTempo.id,
        runDate: new Date("2026-07-24T00:00:00.000+09:00"),
        startedAt: new Date("2026-07-24T18:30:00.000+09:00"),
        durationSeconds: 3180,
        distanceMeters: 10000,
        averagePaceSecondsPerKm: 318,
        averageHeartRate: 154,
        maximumHeartRate: 176,
        cadenceStepsPerMinute: 178,
        calories: 710,
        temperatureCelsius: 29,
        humidityPercent: 72,
        perceivedEffort: 8,
        notes: "Controlled tempo effort."
      },
      {
        userId: user.id,
        routeId: riverLoop.id,
        runDate: new Date("2026-07-22T00:00:00.000+09:00"),
        durationSeconds: 1840,
        distanceMeters: 5000,
        averagePaceSecondsPerKm: 368,
        averageHeartRate: 136,
        perceivedEffort: 5,
        notes: "Short recovery run."
      }
    ]
  });

  await prisma.strengthSession.create({
    data: {
      userId: user.id,
      sessionDate: new Date("2026-07-26T00:00:00.000+09:00"),
      startedAt: new Date("2026-07-26T10:00:00.000+09:00"),
      durationSeconds: 3600,
      workoutType: "upper",
      location: "Gym",
      notes: "Solid upper session.",
      exercises: {
        create: [
          {
            exerciseName: "Bench Press",
            exerciseOrder: 1,
            equipmentType: "free_weight",
            sets: {
              create: [
                { setOrder: 1, reps: 8, weightValue: 60, weightUnit: "kg", perceivedEffort: 7 },
                { setOrder: 2, reps: 8, weightValue: 62.5, weightUnit: "kg", perceivedEffort: 8 }
              ]
            }
          },
          {
            exerciseName: "Lat Pulldown",
            exerciseOrder: 2,
            equipmentType: "machine",
            sets: {
              create: [
                { setOrder: 1, reps: 10, weightValue: 50, weightUnit: "kg", perceivedEffort: 7 },
                { setOrder: 2, reps: 10, weightValue: 55, weightUnit: "kg", perceivedEffort: 8 }
              ]
            }
          }
        ]
      }
    }
  });

  await prisma.strengthSession.create({
    data: {
      userId: user.id,
      sessionDate: new Date("2026-07-23T00:00:00.000+09:00"),
      durationSeconds: 3000,
      workoutType: "lower",
      location: "Gym",
      exercises: {
        create: [
          {
            exerciseName: "Squat",
            exerciseOrder: 1,
            equipmentType: "free_weight",
            sets: {
              create: [
                { setOrder: 1, reps: 5, weightValue: 80, weightUnit: "kg", perceivedEffort: 7 },
                { setOrder: 2, reps: 5, weightValue: 85, weightUnit: "kg", perceivedEffort: 8 }
              ]
            }
          }
        ]
      }
    }
  });

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Run 100 km this block",
        module: "running",
        goalType: "running_distance",
        targetValue: 100,
        targetUnit: "km",
        currentValue: 21.2,
        periodStart: new Date("2026-07-01T00:00:00.000+09:00"),
        periodEnd: new Date("2026-08-31T00:00:00.000+09:00"),
        status: "active"
      },
      {
        userId: user.id,
        title: "Sub-50 10K",
        module: "race",
        goalType: "race_time",
        targetValue: 3000,
        targetUnit: "seconds",
        currentValue: 3180,
        raceDate: new Date("2026-09-15T00:00:00.000+09:00"),
        raceDistanceMeters: 10000,
        raceTargetTimeSeconds: 3000,
        periodStart: new Date("2026-07-01T00:00:00.000+09:00"),
        periodEnd: new Date("2026-09-15T00:00:00.000+09:00"),
        status: "active"
      },
      {
        userId: user.id,
        title: "Build journal consistency",
        module: "health",
        goalType: "custom_health",
        targetValue: 5,
        targetUnit: "entries/week",
        currentValue: 3,
        periodStart: new Date("2026-07-01T00:00:00.000+09:00"),
        periodEnd: new Date("2026-08-01T00:00:00.000+09:00"),
        status: "archived"
      }
    ]
  });

  await prisma.journalEntry.createMany({
    data: [
      {
        userId: user.id,
        entryDate: new Date("2026-07-27T00:00:00.000+09:00"),
        moodRating: 7,
        fatigueRating: 5,
        recoveryRating: 8,
        workStressRating: 6,
        alcoholNote: "None",
        saunaNote: "Two relaxed rounds.",
        tagsJson: JSON.stringify(["recovery", "sauna"]),
        body: "Good energy after sleep. Legs feel a little heavy but manageable."
      },
      {
        userId: user.id,
        entryDate: new Date("2026-07-26T00:00:00.000+09:00"),
        moodRating: 8,
        fatigueRating: 4,
        recoveryRating: 8,
        workStressRating: 4,
        tagsJson: JSON.stringify(["strength"]),
        body: "Upper session felt strong. Shoulder felt normal."
      },
      {
        userId: user.id,
        entryDate: new Date("2026-07-24T00:00:00.000+09:00"),
        moodRating: 6,
        fatigueRating: 7,
        recoveryRating: 5,
        workStressRating: 7,
        alcoholNote: "One beer with dinner.",
        tagsJson: JSON.stringify(["tempo", "stress"]),
        body: "Tempo was productive but work stress was noticeable."
      }
    ]
  });

  console.log("Seeded Health OS development data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
