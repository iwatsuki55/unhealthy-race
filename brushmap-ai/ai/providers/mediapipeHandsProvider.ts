import { BrushAIProvider } from '../provider';

export const mediapipeHandsProvider: BrushAIProvider = {
  descriptor: {
    id: 'mediapipe-hands-future',
    label: 'MediaPipe Hands',
    description: '手のランドマーク推定を使ってブラッシング部位を推定する予定のプロバイダです。',
    status: 'unavailable',
    capabilities: ['future-hand-landmarks', 'future-brush-tip-tracking'],
  },
  async predict() {
    return {
      primaryZone: undefined,
      confidences: [],
      reasoning: 'MediaPipe Hands はまだ未実装です。現在は接続準備のためのプレースホルダーです。',
      source: 'mediapipe-hands-future',
    };
  },
};
