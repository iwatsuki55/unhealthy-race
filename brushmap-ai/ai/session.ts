import { getDefaultAIProvider } from './registry';
import {
  AIProviderId,
  AIPredictionRecord,
  AISensorFrame,
  AISessionState,
  BrushZone,
} from '../types/brush';

export function createInitialAIState(providerId?: AIProviderId): AISessionState {
  const provider = getDefaultAIProvider(providerId);

  return {
    provider: provider.descriptor,
    latestPrediction: null,
    predictionCount: 0,
  };
}

export async function runAIPrediction(
  frame: AISensorFrame,
  acceptedManualZone?: BrushZone,
  providerId?: AIProviderId,
): Promise<Partial<AISessionState>> {
  const provider = getDefaultAIProvider(providerId);
  const prediction = await provider.predict(frame);

  return {
    provider: provider.descriptor,
    latestPrediction: prediction,
    latestAcceptedZone: acceptedManualZone ?? prediction?.primaryZone,
    predictionCount: prediction ? 1 : 0,
    lastUpdatedAt: Date.now(),
  };
}

export function toAIPredictionRecord(
  frame: AISensorFrame,
  sessionState: Partial<AISessionState>,
): AIPredictionRecord | null {
  const prediction = sessionState.latestPrediction;
  if (!prediction) {
    return null;
  }

  return {
    timestamp: frame.timestamp,
    elapsedSec: frame.elapsedSec,
    providerId: prediction.source,
    cameraReady: frame.cameraReady,
    source: frame.source,
    manualZone: frame.manualZone,
    predictedZone: prediction.primaryZone,
    reasoning: prediction.reasoning,
    confidences: prediction.confidences,
  };
}
