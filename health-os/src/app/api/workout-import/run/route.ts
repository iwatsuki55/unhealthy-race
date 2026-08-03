import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUserId } from "@/core/application/current-user";
import { createCardioSessionInputSchema } from "@/modules/cardio/domain";
import { cardioSessionRepository } from "@/modules/cardio/infrastructure";
import { mapRunImportDraftToRunInput } from "@/modules/workout-import/application/run-draft-mapper";
import { parseRunImportDraft } from "@/modules/workout-import/application/workout-extraction-schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const draft = parseRunImportDraft(body);
    const input = createCardioSessionInputSchema.parse(mapRunImportDraftToRunInput(draft));
    const userId = await getCurrentUserId();
    const session = await cardioSessionRepository.create(userId, input);

    revalidatePath("/cardio");
    revalidatePath("/today");

    return NextResponse.json({
      cardioSessionId: session.id,
      runId: session.id,
      redirectTo: `/cardio/${session.id}`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error:
            "This draft is missing required cardio fields. Distance and duration are required for run-style cardio before saving."
        },
        { status: 400 }
      );
    }

    console.error("Cardio import save failed");

    return NextResponse.json(
      {
        error: "Health OS could not save this cardio session. Please try again."
      },
      { status: 500 }
    );
  }
}
