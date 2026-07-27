import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { BrushEvent } from '../types/brush';
import { getTimelineItems } from '../utils/brushSession';

type TimelineCardProps = {
  events: BrushEvent[];
  startedAt: string;
};

export function TimelineCard({ events, startedAt }: TimelineCardProps) {
  const items = getTimelineItems(events, startedAt);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>磨き順序のタイムライン</Text>
      {items.length > 0 ? (
        items.map((item) => (
          <View key={`${item.time}-${item.label}`} style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>
          手動記録がないため、タイムラインは表示されません。
        </Text>
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  time: {
    width: 56,
    fontSize: 15,
    fontWeight: '800',
    color: colors.accent,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  empty: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
