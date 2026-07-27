import { AISensorFrame, BrushZone, ZoneConfidence } from '../../types/brush';

type ZoneEstimate = {
  primaryZone?: BrushZone;
  confidences: ZoneConfidence[];
  reasoning: string;
};

const ALL_ZONES: BrushZone[] = [
  'upperRight',
  'upperFront',
  'upperLeft',
  'lowerRight',
  'lowerFront',
  'lowerLeft',
];

export function estimateZoneFromDetections(frame: AISensorFrame): ZoneEstimate {
  const brushTip = frame.detections.hands[0]?.brushTip;
  const mouthCenter = frame.detections.faceMouth?.mouthCenter;

  if (!brushTip || !mouthCenter) {
    return {
      primaryZone: frame.manualZone ?? frame.guideZone,
      confidences: buildConfidences(frame.manualZone ?? frame.guideZone),
      reasoning: frame.manualZone
        ? '検出情報が少ないため、手動入力を優先しています。'
        : '検出情報が少ないため、ガイド部位を暫定的に採用しています。',
    };
  }

  const dx = brushTip.x - mouthCenter.x;
  const dy = brushTip.y - mouthCenter.y;

  const horizontalZone =
    dx <= -0.08 ? 'upperRight' : dx >= 0.08 ? 'upperLeft' : 'upperFront';
  const lowerHorizontalZone =
    dx <= -0.08 ? 'lowerRight' : dx >= 0.08 ? 'lowerLeft' : 'lowerFront';
  const primaryZone = dy <= 0.06 ? horizontalZone : lowerHorizontalZone;

  const reasonParts = [
    `口元に対して歯ブラシ先端が${describeHorizontal(dx)}にあります`,
    dy <= 0.06 ? '上側ゾーンとして扱っています' : '下側ゾーンとして扱っています',
  ];

  return {
    primaryZone,
    confidences: buildConfidences(primaryZone),
    reasoning: reasonParts.join('。'),
  };
}

function buildConfidences(primaryZone?: BrushZone): ZoneConfidence[] {
  if (!primaryZone) {
    return [];
  }

  return ALL_ZONES.map((zone) => ({
    zone,
    confidence: zone === primaryZone ? 0.8 : 0.04,
  }));
}

function describeHorizontal(dx: number) {
  if (dx <= -0.08) {
    return '右';
  }

  if (dx >= 0.08) {
    return '左';
  }

  return '中央';
}
