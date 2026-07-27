import type { Prisma } from "@prisma/client";

import type { EntityId } from "@/core/shared";
import type { RouteRepository } from "@/modules/routes/application";
import type {
  CreateRouteInput,
  RouteDto,
  UpdateRouteInput
} from "@/modules/routes/domain/route.schema";
import { prisma } from "@/server/db/prisma";

type PrismaRoute = Prisma.RouteGetPayload<object>;

function toRouteDto(route: PrismaRoute): RouteDto {
  return {
    id: route.id,
    userId: route.userId,
    name: route.name,
    distanceMeters: route.distanceMeters,
    estimatedDurationSeconds: route.estimatedDurationSeconds,
    elevationGainMeters: route.elevationGainMeters,
    description: route.description,
    surfaceType: route.surfaceType,
    difficulty: route.difficulty,
    googleMapsUrl: route.googleMapsUrl,
    isFavorite: route.isFavorite,
    isActive: route.isActive,
    notes: route.notes,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt
  };
}

function optionalToNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

function toCreateData(userId: EntityId, input: CreateRouteInput): Prisma.RouteUncheckedCreateInput {
  return {
    userId,
    name: input.name,
    distanceMeters: input.distanceMeters,
    estimatedDurationSeconds: optionalToNullable(input.estimatedDurationSeconds),
    elevationGainMeters: optionalToNullable(input.elevationGainMeters),
    description: optionalToNullable(input.description),
    surfaceType: input.surfaceType,
    difficulty: input.difficulty,
    googleMapsUrl: optionalToNullable(input.googleMapsUrl),
    isFavorite: input.isFavorite,
    isActive: input.isActive,
    notes: optionalToNullable(input.notes)
  };
}

function toUpdateData(input: UpdateRouteInput): Prisma.RouteUncheckedUpdateInput {
  return {
    ...("name" in input ? { name: input.name } : {}),
    ...("distanceMeters" in input ? { distanceMeters: input.distanceMeters } : {}),
    ...("estimatedDurationSeconds" in input
      ? { estimatedDurationSeconds: optionalToNullable(input.estimatedDurationSeconds) }
      : {}),
    ...("elevationGainMeters" in input
      ? { elevationGainMeters: optionalToNullable(input.elevationGainMeters) }
      : {}),
    ...("description" in input ? { description: optionalToNullable(input.description) } : {}),
    ...("surfaceType" in input ? { surfaceType: input.surfaceType } : {}),
    ...("difficulty" in input ? { difficulty: input.difficulty } : {}),
    ...("googleMapsUrl" in input ? { googleMapsUrl: optionalToNullable(input.googleMapsUrl) } : {}),
    ...("isFavorite" in input ? { isFavorite: input.isFavorite } : {}),
    ...("isActive" in input ? { isActive: input.isActive } : {}),
    ...("notes" in input ? { notes: optionalToNullable(input.notes) } : {})
  };
}

export class PrismaRouteRepository implements RouteRepository {
  async listByUser(userId: EntityId): Promise<RouteDto[]> {
    const routes = await prisma.route.findMany({
      where: {
        userId
      },
      orderBy: [{ isFavorite: "desc" }, { isActive: "desc" }, { name: "asc" }]
    });

    return routes.map(toRouteDto);
  }

  async findById(userId: EntityId, routeId: EntityId): Promise<RouteDto | null> {
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        userId
      }
    });

    return route ? toRouteDto(route) : null;
  }

  async create(userId: EntityId, input: CreateRouteInput): Promise<RouteDto> {
    const route = await prisma.route.create({
      data: toCreateData(userId, input)
    });

    return toRouteDto(route);
  }

  async update(userId: EntityId, routeId: EntityId, input: UpdateRouteInput): Promise<RouteDto> {
    await this.ensureUserOwnsRoute(userId, routeId);

    const route = await prisma.route.update({
      where: {
        id: routeId
      },
      data: toUpdateData(input)
    });

    return toRouteDto(route);
  }

  async delete(userId: EntityId, routeId: EntityId): Promise<void> {
    await this.ensureUserOwnsRoute(userId, routeId);

    await prisma.route.delete({
      where: {
        id: routeId
      }
    });
  }

  private async ensureUserOwnsRoute(userId: EntityId, routeId: EntityId) {
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        userId
      },
      select: {
        id: true
      }
    });

    if (!route) {
      throw new Error("Route not found.");
    }
  }
}

export const routeRepository = new PrismaRouteRepository();
