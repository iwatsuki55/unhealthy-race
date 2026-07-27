import {
  FaceDetectionBounds,
  FaceDetectionResult,
  FaceMouthObservation,
} from '../../types/brush';

export function mapFaceDetectionToObservation(
  detection?: FaceDetectionResult,
): FaceMouthObservation | undefined {
  if (!detection) {
    return undefined;
  }

  const faceBounds = normalizeBounds(detection.bounds);
  const mouthCenter = detection.mouthCenter ?? inferMouthCenter(faceBounds);

  return {
    mouthCenter: {
      x: clamp(mouthCenter.x),
      y: clamp(mouthCenter.y),
    },
    faceBounds,
  };
}

function inferMouthCenter(bounds: FaceDetectionBounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height * 0.72,
  };
}

function normalizeBounds(bounds: FaceDetectionBounds) {
  return {
    x: clamp(bounds.x),
    y: clamp(bounds.y),
    width: clampSize(bounds.width),
    height: clampSize(bounds.height),
  };
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function clampSize(value: number) {
  return Math.min(Math.max(value, 0), 1);
}
