import type { WorkoutImportDraft } from "@/modules/workout-import/domain";
import { parseWorkoutImportDraft } from "@/modules/workout-import/application/workout-extraction-schema";

interface ImageInput {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  order: number;
}

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

const prompt = `You analyze multiple iPhone workout screenshots as one strength workout import.

Extract only information visible in the screenshots. Never invent missing values.
Merge repeated or overlapping exercise rows across screenshots. Deduplicate repeated headers and duplicated sets.
Prefer strength app screenshots for exercises, weights, reps, sets, and PR badges.
Prefer Apple Fitness summaries for duration and calories.

Return JSON that matches this TypeScript shape exactly:
{
  "title": field<string>,
  "workoutDate": field<string>,
  "startTime": field<string>,
  "durationSeconds": field<number>,
  "workoutType": field<string>,
  "calories": field<number>,
  "totalVolume": field<number>,
  "prCount": field<number>,
  "notes": field<string>,
  "sourceApplication": field<string>,
  "exercises": [{
    "id": string,
    "exerciseName": field<string>,
    "equipmentType": field<"machine" | "free_weight" | "bodyweight" | null>,
    "order": number,
    "sets": [{
      "setNumber": number,
      "weightValue": field<number>,
      "reps": field<number>,
      "durationSeconds"?: field<number>,
      "distanceMeters"?: field<number>,
      "pr"?: field<boolean>
    }]
  }]
}

field<T> is:
{
  "value": T | null,
  "confidence": "high" | "medium" | "low",
  "sourceImageIds": string[],
  "alternatives"?: T[],
  "conflict"?: boolean
}

Use the provided source image ids exactly. If a value is unclear, use null with low confidence.`;

function extractResponseText(response: OpenAIResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => Boolean(text))
      .join("\n") ?? ""
  );
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);

  if (fenced?.[1]) {
    return fenced[1];
  }

  return trimmed;
}

export async function extractWorkoutDraftWithOpenAI(
  images: ImageInput[]
): Promise<WorkoutImportDraft> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("WORKOUT_IMPORT_OPENAI_NOT_CONFIGURED");
  }

  const model = process.env.OPENAI_WORKOUT_IMPORT_MODEL ?? "gpt-5-mini";
  const imageDescriptions = images
    .map(
      (image) =>
        `Image ${image.order}: id=${image.id}, fileName=${image.fileName}, mimeType=${image.mimeType}`
    )
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${prompt}\n\nSource images:\n${imageDescriptions}`
            },
            ...images.map((image) => ({
              type: "input_image",
              image_url: image.dataUrl,
              detail: "high"
            }))
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("WORKOUT_IMPORT_OPENAI_REQUEST_FAILED");
  }

  const payload = (await response.json()) as OpenAIResponse;
  const text = extractResponseText(payload);

  if (!text) {
    throw new Error("WORKOUT_IMPORT_EMPTY_RESPONSE");
  }

  return parseWorkoutImportDraft(JSON.parse(extractJson(text)));
}
