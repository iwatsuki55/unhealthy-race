import type { Prisma } from "@prisma/client";

import type { EntityId } from "@/core/shared";
import type { CardioSessionRepository } from "@/modules/cardio/application";
import type {
  CardioSessionDto,
  CreateCardioSessionInput,
  UpdateCardioSessionInput
} from "@/modules/cardio/domain/cardio-session.schema";
import {
  calculateAveragePaceSecondsPerKm,
  dateOnlyStringToUtcDate,
  getCardioActivityConfig
} from "@/modules/cardio/domain";
import { prisma } from "@/server/db/prisma";

type PrismaCardioSession = Prisma.CardioSessionGetPayload<object>;

function optionalToNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

function toCardioSessionDto(session: PrismaCardioSession): CardioSessionDto {
  return {
    id: session.id,
    userId: session.userId,
    routeId: session.routeId,
    activityType: session.activityType,
    runDate: session.runDate,
    startedAt: session.startedAt,
    durationSeconds: session.durationSeconds,
    distanceMeters: session.distanceMeters,
    averagePaceSecondsPerKm: session.averagePaceSecondsPerKm,
    averageHeartRate: session.averageHeartRate,
    maximumHeartRate: session.maximumHeartRate,
    cadenceStepsPerMinute: session.cadenceStepsPerMinute,
    calories: session.calories,
    temperatureCelsius: session.temperatureCelsius,
    humidityPercent: session.humidityPercent,
    shoes: session.shoes,
    screenshotAttachmentRef: session.screenshotAttachmentRef,
    perceivedEffort: session.perceivedEffort,
    notes: session.notes,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  };
}

function toDateOnly(dateString: string, timezone: string) {
  return dateOnlyStringToUtcDate(dateString, timezone);
}

function toOptionalDate(dateTimeString: string | undefined) {
  return dateTimeString ? new Date(dateTimeString) : null;
}

function calculatePaceOrNull(input: {
  activityType: CreateCardioSessionInput["activityType"];
  distanceMeters?: number | null;
  durationSeconds?: number;
}) {
  const distanceMeters = input.distanceMeters;

  if (
    !input.durationSeconds ||
    !distanceMeters ||
    !getCardioActivityConfig(input.activityType).showsPace
  ) {
    return null;
  }

  return calculateAveragePaceSecondsPerKm(distanceMeters, input.durationSeconds);
}

function toCreateData(
  userId: EntityId,
  input: CreateCardioSessionInput,
  timezone: string
): Prisma.CardioSessionUncheckedCreateInput {
  const config = getCardioActivityConfig(input.activityType);
  const routeId = config.supportsRoute ? optionalToNullable(input.routeId) : null;
  const distanceMeters = config.supportsDistance ? optionalToNullable(input.distanceMeters) : null;

  return {
    userId,
    routeId,
    activityType: input.activityType,
    runDate: toDateOnly(input.runDate, timezone),
    startedAt: toOptionalDate(input.startedAt),
    durationSeconds: input.durationSeconds,
    distanceMeters,
    averagePaceSecondsPerKm: calculatePaceOrNull({
      activityType: input.activityType,
      distanceMeters,
      durationSeconds: input.durationSeconds
    }),
    averageHeartRate: optionalToNullable(input.averageHeartRate),
    maximumHeartRate: optionalToNullable(input.maximumHeartRate),
    cadenceStepsPerMinute: config.supportsCadence
      ? optionalToNullable(input.cadenceStepsPerMinute)
      : null,
    calories: optionalToNullable(input.calories),
    temperatureCelsius: optionalToNullable(input.temperatureCelsius),
    humidityPercent: optionalToNullable(input.humidityPercent),
    shoes: optionalToNullable(input.shoes),
    screenshotAttachmentRef: optionalToNullable(input.screenshotAttachmentRef),
    perceivedEffort: optionalToNullable(input.perceivedEffort),
    notes: optionalToNullable(input.notes)
  };
}

