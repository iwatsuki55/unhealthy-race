import type { Prisma } from "@prisma/client";

import type { EntityId } from "@/core/shared";
import type { GoalRepository } from "@/modules/goals/application";
import type {
  CreateGoalInput,
  GoalDto,
  GoalProgressDto,
  UpdateGoalInput
} from "@/modules/goals/domain";
import { prisma } from "@/server/db/prisma";

function optionalToNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

function toDateOnly(dateString: string) {
  return new Date(`${dateString}T00:00:00.000+09:00`);
}

function toOptionalDateOnly(dateString: string | undefined) {
  return dateString ? toDateOnly(dateString) : null;
}

function toGoalDto(goal: Prisma.GoalGetPayload<object>): GoalDto {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    module: goal.module,
    goalType: goal.goalType,
    targetValue: goal.targetValue,
    targetUnit: goal.targetUnit,
    currentValue: goal.currentValue,
    raceDate: goal.raceDate,
    raceDistanceMeters: goal.raceDistanceMeters,
    raceTargetTimeSeconds: goal.raceTargetTimeSeconds,
    periodStart: goal.periodStart,
    periodEnd: goal.periodEnd,
    status: goal.status,
    notes: goal.notes,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt
  };
}

function toCreateData(userId: EntityId, input: CreateGoalInput): Prisma.GoalUncheckedCreateInput {
  return {
    userId,
    title: input.title,
    module: input.module,
    goalType: input.goalType,
    targetValue: input.targetValue,
    targetUnit: input.targetUnit,
    currentValue: optionalToNullable(input.currentValue),
    raceDate: toOptionalDateOnly(input.raceDate),
    raceDistanceMeters: optionalToNullable(input.raceDistanceMeters),
    raceTargetTimeSeconds: optionalToNullable(input.raceTargetTimeSeconds),
    periodStart: toDateOnly(input.periodStart),
    periodEnd: toDateOnly(input.periodEnd),
    status: input.status,
    notes: optionalToNullable(input.notes)
  };
}

function toProgress(goal: GoalDto): GoalProgressDto {
  return {
    goalId: goal.id,
    currentValue: goal.currentValue,
    targetValue: goal.targetValue,
    progressRatio: goal.currentValue === null ? null : goal.currentValue / goal.targetValue
  };
}

export class PrismaGoalRepository implements GoalRepository {
  async listByUser(userId: EntityId): Promise<GoalDto[]> {
    const goals = await prisma.goal.findMany({
      where: {
        userId
      },
      orderBy: [{ status: "asc" }, { periodEnd: "asc" }, { createdAt: "desc" }]
    });

    return goals.map(toGoalDto);
  }

  async listActiveByUser(userId: EntityId): Promise<GoalDto[]> {
    const goals = await prisma.goal.findMany({
      where: {
        userId,
        status: "active"
      },
      orderBy: [{ periodEnd: "asc" }, { createdAt: "desc" }]
    });

    return goals.map(toGoalDto);
  }

  async findById(userId: EntityId, goalId: EntityId): Promise<GoalDto | null> {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId
      }
    });

    return goal ? toGoalDto(goal) : null;
  }

  async create(userId: EntityId, input: CreateGoalInput): Promise<GoalDto> {
    const goal = await prisma.goal.create({
      data: toCreateData(userId, input)
    });

    return toGoalDto(goal);
  }

  async update(userId: EntityId, goalId: EntityId, input: UpdateGoalInput): Promise<GoalDto> {
    await this.ensureUserOwnsGoal(userId, goalId);

    const goal = await prisma.goal.update({
      where: {
        id: goalId
      },
      data: {
        ...("title" in input ? { title: input.title } : {}),
        ...("module" in input ? { module: input.module } : {}),
        ...("goalType" in input ? { goalType: input.goalType } : {}),
        ...("targetValue" in input ? { targetValue: input.targetValue } : {}),
        ...("targetUnit" in input ? { targetUnit: input.targetUnit } : {}),
        ...("currentValue" in input
          ? { currentValue: optionalToNullable(input.currentValue) }
          : {}),
        ...("raceDate" in input ? { raceDate: toOptionalDateOnly(input.raceDate) } : {}),
        ...("raceDistanceMeters" in input
          ? { raceDistanceMeters: optionalToNullable(input.raceDistanceMeters) }
          : {}),
        ...("raceTargetTimeSeconds" in input
          ? { raceTargetTimeSeconds: optionalToNullable(input.raceTargetTimeSeconds) }
          : {}),
        ...("periodStart" in input && input.periodStart
          ? { periodStart: toDateOnly(input.periodStart) }
          : {}),
        ...("periodEnd" in input && input.periodEnd
          ? { periodEnd: toDateOnly(input.periodEnd) }
          : {}),
        ...("status" in input ? { status: input.status } : {}),
        ...("notes" in input ? { notes: optionalToNullable(input.notes) } : {})
      }
    });

    return toGoalDto(goal);
  }

  async delete(userId: EntityId, goalId: EntityId): Promise<void> {
    await this.ensureUserOwnsGoal(userId, goalId);

    await prisma.goal.delete({
      where: {
        id: goalId
      }
    });
  }

  async getProgress(userId: EntityId, goalId: EntityId): Promise<GoalProgressDto | null> {
    const goal = await this.findById(userId, goalId);

    return goal ? toProgress(goal) : null;
  }

  private async ensureUserOwnsGoal(userId: EntityId, goalId: EntityId) {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId
      },
      select: {
        id: true
      }
    });

    if (!goal) {
      throw new Error("Goal not found.");
    }
  }
}

export const goalRepository = new PrismaGoalRepository();
