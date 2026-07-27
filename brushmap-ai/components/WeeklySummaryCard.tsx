import { StyleSheet, Text, View } from 'react-native';

import { BRUSH_ZONES, colors } from '../constants/brush';
import { WeeklySummary } from '../types/brush';

type WeeklySummaryCardProps = {
  summary: WeeklySummary;
};

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Weekly Summary</Text>
      <Text style={styles.title}>{summary.title}</Text>
      <Text style={styles.body}>
        {summary.sessionCount}回 / 合計{summary.totalDurationSec}秒 / 平均
        {summary.averageDurationSec}秒
      </Text>
      <View style={styles.metaPill}>
        <Text style={styles.metaLabel}>連続記録</Text>
        <Text style={styles.metaValue}>{summary.streakDays}日</Text>
      </View>
      <Text style={styles.comment}>{summary.comment}</Text>

      <View style={styles.weekdayCard}>
        <Text style={styles.weekdayTitle}>曜日ごとの記録回数</Text>
        <View style={styles.weekdayRow}>
          {summary.weekdayCounts.map((item) => (
            <View key={item.label} style={styles.weekdayItem}>
              <Text style={styles.weekdayLabel}>{item.label}</Text>
              <View
                style={[
                  styles.weekdayBar,
                  item.count > 0 && {
                    height: Math.min(16 + item.count * 10, 60),
                    backgroundColor: colors.accent,
                  },
                ]}
              />
              <Text style={styles.weekdayCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.grid}>
        {BRUSH_ZONES.map((zone) => (
          <View key={zone.value} style={styles.pill}>
            <Text style={styles.pillLabel}>{zone.label}</Text>
            <Text style={styles.pillValue}>
              {summary.zoneTotals[zone.value]}秒
            </Text>
          </View>
        ))}
      </View>
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
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
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
    lineHeight: 26,
    color: colors.textPrimary,
  },
  metaPill: {
    backgroundColor: '#e8f7ff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 2,
    alignSelf: 'flex-start',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  weekdayCard: {
    backgroundColor: '#f7fbfe',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  weekdayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  weekdayItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  weekdayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  weekdayBar: {
    width: '100%',
    minHeight: 16,
    borderRadius: 999,
    backgroundColor: '#d9eef9',
  },
  weekdayCount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    width: '31%',
    minWidth: 96,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pillValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
