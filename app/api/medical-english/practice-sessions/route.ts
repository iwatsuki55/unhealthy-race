import { NextResponse } from "next/server";
import {
  saveMedicalEnglishPracticeSessionForCurrentUser,
  type PracticeSessionPayload,
} from "@/lib/medical-english-session-server";

export async function POST(request: Request) {
  const body = (await request.json()) as PracticeSessionPayload;

  if (
    !body.lessonSlug ||
    !body.lessonTitle ||
    !body.mode ||
    typeof body.averageScore !== "number"
  ) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_payload",
      },
      { status: 400 },
    );
  }

  const result = await saveMedicalEnglishPracticeSessionForCurrentUser(body);

  if (!result.ok && result.reason === "unauthenticated") {
    return NextResponse.json(
      {
        ok: false,
        reason: "unauthenticated",
      },
      { status: 401 },
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: "database_error",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
