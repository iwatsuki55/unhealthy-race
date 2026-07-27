import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { ReminderSettings } from '../types/brush';
import { PrimaryButton } from './PrimaryButton';

type ReminderSettingsCardProps = {
  settings: ReminderSettings;
  statusMessage: string | null;
  onChange: (settings: ReminderSettings) => void;
};

export function ReminderSettingsCard({
  settings,
  statusMessage,
  onChange,
}: ReminderSettingsCardProps) {
  const presets = [
    { label: '朝 07:30', hour: 7, minute: 30 },
    { label: '昼 12:30', hour: 12, minute: 30 },
    { label: '夜 21:00', hour: 21, minute: 0 },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>通知リマインダー</Text>
      <Text style={styles.body}>
        毎日のブラッシングを忘れにくくするための通知です。
      </Text>
      <Text style={styles.current}>
        {settings.enabled
          ? `現在: 毎日 ${`${settings.hour}`.padStart(2, '0')}:${`${settings.minute}`.padStart(2, '0')}`
          : '現在: オフ'}
      </Text>
      <View style={styles.presetList}>
        {presets.map((preset) => (
          <PrimaryButton
            key={preset.label}
            label={preset.label}
            onPress={() =>
              onChange({
                enabled: true,
                hour: preset.hour,
                minute: preset.minute,
              })
            }
            variant="secondary"
          />
        ))}
      </View>
      <View style={styles.toggleRow}>
        <PrimaryButton
          label={settings.enabled ? '通知をオフ' : '通知をオン'}
          onPress={() =>
            onChange({
              ...settings,
              enabled: !settings.enabled,
            })
          }
          variant={settings.enabled ? 'danger' : 'primary'}
        />
      </View>
      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  current: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetList: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  status: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
