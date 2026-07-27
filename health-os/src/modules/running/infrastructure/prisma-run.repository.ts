import type { Prisma } from "@prisma/client";

import type { EntityId } from "@/core/shared";
import type { RunRepository } from "@/modules/running/application";
import type { CreateRunInput, RunDto, UpdateRunInput } from "@/modules/running/domain/run.schema";
import { calculateAveragePaceSecondsPerKm } from "@/modules/running/domain";
import { prisma } from "@/server/db/prisma";

type PrismaRun = Prisma.RunGetPayload<object>;

function optionalToNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

function toRunDto(run: PrismaRun): RunDto {
  return {
    id: run.id,
    userId: run.userId,
    routeId: run.routeId,
    runDate: run.runDate,
    startedAt: run.startedAt,
    durationSeconds: run.durationSeconds,
    distanceMeters: run.distanceMeters,
    averagePaceSecondsPerKm: run.averagePaceSecondsPerKm,
    averageHeartRate: run.averageHeartRate,
    maximumHeartRate: run.maximumHeartRate,
    cadenceStepsPerMinute: run.cadenceStepsPerMinute,
    calories: run.calories,
    temperatureCelsius: run.temperatureCelsius,
    humidityPercent: run.humidityPercent,
    shoes: run.shoes,
    screenshotAttachmentRef: run.screenshotAttachmentRef,
    perceivedEffort: run.perceivedEffort,
    notes: run.notes,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt
  };
}

function toDateOnly(dateString: string) {
  return new Date(`${dateString}T00:00:00.000+09:00`);
}

function toOptionalDate(dateTimeString: string | undefined) {
  return dateTimeString ? new Date(dateTimeString) : null;
}

function toCreateData(userId: EntityId, input: CreateRunInput): Prisma.RunUncheckedCreateInput {
  return {
    userId,
    routeId: optionalToNullable(input.routeId),
    runDate: toDateOnly(input.runDate),
    startedAt: toOptionalDate(input.startedAt),
    durationSeconds: input.durationSeconds,
    distanceMeters: input.distanceMeters,
    averagePaceSecondsPerKm: calculateAveragePaceSecondsPerKm(
      input.distanceMeters,
      input.durationSeconds
    ),
    averageHeartRate: optionalToNullable(input.averageHeartRate),
    maximumHeartRate: optionalToNullable(input.maximumHeartRate),
    cadenceStepsPerMinute: optionalToNullable(input.cadenceStepsPerMinute),
    calories: optionalToNullable(input.calories),
    temperatureCelsius: optionalToNullable(input.temperatureCelsius),
    humidityPercent: optionalToNullable(input.humidityPercent),
    shoes: optionalToNullable(input.shoes),
    screenshotAttachmentRef: optionalToNullable(input.screenshotAttachmentRef),
    perceivedEffort: optionalToNullable(input.perceivedEffort),
    notes: optionalToNullable(input.notes)
  };
}

function toUpdateData(input: UpdateRunInput): Prisma.RunUncheckedUpdateInput {
  const nextDistance = input.distanceMeters;
  const nextDuration = input.durationSeconds;

  return {
    ...("routeId" in input ? { routeId: optionalToNullable(input.routeId) } : {}),
    ...("runDate" in input && input.runDate ? { runDate: toDateOnly(input.runDate) } : {}),
    ...("startedAt" in input ? { startedAt: toOptionalDate(input.startedAt) } : {}),
    ...("durationSeconds" in input ? { durationSeconds: input.durationSeconds } : {}),
    ...("distanceMeters" in input ? { distanceMeters: input.distanceMeters } : {}),
    ...(nextDistance && nextDuration
      ? {
          averagePaceSecondsPerKm: calculateAveragePaceSecondsPerKm(nextDistance, nextDuration)
        }
      : {}),
    ...("averageHeartRate" in input
      ? { averageHeartRate: optionalToNullable(input.averageHeartRate) }
      : {}),
    ...("maximumHeartRate" in input
      ? { maximumHeartRate: optionalToNullable(input.maximumHeartRate) }
      : {}),
    ...("cadenceStepsPerMinute" in input
      ? { cadenceStepsPerMinute: optionalToNullable(input.cadenceStepsPerMinute) }
      : {}),
    ...("calories" in input ? { calories: optionalToNullable(input.calories) } : {}),
    ...("temperatureCelsius" in input
      ? { temperatureCelsius: optionalToNullable(input.temperatureCelsius) }
      : {}),
    ...("humidityPercent" in input
      ? { humidityPercent: optionalToNullable(input.humidityPercent) }
      : {}),
    ...("shoes" in input ? { shoes: optionalToNullable(input.shoes) } : {}),
    ...("screenshotAttachmentRef" in input
      ? { screenshotAttachmentRef: optionalToNullable(input.screenshotAttachmentRef) }
      : {}),
    ...("perceivedEffort" in input
      ? { perceivedEffort: optionalToNullable(input.perceivedEffort) }
      : {}),
    ...("notes" in input ? { notes: optionalToNullable(input.notes) } : {})
  };
}

export class PrismaRunRepository implements RunRepository {
  async listByUser(userId: EntityId): Promise<RunDto[]> {
    const runs = await prisma.run.findMany({
      where: {
        userId
      },
      orderBy: [{ runDate: "desc" }, { createdAt: "desc" }]
    });

    return runs.map(toRunDto);
  }

  async findById(userId: EntityId, runId: EntityId): Promise<RunDto | null> {
    const run = await prisma.run.findFirst({
      where: {
        id: runId,
        userId
      }
    });

    return run ? toRunDto(run) : null;
  }

  async create(userId: EntityId, input: CreateRunInput): Promise<RunDto> {
    const run = await prisma.run.create({
      data: toCreateData(userId, input)
    });

    return toRunDto(run);
  }

  async update(userId: EntityId, runId: EntityId, input: UpdateRunInput): Promise<RunDto> {
    const existingRun = await this.ensureUserOwnsRun(userId, runId);
    const updateInput = {
      ...input,
      distanceMeters: input.distanceMeters ?? existingRun.distanceMeters,
      durationSeconds: input.durationSeconds ?? existingRun.durationSeconds
    };

    const run = await prisma.run.update({
      where: {
        id: runId
      },
      data: toUpdateData(updateInput)
    });

    return toRunDto(run);
  }

  async delete(userId: EntityId, runId: EntityId): Promise<void> {
    await this.ensureUserOwnsRun(userId, runId);

    await prisma.run.delete({
      where: {
        id: runId
      }
    });
  }

  private async ensureUserOwnsRun(userId: EntityId, runId: EntityId) {
    const run = await prisma.run.findFirst({
      where: {
        id: runId,
        userId
      },
      select: {
        id: true,
        distanceMeters: true,
        durationSeconds: true
      }
    });

    if (!run) {
      throw new Error("Run not found.");
    }

    return run;
  }
}

export const runRepository = new PrismaRunRepository();
