import type { EntityId } from "@/core/shared";

import type { TodayHomeReadModel, TodayUserContext } from "./today-read-model";

export interface TodayQuery {
  getToday(user: TodayUserContext & { id: EntityId }, date: Date): Promise<TodayHomeReadModel>;
}
