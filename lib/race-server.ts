import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentRace = {
  id: string;
  name: string;
  status: "active" | "archived";
  start_at: string | null;
  end_at: string | null;
  relationship_type: "self" | "friend" | "rival";
};

type RaceMemberRow = {
  race_id: string;
  relationship_type: "self" | "friend" | "rival";
  races:
    | {
        id: string;
        name: string;
        status: "active" | "archived";
        start_at: string | null;
        end_at: string | null;
      }
    | {
        id: string;
        name: string;
        status: "active" | "archived";
        start_at: string | null;
        end_at: string | null;
      }[]
    | null;
};

function toRaceValue(
  race: RaceMemberRow["races"],
): {
  id: string;
  name: string;
  status: "active" | "archived";
  start_at: string | null;
  end_at: string | null;
} | null {
  if (!race) {
    return null;
  }

  return Array.isArray(race) ? race[0] ?? null : race;
}

function calculateRaceEndAt(startAt: string, durationDays: number) {
  const end = new Date(startAt);
  end.setDate(end.getDate() + Math.max(1, durationDays) - 1);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

async function createPersonalRace(userId: string) {
  const supabase = await createSupabaseServerClient();
  const raceId = crypto.randomUUID();
  const startAt = new Date().toISOString();
  const endAt = calculateRaceEndAt(startAt, 7);
  const { error: raceError } = await supabase.from("races").insert({
    id: raceId,
    name: "個人レース",
    status: "active",
    created_by: userId,
    start_at: startAt,
    end_at: endAt,
  });

  if (raceError) {
    throw raceError;
  }

  const { error: memberError } = await supabase.from("race_members").insert({
    race_id: raceId,
    user_id: userId,
    role: "owner",
    relationship_type: "self",
  });

  if (memberError) {
    throw memberError;
  }

  return {
    id: raceId,
    name: "個人レース",
    status: "active" as const,
    start_at: startAt,
    end_at: endAt,
    relationship_type: "self" as const,
  };
}

export async function createRaceForUser({
  userId,
  name,
  archiveCurrent = false,
  durationDays = 7,
}: {
  userId: string;
  name: string;
  archiveCurrent?: boolean;
  durationDays?: number;
}) {
  const supabase = await createSupabaseServerClient();

  if (archiveCurrent) {
    const { data: memberships } = await supabase
      .from("race_members")
      .select("race_id, relationship_type, races(id, status, created_by)")
      .eq("user_id", userId);

    const activeRaceIds = (memberships ?? [])
      .map((membership) => {
        const race = Array.isArray(membership.races)
          ? membership.races[0]
          : membership.races;
        return race?.status === "active" &&
          membership.relationship_type === "self" &&
          race.created_by === userId
          ? membership.race_id
          : null;
      })
      .filter((value): value is string => Boolean(value));

    if (activeRaceIds.length > 0) {
      await supabase
        .from("races")
        .update({ status: "archived", end_at: new Date().toISOString() })
        .in("id", activeRaceIds);
    }
  }

  const raceId = crypto.randomUUID();
  const startAt = new Date().toISOString();
  const endAt = calculateRaceEndAt(startAt, durationDays);
  const { error: raceError } = await supabase.from("races").insert({
    id: raceId,
    name,
    status: "active",
    created_by: userId,
    start_at: startAt,
    end_at: endAt,
  });

  if (raceError) {
    throw raceError;
  }

  const { error: memberError } = await supabase.from("race_members").insert({
    race_id: raceId,
    user_id: userId,
    role: "owner",
    relationship_type: "self",
  });

  if (memberError) {
    throw memberError;
  }

  return {
    id: raceId,
    name,
    status: "active" as const,
    start_at: startAt,
    end_at: endAt,
    relationship_type: "self" as const,
  };
}

export const getOrCreateCurrentRace = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("race_members")
    .select("race_id, relationship_type, races(id, name, status, start_at, end_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const activeRace = ((data ?? []) as RaceMemberRow[])
    .map((row) => ({
      relationship_type: row.relationship_type,
      race: toRaceValue(row.races),
    }))
    .find((row) => row.race?.status === "active");

  if (activeRace?.race) {
    return {
      id: activeRace.race.id,
      name: activeRace.race.name,
      status: activeRace.race.status,
      start_at: activeRace.race.start_at,
      end_at: activeRace.race.end_at,
      relationship_type: activeRace.relationship_type,
    };
  }

  return createPersonalRace(userId);
});
