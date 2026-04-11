"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRaceInvite } from "@/lib/race-invite-server";
import { getOrCreateCurrentRace } from "@/lib/race-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InviteFormState = {
  error: string | null;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function generateInviteCode(
  _: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const relationshipTypeValue = getStringValue(formData, "relationship_type");
  const relationshipType =
    relationshipTypeValue === "rival" ? "rival" : "friend";
  const currentRace = await getOrCreateCurrentRace(user.id);

  try {
    await createRaceInvite({
      raceId: currentRace.id,
      userId: user.id,
      relationshipType,
    });
  } catch {
    return {
      error: "招待コードの発行に失敗しました。もう一度お試しください。",
    };
  }

  revalidatePath("/home");
  redirect("/home?invite_created=1");
}

export async function joinRaceByInviteCode(
  _: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const inviteCode = getStringValue(formData, "invite_code").toUpperCase();

  if (!inviteCode) {
    return {
      error: "招待コードを入力してください。",
    };
  }

  const { data: invite, error: inviteError } = await supabase
    .from("race_invites")
    .select("id, race_id, created_by, relationship_type, status")
    .eq("code", inviteCode)
    .eq("status", "active")
    .maybeSingle();

  if (inviteError || !invite) {
    return {
      error: "招待コードが見つかりません。入力内容を確認してください。",
    };
  }

  if (invite.created_by === user.id) {
    return {
      error: "自分が発行した招待コードでは参加できません。",
    };
  }

  const { data: existingMembership, error: existingMembershipError } = await supabase
    .from("race_members")
    .select("id")
    .eq("race_id", invite.race_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembershipError) {
    return {
      error: "レース参加に失敗しました。もう一度お試しください。",
    };
  }

  if (!existingMembership) {
    const { error: membershipError } = await supabase.from("race_members").insert({
      race_id: invite.race_id,
      user_id: user.id,
      role: "member",
      relationship_type: invite.relationship_type,
    });

    if (membershipError) {
      return {
        error: "レース参加に失敗しました。もう一度お試しください。",
      };
    }
  }

  revalidatePath("/home");
  revalidatePath("/actions/new");
  revalidatePath("/history");
  redirect("/home?invite_joined=1");
}
