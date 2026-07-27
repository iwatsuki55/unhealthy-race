import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { BrushGoals, BrushSession } from '../types/brush';

type GoalProgressCardProps = {
  goals: BrushGoals;
  sessions: BrushSession[];
};

export function GoalProgressCard({ goals, sessions }: GoalProgressCardProps) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((session) =>
    session.startedAt.slice(0, 10) === todayKey,
  );
  const completedSessions = todaySessions.length;
  const durationQualified = todaySessions.filter(
    (session) => session.durationSec >= goals.targetDurationSec,
  ).length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>今日の目標進捗</Text>
      <Text style={styles.body}>
        回数 {completedSessions}/{goals.dailySessionsTarget}回
      </Text>
      <Text style={styles.body}>
        時間目標達成 {durationQualified}/{todaySessions.length}回
      </Text>
      <Text style={styles.comment}>
        {completedSessions >= goals.dailySessionsTarget
          ? '今日の回数目標を達成しています。'
          : `あと${goals.dailySessionsTarget - completedSessions}回で今日の目標です。`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 8,
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
  comment: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.textPrimary,
  },
});
