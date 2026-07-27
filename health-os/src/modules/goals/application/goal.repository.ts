import type { EntityId } from "@/core/shared";
import type {
  CreateGoalInput,
  GoalDto,
  GoalProgressDto,
  UpdateGoalInput
} from "@/modules/goals/domain/goal.schema";

export interface GoalRepository {
  listByUser(userId: EntityId): Promise<GoalDto[]>;
  listActiveByUser(userId: EntityId): Promise<GoalDto[]>;
  findById(userId: EntityId, goalId: EntityId): Promise<GoalDto | null>;
  create(userId: EntityId, input: CreateGoalInput): Promise<GoalDto>;
  update(userId: EntityId, goalId: EntityId, input: UpdateGoalInput): Promise<GoalDto>;
  delete(userId: EntityId, goalId: EntityId): Promise<void>;
  getProgress(userId: EntityId, goalId: EntityId): Promise<GoalProgressDto | null>;
}
