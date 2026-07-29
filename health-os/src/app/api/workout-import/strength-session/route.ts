import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUserId } from "@/core/application/current-user";
import { createStrengthSessionInputSchema } from "@/modules/strength/domain";
import { strengthSessionRepository } from "@/modules/strength/infrastructure";
import { mapWorkoutImportDraftToStrengthInput } from "@/modules/workout-import/application/strength-draft-mapper";
import { parseWorkoutImportDraft } from "@/modules/workout-import/application/workout-extraction-schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const draft = parseWorkoutImportDraft(body);
    const input = createStrengthSessionInputSchema.parse(
      mapWorkoutImportDraftToStrengthInput(draft)
    );
    const userId = await getCurrentUserId();
    const session = await strengthSessionRepository.create(userId, input);

    revalidatePath("/strength");
    revalidatePath("/today");

    return NextResponse.json({
      sessionId: session.id,
      redirectTo: `/strength/${session.id}`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error:
            "This draft is missing required strength fields. Please review exercise names, reps, and sets before saving."
        },
        { status: 400 }
      );
    }

    console.error("Workout import save failed");

    return NextResponse.json(
      {
        error: "Health OS could not save this workout. Please try again."
      },
      { status: 500 }
    );
  }
}
