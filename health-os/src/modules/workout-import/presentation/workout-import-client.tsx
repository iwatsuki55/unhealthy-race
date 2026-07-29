"use client";

import { ArrowDown, ArrowUp, Eye, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  addImagesToImportSession,
  attachDraftToImportSession,
  createImportSession,
  getMockExtractionWarnings,
  markSessionAnalyzing,
  mockExtractWorkoutDraft,
  moveImportedImage,
  removeImportedImage,
  reorderImportedImages
} from "@/modules/workout-import/application";
import type {
  ImportedImage,
  WorkoutImportDraft,
  WorkoutImportSession
} from "@/modules/workout-import/domain";

const maxImages = 10;
const storageKey = "health-os.workout-import.stage-1";
const acceptedImageTypes = "image/heic,image/heif,image/jpeg,image/png,image/webp";

interface StoredImportSession extends Omit<WorkoutImportSession, "images"> {
  images: Array<Omit<ImportedImage, "previewUrl">>;
}

function createBrowserSession(): WorkoutImportSession {
  return createImportSession({
    id: crypto.randomUUID(),
    now: new Date(),
    userId: "browser-stage-1-user"
  });
}

function toStoredSession(session: WorkoutImportSession): StoredImportSession {
  return {
    ...session,
    images: session.images.map((image) => ({
      id: image.id,
      fileName: image.fileName,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      originalOrder: image.originalOrder,
      currentOrder: image.currentOrder,
      duplicateKey: image.duplicateKey,
      sourceApplication: image.sourceApplication
    }))
  };
}

function fromStoredSession(session: StoredImportSession): WorkoutImportSession {
  return {
    ...session,
    images: session.images.map((image) => ({
      ...image,
      previewUrl: undefined
    }))
  };
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const className =
    confidence === "low"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : confidence === "medium"
        ? "border-sky-300 bg-sky-50 text-sky-900"
        : "border-border bg-muted text-muted-foreground";

  return <span className={`rounded-md border px-2 py-1 text-xs ${className}`}>{confidence}</span>;
}

function FieldRow({
  label,
  value,
  confidence
}: {
  label: string;
  value: number | string | null;
  confidence: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-muted-foreground">
      <span className="flex items-center justify-between gap-2">
        {label}
        <ConfidenceBadge confidence={confidence} />
      </span>
      <input
        className="h-11 rounded-md border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
        defaultValue={value ?? ""}
        placeholder="Not detected"
      />
    </label>
  );
}

