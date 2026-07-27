import AsyncStorage from '@react-native-async-storage/async-storage';

import { BrushSession } from '../types/brush';

const STORAGE_KEY = 'brushmap-ai/sessions';

export async function loadSessions(): Promise<BrushSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Partial<BrushSession>[];

    return parsed.map((session) => ({
      id: session.id ?? `${Date.now()}`,
      startedAt: session.startedAt ?? new Date().toISOString(),
      durationSec: session.durationSec ?? 0,
      events: session.events ?? [],
      zoneDurations: session.zoneDurations ?? {
        upperRight: 0,
        upperFront: 0,
        upperLeft: 0,
        lowerRight: 0,
        lowerFront: 0,
        lowerLeft: 0,
      },
      aiPredictions: session.aiPredictions ?? [],
    }));
  } catch {
    return [];
  }
}

export async function saveSession(session: BrushSession): Promise<void> {
  const sessions = await loadSessions();
  const nextSessions = [session, ...sessions].slice(0, 30);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
}

export async function replaceSessions(sessions: BrushSession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
