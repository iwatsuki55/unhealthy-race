import {
  HandObservation,
  MediaPipeHandLandmark,
  MediaPipeHandResult,
} from '../../types/brush';

const WRIST_INDEX = 0;
const INDEX_FINGER_TIP_INDEX = 8;

export function mapMediaPipeHandsToObservations(
  results: MediaPipeHandResult[],
): HandObservation[] {
  return results.map((result) => {
    const wrist = getPoint(result.landmarks[WRIST_INDEX]);
    const brushTip = getPoint(result.landmarks[INDEX_FINGER_TIP_INDEX]);

    return {
      handedness: mapHandedness(result.handedness),
      wrist,
      // TODO: 電動歯ブラシBluetooth連携や追加センサーがあれば brushTip 補正に使う。
      brushTip,
    };
  });
}

function mapHandedness(handedness?: MediaPipeHandResult['handedness']) {
  if (handedness === 'Left') {
    return 'left';
  }

  if (handedness === 'Right') {
    return 'right';
  }

  return 'unknown';
}

function getPoint(landmark?: MediaPipeHandLandmark) {
  if (!landmark) {
    return undefined;
  }

  return {
    x: clamp(landmark.x),
    y: clamp(landmark.y),
  };
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}
