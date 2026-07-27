import type { EntityId } from "@/core/shared/domain-primitives";

import type { UpsertUserInput, UserDto } from "./user.schema";

export interface UserRepository {
  findById(id: EntityId): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
  upsert(input: UpsertUserInput): Promise<UserDto>;
}
