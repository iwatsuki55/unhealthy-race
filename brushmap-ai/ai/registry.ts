import { BrushAIProvider } from './provider';
import { faceMouthProvider } from './providers/faceMouthProvider';
import { manualOnlyProvider } from './providers/manualOnlyProvider';
import { mediapipeHandsProvider } from './providers/mediapipeHandsProvider';
import { mockMotionProvider } from './providers/mockMotionProvider';
import { AIProviderId } from '../types/brush';

export const aiProviders: BrushAIProvider[] = [
  mockMotionProvider,
  manualOnlyProvider,
  mediapipeHandsProvider,
  faceMouthProvider,
];

export function getDefaultAIProvider(providerId?: AIProviderId): BrushAIProvider {
  if (!providerId) {
    return aiProviders[0];
  }

  return aiProviders.find((provider) => provider.descriptor.id === providerId) ?? aiProviders[0];
}

export function getAIProviderOptions() {
  return aiProviders.map((provider) => provider.descriptor);
}
