import AsyncStorage from '@react-native-async-storage/async-storage';

import { AIProviderId } from '../types/brush';

const AI_SETTINGS_STORAGE_KEY = 'brushmap-ai/ai-settings';

export type AISettings = {
  providerId: AIProviderId;
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  providerId: 'mock-motion-v1',
};

export async function loadAISettings(): Promise<AISettings> {
  try {
    const raw = await AsyncStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_AI_SETTINGS;
    }

    return {
      ...DEFAULT_AI_SETTINGS,
      ...(JSON.parse(raw) as Partial<AISettings>),
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await AsyncStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
