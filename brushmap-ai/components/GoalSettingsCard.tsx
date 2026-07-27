import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { BrushGoals } from '../types/brush';
import { PrimaryButton } from './PrimaryButton';

type GoalSettingsCardProps = {
  goals: BrushGoals;
  onChange: (goals: BrushGoals) => void;
};

export function GoalSettingsCard({ goals, onChange }: GoalSettingsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>目標設定</Text>
      <Text style={styles.body}>
        毎日の目安を決めて、習慣化のペースを見える化します。
      </Text>

      <View style={styles.row}>
        <View style={styles.meta}>
          <Text style={styles.label}>1日の目標回数</Text>
          <Text style={styles.value}>{goals.dailySessionsTarget}回</Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            label="-"
            onPress={() =>
              onChange({
                ...goals,
                dailySessionsTarget: Math.max(1, goals.dailySessionsTarget - 1),
              })
            }
            variant="secondary"
          />
          <PrimaryButton
            label="+"
            onPress={() =>
              onChange({
                ...goals,
                dailySessionsTarget: Math.min(5, goals.dailySessionsTarget + 1),
              })
            }
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.meta}>
          <Text style={styles.label}>1回の目標時間</Text>
          <Text style={styles.value}>{goals.targetDurationSec}秒</Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            label="-30"
            onPress={() =>
              onChange({
                ...goals,
                targetDurationSec: Math.max(60, goals.targetDurationSec - 30),
              })
            }
            variant="secondary"
          />
          <PrimaryButton
            label="+30"
            onPress={() =>
              onChange({
                ...goals,
                targetDurationSec: Math.min(240, goals.targetDurationSec + 30),
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  row: {
    backgroundColor: '#f7fbfe',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  meta: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});
