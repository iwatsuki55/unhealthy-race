interface WorkoutImageFile {
  name: string;
  type: string;
}

const supportedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const mimeTypeByExtension: Record<string, string> = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

export function isHeicWorkoutImage(file: WorkoutImageFile) {
  return /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export function getSupportedWorkoutImageMimeType(file: WorkoutImageFile) {
  const declaredType = file.type.toLowerCase();

  if (supportedMimeTypes.has(declaredType)) {
    return declaredType;
  }

  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];

  return extension ? mimeTypeByExtension[extension] : undefined;
}
