import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RaceMemberRow = {
  user_id: string;
  relationship_type: "self" | "friend" | "rival";
};

type RaceMembershipWithRace = {
  race_id: string;
  races:
    | {
        id: string;
        name: string;
        status: "active" | "archived";
        end_at: string | null;
      }
    | {
        id: string;
        name: string;
        status: "active" | "archived";
        end_at: string | null;
      }[]
    | null;
};

function toSingleRace(race: RaceMembershipWithRace["races"]) {
  if (!race) {
    return null;
  }

  return Array.isArray(race) ? race[0] ?? null : race;
}

async function fetchRaceStandings(raceId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: members, error: membersError }, { data: logs, error: logsError }] =
    await Promise.all([
      supabase.from("race_members").select("user_id, relationship_type").eq("race_id", raceId),
      supabase.from("action_logs").select("user_id, point_value").eq("race_id", raceId),
    ]);

  if (membersError || logsError) {
    throw membersError || logsError;
  }

  const memberRows = (members ?? []) as RaceMemberRow[];
  const userIds = memberRows.map((member) => member.user_id);
  const { data: profiles } =
    userIds.length === 0
      ? { data: [] }
      : await supabase.from("profiles").select("id, nickname").in("id", userIds);

  const pointMap = new Map<string, number>();
  for (const log of logs ?? []) {
    pointMap.set(log.user_id, (pointMap.get(log.user_id) ?? 0) + log.point_value);
  }

  const nicknameMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.nickname]),
  );

  return memberRows
    .map((member) => {
      const totalPoints = Math.max(0, pointMap.get(member.user_id) ?? 0);

      return {
        userId: member.user_id,
        nickname: nicknameMap.get(member.user_id) ?? "名無しユーザー",
        relationshipType: member.relationship_type,
        totalPoints,
      };
    })
    .sort((left, right) => right.totalPoints - left.totalPoints);
}

export const getRaceMemberSummaries = cache(async (raceId: string) => {
  return fetchRaceStandings(raceId);
});

export const getLatestArchivedRaceResult = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("race_members")
    .select("race_id, races(id, name, status, end_at)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const latestArchivedRace = ((data ?? []) as RaceMembershipWithRace[])
    .map((membership) => toSingleRace(membership.races))
    .filter((race): race is NonNullable<typeof race> => Boolean(race))
    .filter((race) => race.status === "archived")
    .sort((left, right) => {
      const leftTime = left.end_at ? new Date(left.end_at).getTime() : 0;
      const rightTime = right.end_at ? new Date(right.end_at).getTime() : 0;
      return rightTime - leftTime;
    })[0];

  if (!latestArchivedRace) {
    return null;
  }

  const standings = await fetchRaceStandings(latestArchivedRace.id);
  const yourIndex = standings.findIndex((member) => member.userId === userId);
  const yourStanding = yourIndex >= 0 ? standings[yourIndex] : null;
  const winner = standings[0] ?? null;

  if (!winner || !yourStanding) {
    return null;
  }

  return {
    raceName: latestArchivedRace.name,
    endedAt: latestArchivedRace.end_at,
    winner,
    yourStanding,
    yourRank: yourIndex + 1,
    participantCount: standings.length,
    gapFromWinner: Math.max(0, winner.totalPoints - yourStanding.totalPoints),
  };
});
