import type { Prisma } from "@prisma/client";

import type { EntityId } from "@/core/shared";
import type { StrengthSessionRepository } from "@/modules/strength/application";
import type {
  CreateStrengthSessionInput,
  StrengthSessionDto,
  UpdateStrengthSessionInput
} from "@/modules/strength/domain";
import { prisma } from "@/server/db/prisma";

type PrismaStrengthSession = Prisma.StrengthSessionGetPayload<{
  include: {
    exercises: {
      include: {
        sets: true;
      };
    };
  };
}>;

function optionalToNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

function toDateOnly(dateString: string) {
  return new Date(`${dateString}T00:00:00.000+09:00`);
}

function toOptionalDate(dateTimeString: string | undefined) {
  return dateTimeString ? new Date(dateTimeString) : null;
}

function toStrengthSessionDto(session: PrismaStrengthSession): StrengthSessionDto {
  return {
    id: session.id,
    userId: session.userId,
    sessionDate: session.sessionDate,
    startedAt: session.startedAt,
    durationSeconds: session.durationSeconds,
    workoutType: session.workoutType,
    location: session.location,
    notes: session.notes,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    exercises: session.exercises
      .toSorted((a, b) => a.exerciseOrder - b.exerciseOrder)
      .map((exercise) => ({
        id: exercise.id,
        sessionId: exercise.sessionId,
        exerciseName: exercise.exerciseName,
        exerciseOrder: exercise.exerciseOrder,
        equipmentType: exercise.equipmentType,
        notes: exercise.notes,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
        sets: exercise.sets
          .toSorted((a, b) => a.setOrder - b.setOrder)
          .map((set) => ({
            id: set.id,
            exerciseId: set.exerciseId,
            setOrder: set.setOrder,
            reps: set.reps,
            weightValue: set.weightValue,
            weightUnit: set.weightUnit,
            restSeconds: set.restSeconds,
            perceivedEffort: set.perceivedEffort,
            notes: set.notes,
            createdAt: set.createdAt,
            updatedAt: set.updatedAt
          }))
      }))
  };
}

function toSessionCreateData(
  userId: EntityId,
  input: CreateStrengthSessionInput
): Prisma.StrengthSessionUncheckedCreateInput {
  return {
    userId,
    sessionDate: toDateOnly(input.sessionDate),
    startedAt: toOptionalDate(input.startedAt),
    durationSeconds: optionalToNullable(input.durationSeconds),
    workoutType: input.workoutType,
    location: optionalToNullable(input.location),
    notes: optionalToNullable(input.notes),
    exercises: {
      create: input.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        exerciseOrder: exercise.exerciseOrder,
        equipmentType: exercise.equipmentType,
        notes: optionalToNullable(exercise.notes),
        sets: {
          create: exercise.sets.map((set) => ({
            setOrder: set.setOrder,
            reps: set.reps,
            weightValue: optionalToNullable(set.weightValue),
            weightUnit: set.weightUnit,
            restSeconds: optionalToNullable(set.restSeconds),
            perceivedEffort: optionalToNullable(set.perceivedEffort),
            notes: optionalToNullable(set.notes)
          }))
        }
      }))
    }
  };
}

export class PrismaStrengthSessionRepository implements StrengthSessionRepository {
  async listByUser(userId: EntityId): Promise<StrengthSessionDto[]> {
    const sessions = await prisma.strengthSession.findMany({
      where: {
        userId
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      },
      orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }]
    });

    return sessions.map(toStrengthSessionDto);
  }

  async findById(userId: EntityId, sessionId: EntityId): Promise<StrengthSessionDto | null> {
    const session = await prisma.strengthSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });

    return session ? toStrengthSessionDto(session) : null;
  }

  async create(userId: EntityId, input: CreateStrengthSessionInput): Promise<StrengthSessionDto> {
    const session = await prisma.strengthSession.create({
      data: toSessionCreateData(userId, input),
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });

    return toStrengthSessionDto(session);
  }

  async update(
    userId: EntityId,
    sessionId: EntityId,
    input: UpdateStrengthSessionInput
  ): Promise<StrengthSessionDto> {
    await this.ensureUserOwnsSession(userId, sessionId);

    const session = await prisma.$transaction(async (tx) => {
      if (input.exercises) {
        await tx.strengthExercise.deleteMany({
          where: {
            sessionId
          }
        });
      }

      return tx.strengthSession.update({
        where: {
          id: sessionId
        },
        data: {
          ...("sessionDate" in input && input.sessionDate
            ? { sessionDate: toDateOnly(input.sessionDate) }
            : {}),
          ...("startedAt" in input ? { startedAt: toOptionalDate(input.startedAt) } : {}),
          ...("durationSeconds" in input
            ? { durationSeconds: optionalToNullable(input.durationSeconds) }
            : {}),
          ...("workoutType" in input ? { workoutType: input.workoutType } : {}),
          ...("location" in input ? { location: optionalToNullable(input.location) } : {}),
          ...("notes" in input ? { notes: optionalToNullable(input.notes) } : {}),
          ...(input.exercises
            ? {
                exercises: {
                  create: input.exercises.map((exercise) => ({
                    exerciseName: exercise.exerciseName,
                    exerciseOrder: exercise.exerciseOrder,
                    equipmentType: exercise.equipmentType,
                    notes: optionalToNullable(exercise.notes),
                    sets: {
                      create: exercise.sets.map((set) => ({
                        setOrder: set.setOrder,
                        reps: set.reps,
                        weightValue: optionalToNullable(set.weightValue),
                        weightUnit: set.weightUnit,
                        restSeconds: optionalToNullable(set.restSeconds),
                        perceivedEffort: optionalToNullable(set.perceivedEffort),
                        notes: optionalToNullable(set.notes)
                      }))
                    }
                  }))
                }
              }
            : {})
        },
        include: {
          exercises: {
            include: {
              sets: true
            }
          }
        }
      });
    });

    return toStrengthSessionDto(session);
  }

  async delete(userId: EntityId, sessionId: EntityId): Promise<void> {
    await this.ensureUserOwnsSession(userId, sessionId);

    await prisma.strengthSession.delete({
      where: {
        id: sessionId
      }
    });
  }

  private async ensureUserOwnsSession(userId: EntityId, sessionId: EntityId) {
    const session = await prisma.strengthSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      select: {
        id: true
      }
    });

    if (!session) {
      throw new Error("Strength session not found.");
    }
  }
}

export const strengthSessionRepository = new PrismaStrengthSessionRepository();
