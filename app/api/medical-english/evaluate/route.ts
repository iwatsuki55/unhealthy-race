import { NextResponse } from "next/server";
import {
  buildFallbackEvaluation,
  type EvaluationInput,
  type EvaluationFeedback,
} from "@/lib/medical-english-evaluation";

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
  feedback: Partial<EvaluationFeedback>,
  fallback: EvaluationFeedback,
): EvaluationFeedback {
  return {
    score:
      typeof feedback.score === "number"
        ? Math.min(100, Math.max(0, Math.round(feedback.score)))
        : fallback.score,
    summary:
      typeof feedback.summary === "string" && feedback.summary.trim()
        ? feedback.summary.trim()
        : fallback.summary,
    betterPhrase:
      typeof feedback.betterPhrase === "string" && feedback.betterPhrase.trim()
        ? feedback.betterPhrase.trim()
        : fallback.betterPhrase,
    safetyNote:
      typeof feedback.safetyNote === "string" && feedback.safetyNote.trim()
        ? feedback.safetyNote.trim()
        : fallback.safetyNote,
    source: "ai",
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as EvaluationInput;
  const fallback = buildFallbackEvaluation(body);

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
          "You are evaluating English for medical interview practice. Return only JSON with keys score, summary, betterPhrase, safetyNote. Keep feedback concise, safe, and focused on patient-friendly medical English. Do not mention diagnosis. Score from 0 to 100.",
        input: `Mode: ${body.mode}
Japanese prompt: ${body.promptJa || ""}
Situation: ${body.situation || ""}
User answer: ${body.userAnswer}
Expected answer: ${body.expectedAnswer}
Safer alternative: ${body.safeAlternative || ""}
Priority checkpoint: ${body.checkpoint || ""}

Evaluate whether the user answer is understandable, natural for a medical interview, and safe. Return JSON only.`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const data = (await response.json()) as OpenAIResponseShape;
    const parsed = parseJsonBlock(data.output_text || "");
    const feedback = sanitizeFeedback(parsed, fallback);

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json(fallback);
  }
}
