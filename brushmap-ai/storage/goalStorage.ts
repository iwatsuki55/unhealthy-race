import AsyncStorage from '@react-native-async-storage/async-storage';

import { BrushGoals } from '../types/brush';

const GOALS_STORAGE_KEY = 'brushmap-ai/goals';

export const DEFAULT_GOALS: BrushGoals = {
  dailySessionsTarget: 2,
  targetDurationSec: 120,
};

export async function loadGoals(): Promise<BrushGoals> {
  try {
    const raw = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_GOALS;
    }

    return {
      ...DEFAULT_GOALS,
      ...(JSON.parse(raw) as Partial<BrushGoals>),
    };
  } catch {
    return DEFAULT_GOALS;
  }
}

export async function saveGoals(goals: BrushGoals): Promise<void> {
  await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}
