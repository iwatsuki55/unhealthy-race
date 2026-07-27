import type { EntityId, Timestamped, UnitSystem } from "@/core/shared/domain-primitives";

export interface User extends Timestamped {
  id: EntityId;
  email: string;
  displayName: string;
  timezone: string;
  unitSystem: UnitSystem;
}
