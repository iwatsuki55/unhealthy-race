import { NextResponse } from "next/server";

import {
  extractRunDraftWithOpenAI,
  WorkoutExtractionProviderError
} from "@/modules/workout-import/infrastructure/openai-workout-extraction-provider";

const maxImages = 10;
const maxImageBytes = 8 * 1024 * 1024;

function isSupportedImage(file: File) {
  return file.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name);
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/png";

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function POST(request: Request) {
  let imageCount = 0;
  let totalBytes = 0;

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File)
      .slice(0, maxImages);
    imageCount = files.length;
    totalBytes = files.reduce((total, file) => total + file.size, 0);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Add at least one screenshot before analysis." },
        { status: 400 }
      );
    }

    const invalidFile = files.find((file) => !isSupportedImage(file) || file.size > maxImageBytes);

    if (invalidFile) {
      return NextResponse.json(
        { error: "One screenshot could not be analyzed. Use an image under 8 MB." },
        { status: 400 }
      );
    }

    const images = await Promise.all(
      files.map(async (file, index) => ({
        id: formData.get(`imageId:${index}`)?.toString() ?? `image-${index + 1}`,
        fileName: file.name,
        mimeType: file.type || "image/png",
        dataUrl: await fileToDataUrl(file),
        order: index + 1
      }))
    );

    const draft = await extractRunDraftWithOpenAI(images);

    return NextResponse.json({
      draft,
      warnings: [
        "This running draft was extracted from screenshots. Review all fields before saving.",
        "Distance and duration are required before Health OS can save a run."
      ]
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WORKOUT_IMPORT_OPENAI_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Run analysis is not configured yet. Set OPENAI_API_KEY on the server and try again."
        },
        { status: 503 }
      );
    }

    console.error("Run import analysis failed", {
      code: error instanceof WorkoutExtractionProviderError ? error.code : "run_analysis_failed",
      imageCount,
      totalBytes
    });

    return NextResponse.json(
      {
        error:
          "Health OS could not extract a clean run draft from these screenshots. Please retry once, or remove blurry/cropped screenshots."
      },
      { status: 502 }
    );
  }
}
