import type { Prisma } from "@prisma/client";

import type { EntityId } from "@/core/shared";
import type { JournalEntryRepository } from "@/modules/journal/application";
import type {
  CreateJournalEntryInput,
  JournalEntryDto,
  UpdateJournalEntryInput
} from "@/modules/journal/domain";
import { prisma } from "@/server/db/prisma";

function optionalToNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

function toDateOnly(dateString: string) {
  return new Date(`${dateString}T00:00:00.000+09:00`);
}

function parseTags(tagsJson: string | null) {
  if (!tagsJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(tagsJson);

    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function stringifyTags(tags: string[] | undefined) {
  return tags && tags.length > 0 ? JSON.stringify(tags) : null;
}

function toJournalEntryDto(entry: Prisma.JournalEntryGetPayload<object>): JournalEntryDto {
  return {
    id: entry.id,
    userId: entry.userId,
    entryDate: entry.entryDate,
    moodRating: entry.moodRating,
    fatigueRating: entry.fatigueRating,
    recoveryRating: entry.recoveryRating,
    workStressRating: entry.workStressRating,
    alcoholNote: entry.alcoholNote,
    saunaNote: entry.saunaNote,
    tags: parseTags(entry.tagsJson),
    body: entry.body,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

function toCreateData(
  userId: EntityId,
  input: CreateJournalEntryInput
): Prisma.JournalEntryUncheckedCreateInput {
  return {
    userId,
    entryDate: toDateOnly(input.entryDate),
    moodRating: optionalToNullable(input.moodRating),
    fatigueRating: optionalToNullable(input.fatigueRating),
    recoveryRating: optionalToNullable(input.recoveryRating),
    workStressRating: optionalToNullable(input.workStressRating),
    alcoholNote: optionalToNullable(input.alcoholNote),
    saunaNote: optionalToNullable(input.saunaNote),
    tagsJson: stringifyTags(input.tags),
    body: input.body
  };
}

export class PrismaJournalEntryRepository implements JournalEntryRepository {
  async listByUser(userId: EntityId): Promise<JournalEntryDto[]> {
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId
      },
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }]
    });

    return entries.map(toJournalEntryDto);
  }

  async findLatestByUser(userId: EntityId): Promise<JournalEntryDto | null> {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        userId
      },
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }]
    });

    return entry ? toJournalEntryDto(entry) : null;
  }

  async findById(userId: EntityId, entryId: EntityId): Promise<JournalEntryDto | null> {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId
      }
    });

    return entry ? toJournalEntryDto(entry) : null;
  }

  async create(userId: EntityId, input: CreateJournalEntryInput): Promise<JournalEntryDto> {
    const entry = await prisma.journalEntry.create({
      data: toCreateData(userId, input)
    });

    return toJournalEntryDto(entry);
  }

  async update(
    userId: EntityId,
    entryId: EntityId,
    input: UpdateJournalEntryInput
  ): Promise<JournalEntryDto> {
    await this.ensureUserOwnsEntry(userId, entryId);

    const entry = await prisma.journalEntry.update({
      where: {
        id: entryId
      },
      data: {
        ...("entryDate" in input && input.entryDate
          ? { entryDate: toDateOnly(input.entryDate) }
          : {}),
        ...("moodRating" in input ? { moodRating: optionalToNullable(input.moodRating) } : {}),
        ...("fatigueRating" in input
          ? { fatigueRating: optionalToNullable(input.fatigueRating) }
          : {}),
        ...("recoveryRating" in input
          ? { recoveryRating: optionalToNullable(input.recoveryRating) }
          : {}),
        ...("workStressRating" in input
          ? { workStressRating: optionalToNullable(input.workStressRating) }
          : {}),
        ...("alcoholNote" in input ? { alcoholNote: optionalToNullable(input.alcoholNote) } : {}),
        ...("saunaNote" in input ? { saunaNote: optionalToNullable(input.saunaNote) } : {}),
        ...("tags" in input ? { tagsJson: stringifyTags(input.tags) } : {}),
        ...("body" in input ? { body: input.body } : {})
      }
    });

    return toJournalEntryDto(entry);
  }

  async delete(userId: EntityId, entryId: EntityId): Promise<void> {
    await this.ensureUserOwnsEntry(userId, entryId);

    await prisma.journalEntry.delete({
      where: {
        id: entryId
      }
    });
  }

  private async ensureUserOwnsEntry(userId: EntityId, entryId: EntityId) {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId
      },
      select: {
        id: true
      }
    });

    if (!entry) {
      throw new Error("Journal entry not found.");
    }
  }
}

export const journalEntryRepository = new PrismaJournalEntryRepository();
