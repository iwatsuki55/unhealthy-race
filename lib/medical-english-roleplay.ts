export type RoleplayHistoryTurn = {
  patient: string;
  user: string;
};

export type RoleplayReplyInput = {
  lessonTitle: string;
  caseGoal: string;
  currentPatientLine: string;
  userQuestion: string;
  fallbackReply: string;
  checkpoint: string;
  history: RoleplayHistoryTurn[];
};

export type RoleplayReply = {
  patientReply: string;
  coachNote: string;
  source: "ai" | "fallback";
};

export function buildFallbackRoleplayReply(
  input: RoleplayReplyInput,
): RoleplayReply {
  return {
    patientReply: input.fallbackReply,
    coachNote: `${input.checkpoint} を優先して確認できると、次の返答につながりやすくなります。`,
    source: "fallback",
  };
}
