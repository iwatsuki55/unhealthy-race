import { BrushAIProvider } from '../provider';
import { AISensorFrame, AIZonePrediction, BrushZone } from '../../types/brush';
import { estimateZoneFromDetections } from '../rules/zoneEstimation';

const PROVIDER_ID = 'mock-motion-v1';

const scriptedZones: BrushZone[] = [
  'upperRight',
  'upperLeft',
  'lowerRight',
  'lowerLeft',
];

export const mockMotionProvider: BrushAIProvider = {
  descriptor: {
    id: PROVIDER_ID,
    label: 'Mock Motion v1',
    description: 'AI本実装前の予測パイプライン確認用プロバイダです。',
    status: 'ready',
    capabilities: ['prediction-pipeline', 'manual-handoff', 'future-sensor-slot'],
  },
  async predict(frame: AISensorFrame): Promise<AIZonePrediction | null> {
    if (!frame.cameraReady) {
      return {
        primaryZone: frame.manualZone,
        confidences: frame.manualZone
          ? [{ zone: frame.manualZone, confidence: 0.95 }]
          : [],
        reasoning: 'カメラ未準備のため、手動入力を優先しています。',
        source: PROVIDER_ID,
      };
    }

    const detectionEstimate = estimateZoneFromDetections(frame);
    const index = Math.min(Math.floor(frame.elapsedSec / 30), scriptedZones.length - 1);
    const guideZone = scriptedZones[index] ?? 'lowerLeft';
    const primaryZone = frame.manualZone ?? detectionEstimate.primaryZone ?? guideZone;

    return {
      primaryZone,
      confidences:
        frame.manualZone || detectionEstimate.confidences.length === 0
          ? buildConfidences(primaryZone)
          : detectionEstimate.confidences,
      reasoning: frame.manualZone
        ? '手動入力を教師ラベル候補として保持しています。'
        : detectionEstimate.primaryZone
          ? detectionEstimate.reasoning
          : '現在はガイド部位ベースの疑似予測を返しています。',
      source: PROVIDER_ID,
    };
  },
};

function buildConfidences(primaryZone: BrushZone) {
  const allZones: BrushZone[] = [
    'upperRight',
    'upperFront',
    'upperLeft',
    'lowerRight',
    'lowerFront',
    'lowerLeft',
  ];

  return allZones.map((zone) => ({
    zone,
    confidence: zone === primaryZone ? 0.82 : 0.06,
  }));
}
