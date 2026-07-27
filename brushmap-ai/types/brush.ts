export type BrushZone =
  | 'upperRight'
  | 'upperFront'
  | 'upperLeft'
  | 'lowerRight'
  | 'lowerFront'
  | 'lowerLeft';

export type BrushEvent = {
  zone: BrushZone;
  timestamp: number;
};

export type ZoneDurations = Record<BrushZone, number>;

export type BrushSession = {
  id: string;
  startedAt: string;
  durationSec: number;
  events: BrushEvent[];
  zoneDurations: ZoneDurations;
  aiPredictions: AIPredictionRecord[];
};

export type ScreenName =
  | 'home'
  | 'brushing'
  | 'result'
  | 'history'
  | 'historyDetail';

export type ZoneOption = {
  value: BrushZone;
  label: string;
};

export type GuideSegment = {
  label: string;
  zone: BrushZone;
  startSec: number;
  endSec: number;
};

export type WeeklySummary = {
  title: string;
  sessionCount: number;
  totalDurationSec: number;
  averageDurationSec: number;
  zoneTotals: ZoneDurations;
  comment: string;
  streakDays: number;
  weekdayCounts: {
    label: string;
    count: number;
  }[];
};

export type BrushGoals = {
  dailySessionsTarget: number;
  targetDurationSec: number;
};

export type ReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type BrushBadge = {
  id: string;
  label: string;
  description: string;
};

export type AIProviderId =
  | 'manual-only'
  | 'mock-motion-v1'
  | 'mediapipe-hands-future'
  | 'face-mouth-future'
  | 'watch-motion-future'
  | 'etoothbrush-ble-future';

export type CameraFacing = 'front' | 'back';

export type CameraTelemetry = {
  isPreviewVisible: boolean;
  facing: CameraFacing;
  mode: 'web-placeholder' | 'native-preview';
  previewWidth?: number;
  previewHeight?: number;
};

export type DetectionPoint = {
  x: number;
  y: number;
};

export type FaceMouthObservation = {
  mouthCenter: DetectionPoint;
  faceBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type FaceDetectionBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FaceDetectionResult = {
  bounds: FaceDetectionBounds;
  mouthCenter?: DetectionPoint;
};

export type HandObservation = {
  handedness: 'left' | 'right' | 'unknown';
  brushTip?: DetectionPoint;
  wrist?: DetectionPoint;
};

export type MediaPipeHandLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type MediaPipeHandResult = {
  handedness?: 'Left' | 'Right';
  landmarks: MediaPipeHandLandmark[];
};

export type AISensorFrame = {
  timestamp: number;
  elapsedSec: number;
  cameraReady: boolean;
  manualZone?: BrushZone;
  guideZone?: BrushZone;
  source: 'manual-tap' | 'camera-polling';
  camera: CameraTelemetry;
  detections: {
    hands: HandObservation[];
    faceMouth?: FaceMouthObservation;
  };
};

export type ZoneConfidence = {
  zone: BrushZone;
  confidence: number;
};

export type AIZonePrediction = {
  primaryZone?: BrushZone;
  confidences: ZoneConfidence[];
  reasoning: string;
  source: AIProviderId;
};

export type AIProviderStatus = 'idle' | 'warming' | 'ready' | 'predicting' | 'unavailable';

export type AIProviderDescriptor = {
  id: AIProviderId;
  label: string;
  description: string;
  status: AIProviderStatus;
  capabilities: string[];
};

export type AISessionState = {
  provider: AIProviderDescriptor;
  latestPrediction: AIZonePrediction | null;
  latestAcceptedZone?: BrushZone;
  predictionCount: number;
  lastUpdatedAt?: number;
};

export type AIPredictionRecord = {
  timestamp: number;
  elapsedSec: number;
  providerId: AIProviderId;
  cameraReady: boolean;
  source: AISensorFrame['source'];
  manualZone?: BrushZone;
  predictedZone?: BrushZone;
  reasoning: string;
  confidences: ZoneConfidence[];
};
