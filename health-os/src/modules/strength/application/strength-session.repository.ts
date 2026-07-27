import type { EntityId } from "@/core/shared";
import type {
  CreateStrengthSessionInput,
  StrengthSessionDto,
  UpdateStrengthSessionInput
} from "@/modules/strength/domain/strength-session.schema";

export interface StrengthSessionRepository {
  listByUser(userId: EntityId): Promise<StrengthSessionDto[]>;
  findById(userId: EntityId, sessionId: EntityId): Promise<StrengthSessionDto | null>;
  create(userId: EntityId, input: CreateStrengthSessionInput): Promise<StrengthSessionDto>;
  update(
    userId: EntityId,
    sessionId: EntityId,
    input: UpdateStrengthSessionInput
  ): Promise<StrengthSessionDto>;
  delete(userId: EntityId, sessionId: EntityId): Promise<void>;
}
