import { NextResponse } from "next/server";
import {
  buildFallbackRoleplayReply,
  type RoleplayReply,
  type RoleplayReplyInput,
} from "@/lib/medical-english-roleplay";

type OpenAIResponseShape = {
  output_text?: string;
};

function parseJsonBlock(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

function sanitizeRoleplayReply(
  reply: Partial<RoleplayReply>,
  fallback: RoleplayReply,
): RoleplayReply {
  return {
    patientReply:
      typeof reply.patientReply === "string" && reply.patientReply.trim()
        ? reply.patientReply.trim()
        : fallback.patientReply,
    coachNote:
      typeof reply.coachNote === "string" && reply.coachNote.trim()
        ? reply.coachNote.trim()
        : fallback.coachNote,
    source: "ai",
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as RoleplayReplyInput;
  const fallback = buildFallbackRoleplayReply(body);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(fallback);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        instructions:
          "You are playing a patient in a medical English learning app. Return only JSON with keys patientReply and coachNote. patientReply should be one short, natural patient response in plain English. coachNote should be one short Japanese sentence for the learner about what their question did well or what to ask next. Do not provide diagnosis, treatment, or emergency instructions.",
        input: `Lesson: ${body.lessonTitle}
Case goal: ${body.caseGoal}
Current patient line: ${body.currentPatientLine}
Learner question: ${body.userQuestion}
Priority checkpoint: ${body.checkpoint}
Fallback reply: ${body.fallbackReply}
Conversation so far:
${body.history
  .map((turn, index) => `${index + 1}. Patient: ${turn.patient}\n   Learner: ${turn.user}`)
  .join("\n") || "No previous turns."}

Answer as the patient consistently with the case. Keep it short and realistic. Return JSON only.`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const data = (await response.json()) as OpenAIResponseShape;
    const parsed = parseJsonBlock(data.output_text || "");
    const reply = sanitizeRoleplayReply(parsed, fallback);

    return NextResponse.json(reply);
  } catch {
    return NextResponse.json(fallback);
  }
}
