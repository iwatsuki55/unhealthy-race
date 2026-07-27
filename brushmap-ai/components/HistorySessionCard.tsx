import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BRUSH_ZONES, colors } from '../constants/brush';
import { BrushSession } from '../types/brush';
import {
  getBalanceComment,
  getGuideAlignmentSummary,
} from '../utils/brushSession';
import { PrimaryButton } from './PrimaryButton';

type HistorySessionCardProps = {
  session: BrushSession;
  onPress: () => void;
  onDelete: () => void;
};

export function HistorySessionCard({
  session,
  onPress,
  onDelete,
}: HistorySessionCardProps) {
  const guideAlignment = getGuideAlignmentSummary(session.aiPredictions ?? []);

  return (
    <TextButtonCard onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {new Date(session.startedAt).toLocaleString('ja-JP')}
        </Text>
        <Text style={styles.duration}>{session.durationSec}秒</Text>
      </View>

      <Text style={styles.comment}>
        {getBalanceComment(session.zoneDurations)}
      </Text>

      <View style={styles.grid}>
        {BRUSH_ZONES.map((zone) => (
          <View key={zone.value} style={styles.pill}>
            <Text style={styles.pillLabel}>{zone.label}</Text>
            <Text style={styles.pillValue}>{session.zoneDurations[zone.value]}秒</Text>
          </View>
        ))}
      </View>

      <Text style={styles.events}>記録イベント: {session.events.length}件</Text>
      <Text style={styles.alignment}>
        {guideAlignment.total === 0
          ? 'ガイド一致率: まだ比較データなし'
          : `ガイド一致率: ${guideAlignment.matched}/${guideAlignment.total} (${guideAlignment.matchRate}%)`}
      </Text>
      <View style={styles.actions}>
        <PrimaryButton label="詳細を見る" onPress={onPress} variant="secondary" />
        <PrimaryButton label="削除" onPress={onDelete} variant="danger" />
      </View>
    </TextButtonCard>
  );
}

function TextButtonCard({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  duration: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent,
  },
  comment: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
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
  events: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alignment: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  pressed: {
    opacity: 0.88,
  },
});
