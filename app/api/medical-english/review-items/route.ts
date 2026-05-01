import { NextResponse } from "next/server";
import type { PrototypeReviewItem } from "@/lib/medical-english-data";
import {
  getMedicalEnglishReviewItemsForCurrentUser,
  saveMedicalEnglishReviewItemsForCurrentUser,
} from "@/lib/medical-english-review-server";

export async function GET() {
  const { user, items } = await getMedicalEnglishReviewItemsForCurrentUser();

  return NextResponse.json({
    authenticated: Boolean(user),
    items,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    items?: PrototypeReviewItem[];
  };
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_payload",
      },
      { status: 400 },
    );
  }

  const result = await saveMedicalEnglishReviewItemsForCurrentUser(items);

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
