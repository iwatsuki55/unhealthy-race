import { NextResponse } from "next/server";
import {
  buildFallbackConversationReply,
  type ConversationChatInput,
  type ConversationChatReply,
} from "@/lib/conversation-coach-chat";
import { conversationCoachThemeMap } from "@/lib/conversation-coach-data";

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

function sanitizeReply(
  reply: Partial<ConversationChatReply>,
  fallback: ConversationChatReply,
): ConversationChatReply {
  const normalizedReply =
    typeof reply.aiReply === "string" && reply.aiReply.trim()
      ? reply.aiReply.trim().replace(/\s+/g, " ")
      : fallback.aiReply;

  return {
    aiReply: normalizedReply,
    hint:
      typeof reply.hint === "string" && reply.hint.trim()
        ? reply.hint.trim()
        : fallback.hint,
    source: "ai",
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ConversationChatInput;
  const fallback = buildFallbackConversationReply(body);
  const theme = conversationCoachThemeMap[body.themeSlug];

  if (!theme || !process.env.OPENAI_API_KEY) {
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
          "You are a friendly English conversation partner in a speaking practice app. Return only JSON with keys aiReply and hint. aiReply must be one short, natural English message that directly responds to the learner's latest message before adding at most one small follow-up. Stay consistent with the current topic and do not suddenly switch scenes or introduce unrelated details. Keep the tone warm, low-pressure, and natural for a real chat. hint must be one short Japanese coaching sentence that helps the learner continue without heavy correction. If the learner's English is awkward or unclear, do not ignore it and jump ahead. Instead, make a kind best-effort guess about their meaning and ask a simple clarification question that keeps the conversation connected.",
        input: `Theme: ${theme.title}
Scene: ${theme.scene}
Tone: ${theme.tone}
Coach goal: ${theme.coachGoal}
Suggested topics: ${theme.suggestedTopics.join(", ")}
Current AI line: ${body.currentAiLine}
Learner reply: ${body.userMessage}
Conversation so far:
${body.history
  .map((turn, index) => `${index + 1}. AI: ${turn.ai}\n   Learner: ${turn.user}`)
  .join("\n") || "No previous turns."}

Rules for aiReply:
- First, react to the learner's latest message.
- Keep the same topic unless the learner clearly changes it.
- Use no more than 2 short sentences.
- If the learner asked a question, answer it directly.
- If the learner gave only a short answer, gently invite one more detail.
- If the learner's sentence sounds unnatural but the intent is guessable, respond to the likely intent and add a short clarifying question.
- If the learner's sentence is hard to understand, say so gently and ask one simple clarifying question instead of changing the topic.
- Do not act like a teacher or evaluator.

Rules for hint:
- One short Japanese sentence.
- Suggest one easy way to continue the conversation.
- If the learner's English was unclear, suggest a simpler way to ask the same thing.
- Do not mention grammar scores or detailed corrections.

Return JSON only.`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const data = (await response.json()) as OpenAIResponseShape;
    const parsed = parseJsonBlock(data.output_text || "");
    return NextResponse.json(sanitizeReply(parsed, fallback));
  } catch {
    return NextResponse.json(fallback);
  }
}
