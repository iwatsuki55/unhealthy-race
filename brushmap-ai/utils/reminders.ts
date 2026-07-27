import { Platform } from 'react-native';

import { ReminderSettings } from '../types/brush';

export async function syncDailyReminder(
  settings: ReminderSettings,
): Promise<string> {
  if (Platform.OS === 'web') {
    return 'Webでは通知は送れませんが、設定は保存しました。';
  }

  const Notifications =
    require('expo-notifications') as typeof import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) {
    return 'リマインダーをオフにしました。';
  }

  const permissions = await Notifications.requestPermissionsAsync();
  if (!permissions.granted) {
    return '通知の許可がないため、リマインダーを設定できませんでした。';
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'BrushMap AI',
      body: '今日のブラッシングを記録してみましょう。',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.hour,
      minute: settings.minute,
    },
  });

  return `毎日 ${formatReminderTime(settings.hour, settings.minute)} に通知します。`;
}

export function formatReminderTime(hour: number, minute: number): string {
  const safeHour = `${hour}`.padStart(2, '0');
  const safeMinute = `${minute}`.padStart(2, '0');
  return `${safeHour}:${safeMinute}`;
}
