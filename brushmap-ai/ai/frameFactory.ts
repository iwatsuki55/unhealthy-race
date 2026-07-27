import {
  AISensorFrame,
  FaceMouthObservation,
  BrushZone,
  CameraTelemetry,
  DetectionPoint,
  HandObservation,
} from '../types/brush';

type BuildAISensorFrameInput = {
  timestamp: number;
  elapsedSec: number;
  cameraReady: boolean;
  manualZone?: BrushZone;
  guideZone?: BrushZone;
  source: AISensorFrame['source'];
  cameraTelemetry?: CameraTelemetry;
  handObservations?: HandObservation[];
  faceMouthObservation?: FaceMouthObservation;
};

export function createDefaultCameraTelemetry(
  mode: CameraTelemetry['mode'] = 'web-placeholder',
): CameraTelemetry {
  return {
    isPreviewVisible: true,
    facing: 'front',
    mode,
  };
}

export function buildAISensorFrame({
  timestamp,
  elapsedSec,
  cameraReady,
  manualZone,
  guideZone,
  source,
  cameraTelemetry,
  handObservations,
  faceMouthObservation,
}: BuildAISensorFrameInput): AISensorFrame {
  const camera = cameraTelemetry ?? createDefaultCameraTelemetry();
  const seededPoint = buildSeededPoint(elapsedSec);
  const fallbackHands = cameraReady
    ? [
        {
          handedness: 'right' as const,
          wrist: seededPoint,
          brushTip: {
            x: clamp(seedPointOffset(seededPoint.x, 0.08)),
            y: clamp(seedPointOffset(seededPoint.y, -0.06)),
          },
        },
      ]
    : [];

  return {
    timestamp,
    elapsedSec,
    cameraReady,
    manualZone,
    guideZone,
    source,
    camera,
    detections: {
      // TODO: MediaPipe Handsで手の位置を推定し、brushTip / wristへ反映する。
      hands: handObservations ?? fallbackHands,
      // TODO: Face Detectionで口元位置を推定し、手と口元の相対位置からブラッシング部位を推定する。
      faceMouth: faceMouthObservation
        ?? (cameraReady
          ? {
              mouthCenter: {
                x: 0.5,
                y: 0.38,
              },
              faceBounds: {
                x: 0.22,
                y: 0.08,
                width: 0.56,
                height: 0.58,
              },
            }
          : undefined),
    },
  };
}

function buildSeededPoint(elapsedSec: number): DetectionPoint {
  const wave = Math.sin(elapsedSec / 12);

  return {
    x: clamp(0.44 + wave * 0.12),
    y: clamp(0.62 - wave * 0.1),
  };
}

function seedPointOffset(value: number, delta: number) {
  return value + delta;
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}
