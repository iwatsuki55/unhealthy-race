import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { BrushBadge } from '../types/brush';

type BadgeCardProps = {
  badges: BrushBadge[];
};

export function BadgeCard({ badges }: BadgeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>達成バッジ</Text>
      {badges.length > 0 ? (
        <View style={styles.list}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badge}>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>
          まだバッジはありません。今日の目標達成から始めましょう。
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
  list: {
    gap: 10,
  },
  badge: {
    backgroundColor: '#eef8ff',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  badgeLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badgeDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  empty: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
