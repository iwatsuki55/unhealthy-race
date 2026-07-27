import { BrushAIProvider } from '../provider';

export const faceMouthProvider: BrushAIProvider = {
  descriptor: {
    id: 'face-mouth-future',
    label: 'Face Mouth',
    description: '口元位置推定と手の相対位置から部位判定を行う予定のプロバイダです。',
    status: 'unavailable',
    capabilities: ['future-face-detection', 'future-mouth-region-estimation'],
  },
  async predict() {
    return {
      primaryZone: undefined,
      confidences: [],
      reasoning: 'Face Detection ベースの口元推定はまだ未実装です。今後ここへ接続します。',
      source: 'face-mouth-future',
    };
  },
};
