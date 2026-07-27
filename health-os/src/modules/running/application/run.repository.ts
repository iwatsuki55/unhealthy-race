import type { EntityId } from "@/core/shared";
import type { CreateRunInput, RunDto, UpdateRunInput } from "@/modules/running/domain/run.schema";

export interface RunRepository {
  listByUser(userId: EntityId): Promise<RunDto[]>;
  findById(userId: EntityId, runId: EntityId): Promise<RunDto | null>;
  create(userId: EntityId, input: CreateRunInput): Promise<RunDto>;
  update(userId: EntityId, runId: EntityId, input: UpdateRunInput): Promise<RunDto>;
  delete(userId: EntityId, runId: EntityId): Promise<void>;
}
