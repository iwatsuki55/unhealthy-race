import type { EntityId } from "@/core/shared";
import type {
  CreateRouteInput,
  RouteDto,
  UpdateRouteInput
} from "@/modules/routes/domain/route.schema";

export interface RouteRepository {
  listByUser(userId: EntityId): Promise<RouteDto[]>;
  findById(userId: EntityId, routeId: EntityId): Promise<RouteDto | null>;
  create(userId: EntityId, input: CreateRouteInput): Promise<RouteDto>;
  update(userId: EntityId, routeId: EntityId, input: UpdateRouteInput): Promise<RouteDto>;
  delete(userId: EntityId, routeId: EntityId): Promise<void>;
}
