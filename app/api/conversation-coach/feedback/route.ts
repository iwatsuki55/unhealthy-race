import { NextResponse } from "next/server";
import {
  buildFallbackConversationFeedback,
  type ConversationFeedback,
  type ConversationFeedbackInput,
} from "@/lib/conversation-coach-feedback";

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

function sanitizeFeedback(
  feedback: Partial<ConversationFeedback>,
  fallback: ConversationFeedback,
): ConversationFeedback {
  return {
    summary:
      typeof feedback.summary === "string" && feedback.summary.trim()
        ? feedback.summary.trim()
        : fallback.summary,
    goodPoint:
      typeof feedback.goodPoint === "string" && feedback.goodPoint.trim()
        ? feedback.goodPoint.trim()
        : fallback.goodPoint,
    betterAlternative:
      typeof feedback.betterAlternative === "string" &&
      feedback.betterAlternative.trim()
        ? feedback.betterAlternative.trim()
        : fallback.betterAlternative,
    nextPhrase:
      typeof feedback.nextPhrase === "string" && feedback.nextPhrase.trim()
        ? feedback.nextPhrase.trim()
        : fallback.nextPhrase,
    reviewReason:
      typeof feedback.reviewReason === "string" && feedback.reviewReason.trim()
        ? feedback.reviewReason.trim()
        : fallback.reviewReason,
    source: "ai",
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ConversationFeedbackInput;
  const fallback = buildFallbackConversationFeedback(body);

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
          "You are a speaking coach for a daily English conversation app. Return only JSON with keys summary, goodPoint, betterAlternative, nextPhrase, reviewReason. Keep every field concise. summary, goodPoint, betterAlternative, and reviewReason should be in Japanese. nextPhrase should be in natural English. Focus on helping the learner keep conversations going, not on strict grammar grading.",
        input: `Theme: ${body.themeTitle}
Conversation:
${body.history
  .map((turn, index) => `${index + 1}. AI: ${turn.ai}\n   Learner: ${turn.user}`)
  .join("\n")}

Return short, encouraging feedback with one practical next phrase. Return JSON only.`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const data = (await response.json()) as OpenAIResponseShape;
    const parsed = parseJsonBlock(data.output_text || "");
    return NextResponse.json(sanitizeFeedback(parsed, fallback));
  } catch {
    return NextResponse.json(fallback);
  }
}
