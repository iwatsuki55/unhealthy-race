import type { RunImportDraft, WorkoutImportDraft } from "@/modules/workout-import/domain";
import {
  parseRunImportDraft,
  parseWorkoutImportDraft
} from "@/modules/workout-import/application/workout-extraction-schema";

interface ImageInput {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  order: number;
}

interface OpenAIResponse {
  output_text?: string;
  status?: string;
  error?: {
    code?: string;
    message?: string;
  };
  incomplete_details?: {
    reason?: string;
  };
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

export class WorkoutExtractionProviderError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message);
    this.name = "WorkoutExtractionProviderError";
  }
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

Use the provided source image ids exactly. If a value is unclear, use null with low confidence.
Return only a JSON object. Do not wrap it in markdown.`;

const runPrompt = `You analyze multiple iPhone running screenshots as one running log import.

Extract only information visible in the screenshots. Never invent missing values.
Prioritize Apple Fitness, running app summaries, GPS workout summaries, and route screenshots.
Convert distance to integer meters, duration to total seconds, and pace to seconds per kilometer.
If a value is not visible, use null with low confidence.

Return JSON that matches this TypeScript shape exactly:
{
  "title": field<string>,
  "runDate": field<string>,
  "startTime": field<string>,
  "distanceMeters": field<number>,
  "durationSeconds": field<number>,
  "averagePaceSecondsPerKm": field<number>,
  "averageHeartRate": field<number>,
  "maximumHeartRate": field<number>,
  "cadenceStepsPerMinute": field<number>,
  "calories": field<number>,
  "temperatureCelsius": field<number>,
  "humidityPercent": field<number>,
  "shoes": field<string>,
  "perceivedEffort": field<number>,
  "notes": field<string>,
  "sourceApplication": field<string>
}

field<T> is:
{
  "value": T | null,
  "confidence": "high" | "medium" | "low",
  "sourceImageIds": string[],
  "alternatives"?: T[],
  "conflict"?: boolean
}

Use the provided source image ids exactly. Return only a JSON object. Do not wrap it in markdown.`;

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

async function requestExtraction(images: ImageInput[], extractionPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("WORKOUT_IMPORT_OPENAI_NOT_CONFIGURED");
  }

  const model = process.env.OPENAI_WORKOUT_IMPORT_MODEL ?? "gpt-4.1-mini";
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
              text: `${extractionPrompt}\n\nSource images:\n${imageDescriptions}`
            },
            ...images.map((image) => ({
              type: "input_image",
              image_url: image.dataUrl,
              detail: "high"
            }))
          ]
        }
      ],
      max_output_tokens: 12000,
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  if (!response.ok) {
    throw new WorkoutExtractionProviderError(
      "OpenAI workout extraction request failed.",
      `openai_http_${response.status}`
    );
  }

  const payload = (await response.json()) as OpenAIResponse;

  if (payload.status === "failed") {
    throw new WorkoutExtractionProviderError(
      "OpenAI workout extraction failed.",
      payload.error?.code ?? "openai_response_failed"
    );
  }

  if (payload.status === "incomplete") {
    throw new WorkoutExtractionProviderError(
      "OpenAI workout extraction was incomplete.",
      payload.incomplete_details?.reason ?? "openai_response_incomplete"
    );
  }

  const text = extractResponseText(payload);

  if (!text) {
    throw new WorkoutExtractionProviderError(
      "OpenAI workout extraction returned no text.",
      "openai_empty_response"
    );
  }

  try {
    return JSON.parse(extractJson(text)) as unknown;
  } catch {
    throw new WorkoutExtractionProviderError(
      "OpenAI workout extraction returned invalid JSON.",
      "openai_invalid_extraction_json"
    );
  }
}

export async function extractWorkoutDraftWithOpenAI(
  images: ImageInput[]
): Promise<WorkoutImportDraft> {
  return parseWorkoutImportDraft(await requestExtraction(images, prompt));
}

export async function extractRunDraftWithOpenAI(images: ImageInput[]): Promise<RunImportDraft> {
  return parseRunImportDraft(await requestExtraction(images, runPrompt));
}
