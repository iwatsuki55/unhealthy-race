import type { EntityId } from "@/core/shared";
import type {
  CreateJournalEntryInput,
  JournalEntryDto,
  UpdateJournalEntryInput
} from "@/modules/journal/domain/journal-entry.schema";

export interface JournalEntryRepository {
  listByUser(userId: EntityId): Promise<JournalEntryDto[]>;
  findLatestByUser(userId: EntityId): Promise<JournalEntryDto | null>;
  findById(userId: EntityId, entryId: EntityId): Promise<JournalEntryDto | null>;
  create(userId: EntityId, input: CreateJournalEntryInput): Promise<JournalEntryDto>;
  update(
    userId: EntityId,
    entryId: EntityId,
    input: UpdateJournalEntryInput
  ): Promise<JournalEntryDto>;
  delete(userId: EntityId, entryId: EntityId): Promise<void>;
}
