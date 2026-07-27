import AsyncStorage from '@react-native-async-storage/async-storage';

import { ReminderSettings } from '../types/brush';

const REMINDER_STORAGE_KEY = 'brushmap-ai/reminder';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 21,
  minute: 0,
};

export async function loadReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_REMINDER_SETTINGS;
    }

    return {
      ...DEFAULT_REMINDER_SETTINGS,
      ...(JSON.parse(raw) as Partial<ReminderSettings>),
    };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<void> {
  await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
}