function DraftReview({ draft }: { draft: WorkoutImportDraft }) {
  return (
    <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Review draft</p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal">Workout Import Draft</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldRow label="Title" value={draft.title.value} confidence={draft.title.confidence} />
        <FieldRow
          label="Workout date"
          value={draft.workoutDate.value}
          confidence={draft.workoutDate.confidence}
        />
        <FieldRow
          label="Start time"
          value={draft.startTime.value}
          confidence={draft.startTime.confidence}
        />
        <FieldRow
          label="Duration"
          value={draft.durationSeconds.value}
          confidence={draft.durationSeconds.confidence}
        />
        <FieldRow
          label="Workout type"
          value={draft.workoutType.value}
          confidence={draft.workoutType.confidence}
        />
        <FieldRow
          label="Calories"
          value={draft.calories.value}
          confidence={draft.calories.confidence}
        />
        <FieldRow
          label="Total volume"
          value={draft.totalVolume.value}
          confidence={draft.totalVolume.confidence}
        />
        <FieldRow
          label="PR count"
          value={draft.prCount.value}
          confidence={draft.prCount.confidence}
        />
      </div>

      <div className="grid gap-4">
        {draft.exercises.map((exercise) => (
          <div className="rounded-lg border border-border bg-background p-4" key={exercise.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold tracking-normal">
                {exercise.order}. {exercise.exerciseName.value ?? "Unnamed exercise"}
              </h3>
              <ConfidenceBadge confidence={exercise.exerciseName.confidence} />
            </div>
            <div className="mt-4 grid gap-3">
              {exercise.sets.map((set) => (
                <div
                  className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-3"
                  key={set.setNumber}
                >
                  <span className="text-sm font-semibold text-muted-foreground">
                    Set {set.setNumber}
                  </span>
                  <FieldRow
                    label="Weight"
                    value={set.weightValue.value}
                    confidence={set.weightValue.confidence}
                  />
                  <FieldRow label="Reps" value={set.reps.value} confidence={set.reps.confidence} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline">
                Add set
              </Button>
              <Button type="button" variant="outline">
                Remove exercise
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-3 rounded-lg border border-border bg-card p-3 shadow-sm">
        <Button className="w-full" disabled type="button">
          Save to Strength will be enabled in Stage 3
        </Button>
      </div>
    </section>
  );
}

export function WorkoutImportClient() {
  const [session, setSession] = useState<WorkoutImportSession>(() => {
    if (typeof window === "undefined") {
      return createBrowserSession();
    }

    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return createBrowserSession();
    }

    try {
      return fromStoredSession(JSON.parse(stored) as StoredImportSession);
    } catch {
      window.localStorage.removeItem(storageKey);
      return createBrowserSession();
    }
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewerImage, setViewerImage] = useState<ImportedImage | null>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [pasteMessage, setPasteMessage] = useState(
    "Tap here, then paste screenshots from the clipboard."
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(toStoredSession(session)));
  }, [session]);

  useEffect(() => {
    if (session.status === "review_required") {
      draftRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [session.status]);

  const remainingSlots = maxImages - session.images.length;
  const canAnalyze = session.images.length > 0 && session.status !== "analyzing";
  const orderedImageIds = useMemo(() => session.images.map((image) => image.id), [session.images]);

  function handleFiles(files: FileList | File[], source: "picker" | "paste" | "drop" = "picker") {
    const imageFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name))
      .slice(0, Math.max(remainingSlots, 0));

    if (imageFiles.length === 0) {
      if (source === "paste") {
        setPasteMessage("No image was found in the pasted content.");
      }
      return;
    }

    setUploadProgress(10);
    const images = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type || "image/heic",
      size: file.size,
      lastModified: file.lastModified,
      previewUrl: URL.createObjectURL(file)
    }));

    setUploadProgress(70);
    setSession((current) => addImagesToImportSession(current, images));
    if (source === "paste") {
      setPasteMessage(
        `${imageFiles.length} pasted screenshot${imageFiles.length === 1 ? "" : "s"} added.`
      );
    }
    setUploadProgress(100);
    window.setTimeout(() => setUploadProgress(0), 700);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files, "drop");
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const filesFromList = Array.from(event.clipboardData.files);
    const filesFromItems = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));
    const files = filesFromList.length > 0 ? filesFromList : filesFromItems;

    if (files.length > 0) {
      event.preventDefault();
    }

    handleFiles(files, "paste");
  }

  function analyze() {
    setSession((current) => markSessionAnalyzing(current));
    window.setTimeout(() => {
      setSession((current) =>
        attachDraftToImportSession(
          current,
          mockExtractWorkoutDraft(current.images),
          getMockExtractionWarnings(current.images)
        )
      );
    }, 700);
  }

  function reorderByDrag(targetImageId: string) {
    if (!draggedImageId || draggedImageId === targetImageId) {
      return;
    }

    const nextIds = orderedImageIds.filter((imageId) => imageId !== draggedImageId);
    const targetIndex = nextIds.indexOf(targetImageId);
    nextIds.splice(targetIndex, 0, draggedImageId);
    setSession((current) => reorderImportedImages(current, nextIds));
  }

  return (
    <div className="grid gap-7">
      <section
        className="grid gap-5 rounded-lg border border-dashed border-border bg-card p-4 sm:p-6"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="grid gap-2">
          <p className="text-sm font-medium text-muted-foreground">Stage 1 import session</p>
          <h2 className="text-xl font-semibold tracking-normal">Upload workout screenshots</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Select up to 10 screenshots. Images stay in this browser session for Stage 1 and are not
            analyzed by AI yet.
          </p>
        </div>

        <input
          accept={acceptedImageTypes}
          className="sr-only"
          multiple
          ref={inputRef}
          type="file"
          onChange={(event) => {
            if (event.currentTarget.files) {
              handleFiles(event.currentTarget.files);
              event.currentTarget.value = "";
            }
          }}
        />

        <div className="flex flex-wrap gap-3">
          <Button className="h-12" type="button" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Select screenshots
          </Button>
          <Button
            className="h-12"
            disabled={remainingSlots <= 0}
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Add more
          </Button>
          <Button
            className="h-12"
            type="button"
            variant="outline"
            onClick={() => pasteRef.current?.focus()}
          >
            Paste screenshots
          </Button>
        </div>

        <div
          aria-label="Paste screenshots here"
          className="min-h-20 rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          contentEditable
          ref={pasteRef}
          role="textbox"
          suppressContentEditableWarning
          tabIndex={0}
          onInput={(event) => {
            event.currentTarget.textContent = "";
          }}
          onPaste={handlePaste}
        >
          {pasteMessage}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {session.images.length} / {maxImages} images
            </span>
            <span>Status: {session.status}</span>
          </div>
          {uploadProgress > 0 ? (
            <div className="h-2 overflow-hidden rounded-full bg-muted" aria-label="Upload progress">
              <div className="h-full bg-primary" style={{ width: `${uploadProgress}%` }} />
            </div>
          ) : null}
        </div>
      </section>

      {session.images.length > 0 ? (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-normal">Review image order</h2>
            <Button disabled={!canAnalyze} type="button" onClick={analyze}>
              {session.status === "analyzing" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {session.status === "analyzing" ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-4" aria-live="polite">
            {session.status === "analyzing" ? (
              <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                Creating a review draft from {session.images.length} screenshots...
              </div>
            ) : session.status === "review_required" ? (
              <p className="text-sm font-medium text-foreground">
                Draft ready. Review the extracted workout below before saving.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tap Analyze to create a mock review draft for this import session.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {session.images.map((image, index) => (
              <article
                className="grid gap-3 rounded-lg border border-border bg-card p-3"
                draggable
                key={image.id}
                onDragStart={() => setDraggedImageId(image.id)}
                onDragEnd={() => setDraggedImageId(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  reorderByDrag(image.id);
                }}
                onDragOver={(event) => event.preventDefault()}
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-md border border-border bg-muted">
                  {image.previewUrl ? (
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      src={image.previewUrl}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-sm text-muted-foreground">
                      Preview unavailable after browser refresh
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="truncate text-sm font-semibold tracking-normal">
                    {image.fileName}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Original #{image.originalOrder} · Current #{image.currentOrder}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={index === 0}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSession((current) => moveImportedImage(current, image.id, "up"))
                    }
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    Up
                  </Button>
                  <Button
                    disabled={index === session.images.length - 1}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSession((current) => moveImportedImage(current, image.id, "down"))
                    }
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    Down
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setViewerImage(image)}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setSession((current) => removeImportedImage(current, image.id))}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {session.validationWarnings.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <h2 className="font-semibold tracking-normal">Review notes</h2>
          <ul className="mt-2 list-disc pl-5">
            {session.validationWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {session.extractionResult ? (
        <section ref={draftRef}>
          <DraftReview draft={session.extractionResult} />
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
        <h2 className="font-semibold tracking-normal text-foreground">Image retention policy</h2>
        <p className="mt-2">
          Stage 1 keeps screenshots only in this browser session for preview. Original images are
          not saved to the Health OS database. Future stages should retain originals only when
          explicitly requested by the user.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/strength/new">Switch to manual entry</Link>
        </Button>
      </section>

      {viewerImage ? (
        <div className="fixed inset-0 z-50 grid bg-background p-4" role="dialog" aria-modal="true">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="truncate text-base font-semibold tracking-normal">
              {viewerImage.fileName}
            </h2>
            <Button type="button" onClick={() => setViewerImage(null)}>
              Close
            </Button>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted">
            {viewerImage.previewUrl ? (
              <Image
                alt=""
                className="object-contain"
                fill
                src={viewerImage.previewUrl}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Preview unavailable after browser refresh
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
