import type { EntityId } from "@/core/shared";

import type { TodayHomeReadModel } from "./today-read-model";

export interface TodayQuery {
  getToday(userId: EntityId, date: Date): Promise<TodayHomeReadModel>;
}