function toUpdateData(
  input: UpdateCardioSessionInput,
  timezone: string
): Prisma.CardioSessionUncheckedUpdateInput {
  const activityType = input.activityType ?? "outdoor_run";
  const config = getCardioActivityConfig(activityType);
  const nextDistance = config.supportsDistance ? input.distanceMeters : null;
  const nextDuration = input.durationSeconds;

  return {
    ...("activityType" in input ? { activityType: input.activityType } : {}),
    ...("routeId" in input
      ? { routeId: config.supportsRoute ? optionalToNullable(input.routeId) : null }
      : {}),
    ...("runDate" in input && input.runDate
      ? { runDate: toDateOnly(input.runDate, timezone) }
      : {}),
    ...("startedAt" in input ? { startedAt: toOptionalDate(input.startedAt) } : {}),
    ...("durationSeconds" in input ? { durationSeconds: input.durationSeconds } : {}),
    ...("distanceMeters" in input ? { distanceMeters: nextDistance } : {}),
    ...("activityType" in input || "distanceMeters" in input || "durationSeconds" in input
      ? {
          averagePaceSecondsPerKm: calculatePaceOrNull({
            activityType,
            distanceMeters: nextDistance,
            durationSeconds: nextDuration
          })
        }
      : {}),
    ...("averageHeartRate" in input
      ? { averageHeartRate: optionalToNullable(input.averageHeartRate) }
      : {}),
    ...("maximumHeartRate" in input
      ? { maximumHeartRate: optionalToNullable(input.maximumHeartRate) }
      : {}),
    ...("cadenceStepsPerMinute" in input
      ? {
          cadenceStepsPerMinute: config.supportsCadence
            ? optionalToNullable(input.cadenceStepsPerMinute)
            : null
        }
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

export class PrismaCardioSessionRepository implements CardioSessionRepository {
  async listByUser(userId: EntityId): Promise<CardioSessionDto[]> {
    const sessions = await prisma.cardioSession.findMany({
      where: {
        userId
      },
      orderBy: [{ runDate: "desc" }, { createdAt: "desc" }]
    });

    return sessions.map(toCardioSessionDto);
  }

  async findById(userId: EntityId, sessionId: EntityId): Promise<CardioSessionDto | null> {
    const session = await prisma.cardioSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    return session ? toCardioSessionDto(session) : null;
  }

  async create(userId: EntityId, input: CreateCardioSessionInput): Promise<CardioSessionDto> {
    const timezone = await this.getUserTimezone(userId);
    const session = await prisma.cardioSession.create({
      data: toCreateData(userId, input, timezone)
    });

    return toCardioSessionDto(session);
  }

  async update(
    userId: EntityId,
    sessionId: EntityId,
    input: UpdateCardioSessionInput
  ): Promise<CardioSessionDto> {
    const existingSession = await this.ensureUserOwnsSession(userId, sessionId);
    const timezone = await this.getUserTimezone(userId);
    const updateInput = {
      ...input,
      activityType: input.activityType ?? existingSession.activityType,
      distanceMeters: input.distanceMeters ?? existingSession.distanceMeters ?? undefined,
      durationSeconds: input.durationSeconds ?? existingSession.durationSeconds
    };

    const session = await prisma.cardioSession.update({
      where: {
        id: sessionId
      },
      data: toUpdateData(updateInput, timezone)
    });

    return toCardioSessionDto(session);
  }

  async delete(userId: EntityId, sessionId: EntityId): Promise<void> {
    await this.ensureUserOwnsSession(userId, sessionId);

    await prisma.cardioSession.delete({
      where: {
        id: sessionId
      }
    });
  }

  private async ensureUserOwnsSession(userId: EntityId, sessionId: EntityId) {
    const session = await prisma.cardioSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      select: {
        id: true,
        activityType: true,
        distanceMeters: true,
        durationSeconds: true
      }
    });

    if (!session) {
      throw new Error("Cardio session not found.");
    }

    return session;
  }

  private async getUserTimezone(userId: EntityId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        timezone: true
      }
    });

    return user?.timezone ?? "Asia/Tokyo";
  }
}

export const cardioSessionRepository = new PrismaCardioSessionRepository();
export const runRepository = cardioSessionRepository;
