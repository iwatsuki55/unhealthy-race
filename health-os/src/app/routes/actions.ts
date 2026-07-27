"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUserId } from "@/core/application/current-user";
import { durationInputToSeconds, kilometersInputToMeters } from "@/lib/format";
import { routeFormSchema } from "@/modules/routes/domain";
import { shouldDeactivateRouteOnDelete } from "@/modules/routes/domain/route-deletion-policy";
import { routeRepository } from "@/modules/routes/infrastructure";
import { runRepository } from "@/modules/running/infrastructure";

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function parseRouteFormData(formData: FormData) {
  return routeFormSchema.parse({
    name: formData.get("name"),
    distanceMeters: kilometersInputToMeters(formData.get("distanceKm")),
    estimatedDurationSeconds: durationInputToSeconds(formData.get("estimatedDuration")),
    elevationGainMeters: formData.get("elevationGainMeters"),
    description: formData.get("description"),
    surfaceType: formData.get("surfaceType"),
    difficulty: formData.get("difficulty"),
    googleMapsUrl: formData.get("googleMapsUrl"),
    isFavorite: getBoolean(formData, "isFavorite"),
    isActive: getBoolean(formData, "isActive"),
    notes: formData.get("notes")
  });
}

export async function createRouteAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const input = parseRouteFormData(formData);
  const route = await routeRepository.create(userId, input);

  revalidatePath("/routes");
  redirect(`/routes/${route.id}`);
}

export async function updateRouteAction(routeId: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const input = parseRouteFormData(formData);
  const route = await routeRepository.update(userId, routeId, input);

  revalidatePath("/routes");
  revalidatePath(`/routes/${route.id}`);
  redirect(`/routes/${route.id}`);
}

export async function deleteRouteAction(routeId: string) {
  const userId = await getCurrentUserId();
  const runs = await runRepository.listByUser(userId);

  if (shouldDeactivateRouteOnDelete(routeId, runs)) {
    await routeRepository.update(userId, routeId, { isActive: false });
  } else {
    await routeRepository.delete(userId, routeId);
  }

  revalidatePath("/routes");
  revalidatePath(`/routes/${routeId}`);
  revalidatePath("/running");
  revalidatePath("/today");
  redirect("/routes");
}
