import {
  AIProviderDescriptor,
  AISensorFrame,
  AIZonePrediction,
} from '../types/brush';

export type BrushAIProvider = {
  descriptor: AIProviderDescriptor;
  warmup?: () => Promise<void>;
  predict: (frame: AISensorFrame) => Promise<AIZonePrediction | null>;
};
