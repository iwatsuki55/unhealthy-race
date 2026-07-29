import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUserId } from "@/core/application/current-user";
import { createRunInputSchema } from "@/modules/running/domain";
import { runRepository } from "@/modules/running/infrastructure";
import { mapRunImportDraftToRunInput } from "@/modules/workout-import/application/run-draft-mapper";
import { parseRunImportDraft } from "@/modules/workout-import/application/workout-extraction-schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const draft = parseRunImportDraft(body);
    const input = createRunInputSchema.parse(mapRunImportDraftToRunInput(draft));
    const userId = await getCurrentUserId();
    const run = await runRepository.create(userId, input);

    revalidatePath("/running");
    revalidatePath("/today");

    return NextResponse.json({
      runId: run.id,
      redirectTo: `/running/${run.id}`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error:
            "This draft is missing required run fields. Distance and duration are required before saving."
        },
        { status: 400 }
      );
    }

    console.error("Run import save failed");

    return NextResponse.json(
      {
        error: "Health OS could not save this run. Please try again."
      },
      { status: 500 }
    );
  }
}
