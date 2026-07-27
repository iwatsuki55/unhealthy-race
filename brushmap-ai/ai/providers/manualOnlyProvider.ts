import { BrushAIProvider } from '../provider';

export const manualOnlyProvider: BrushAIProvider = {
  descriptor: {
    id: 'manual-only',
    label: 'Manual Only',
    description: 'AI推定を行わず、手動記録だけを扱います。',
    status: 'ready',
    capabilities: ['manual-recording'],
  },
  async predict(frame) {
    if (!frame.manualZone) {
      return null;
    }

    return {
      primaryZone: frame.manualZone,
      confidences: [{ zone: frame.manualZone, confidence: 1 }],
      reasoning: '手動記録をそのまま採用しています。',
      source: 'manual-only',
    };
  },
};
