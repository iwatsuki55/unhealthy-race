import type { EntityId } from "@/core/shared";
import type {
  CardioSessionDto,
  CreateCardioSessionInput,
  UpdateCardioSessionInput
} from "@/modules/cardio/domain/cardio-session.schema";

export interface CardioSessionRepository {
  listByUser(userId: EntityId): Promise<CardioSessionDto[]>;
  findById(userId: EntityId, sessionId: EntityId): Promise<CardioSessionDto | null>;
  create(userId: EntityId, input: CreateCardioSessionInput): Promise<CardioSessionDto>;
  update(
    userId: EntityId,
    sessionId: EntityId,
    input: UpdateCardioSessionInput
  ): Promise<CardioSessionDto>;
  delete(userId: EntityId, sessionId: EntityId): Promise<void>;
}

export type RunRepository = CardioSessionRepository;
