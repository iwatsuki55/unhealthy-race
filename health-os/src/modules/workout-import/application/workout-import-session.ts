import type {
  ImportedImage,
  WorkoutImportDraft,
  WorkoutImportSession
} from "@/modules/workout-import/domain";

export interface ImportableImageFile {
  id?: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  previewUrl?: string;
}

export function buildDuplicateKey(
  file: Pick<ImportableImageFile, "lastModified" | "name" | "size">
) {
  return [file.name.toLowerCase(), file.size, file.lastModified].join(":");
}

export function createImportSession({
  id,
  now,
  userId
}: {
  id: string;
  now: Date;
  userId: string;
}): WorkoutImportSession {
  return {
    id,
    userId,
    status: "uploading",
    createdAt: now.toISOString(),
    images: [],
    detectedSourceApplications: [],
    extractionResult: null,
    validationWarnings: []
  };
}

export function addImagesToImportSession(
  session: WorkoutImportSession,
  files: ImportableImageFile[]
): WorkoutImportSession {
  const existingKeys = new Set(session.images.map((image) => image.duplicateKey));
  const nextImages: ImportedImage[] = [];

  files.forEach((file) => {
    const duplicateKey = buildDuplicateKey(file);

    if (existingKeys.has(duplicateKey)) {
      return;
    }

    existingKeys.add(duplicateKey);
    nextImages.push({
      id: file.id ?? duplicateKey,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      originalOrder: session.images.length + nextImages.length + 1,
      currentOrder: session.images.length + nextImages.length + 1,
      duplicateKey,
      previewUrl: file.previewUrl
    });
  });

  const images = [...session.images, ...nextImages];

  return {
    ...session,
    status: images.length > 0 ? "ready" : "uploading",
    images: normalizeImageOrder(images)
  };
}

export function removeImportedImage(session: WorkoutImportSession, imageId: string) {
  const images = session.images.filter((image) => image.id !== imageId);

  return {
    ...session,
    status: images.length > 0 ? session.status : "uploading",
    images: normalizeImageOrder(images)
  };
}

export function moveImportedImage(
  session: WorkoutImportSession,
  imageId: string,
  direction: "up" | "down"
) {
  const currentIndex = session.images.findIndex((image) => image.id === imageId);

  if (currentIndex === -1) {
    return session;
  }

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= session.images.length) {
    return session;
  }

  const images = [...session.images];
  const [image] = images.splice(currentIndex, 1);
  images.splice(nextIndex, 0, image);

  return {
    ...session,
    images: normalizeImageOrder(images)
  };
}

export function reorderImportedImages(session: WorkoutImportSession, orderedImageIds: string[]) {
  const imageById = new Map(session.images.map((image) => [image.id, image]));
  const orderedImages = orderedImageIds
    .map((imageId) => imageById.get(imageId))
    .filter((image): image is ImportedImage => Boolean(image));
  const missingImages = session.images.filter((image) => !orderedImageIds.includes(image.id));

  return {
    ...session,
    images: normalizeImageOrder([...orderedImages, ...missingImages])
  };
}

export function markSessionAnalyzing(session: WorkoutImportSession): WorkoutImportSession {
  return {
    ...session,
    status: "analyzing"
  };
}

export function attachDraftToImportSession(
  session: WorkoutImportSession,
  draft: WorkoutImportDraft,
  warnings: string[]
): WorkoutImportSession {
  return {
    ...session,
    status: "review_required",
    extractionResult: draft,
    validationWarnings: warnings,
    detectedSourceApplications: Array.from(
      new Set(session.images.map((image) => image.sourceApplication).filter(Boolean) as string[])
    )
  };
}

function normalizeImageOrder(images: ImportedImage[]) {
  return images.map((image, index) => ({
    ...image,
    currentOrder: index + 1
  }));
}
