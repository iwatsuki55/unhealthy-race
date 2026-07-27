import { StyleSheet, Text, View } from 'react-native';

import { BRUSH_ZONES, colors } from '../constants/brush';
import { AIPredictionRecord } from '../types/brush';
import {
  getAIPredictionSummary,
  getAIPredictionTimelineItems,
  getZoneDisplayName,
} from '../utils/brushSession';

type AIPredictionHistoryCardProps = {
  predictions: AIPredictionRecord[];
};

function getProviderLabel(providerId?: string) {
  switch (providerId) {
    case 'mock-motion-v1':
      return 'Mock Motion v1';
    case 'manual-only':
      return 'Manual Only';
    case 'mediapipe-hands-future':
      return 'MediaPipe Hands';
    case 'face-mouth-future':
      return 'Face Mouth';
    case 'watch-motion-future':
      return 'Apple Watch Motion';
    case 'etoothbrush-ble-future':
      return 'Toothbrush BLE';
    default:
      return providerId ?? '未設定';
  }
}

export function AIPredictionHistoryCard({
  predictions,
}: AIPredictionHistoryCardProps) {
  const summary = getAIPredictionSummary(predictions);
  const items = getAIPredictionTimelineItems(predictions);
  const matchRate =
    summary.manualComparisonCount > 0
      ? Math.round((summary.matchedManualCount / summary.manualComparisonCount) * 100)
      : null;

  if (predictions.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>AI Trace</Text>
        <Text style={styles.title}>AI推定ログ</Text>
        <Text style={styles.body}>
          このセッションでは、保存されたAI推定ログがありません。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>AI Trace</Text>
      <Text style={styles.title}>AI推定ログ</Text>
      <Text style={styles.body}>
        {summary.totalPredictions}件の推定を保存しました。
        {summary.topZone
          ? ` 最も多かった推定部位は${getZoneDisplayName(summary.topZone)}です。`
          : ''}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>主プロバイダ</Text>
          <Text style={styles.metaValue}>{getProviderLabel(summary.topProviderId)}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>手動一致率</Text>
          <Text style={styles.metaValue}>
            {matchRate !== null ? `${matchRate}%` : '比較なし'}
          </Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>カメラ準備済み</Text>
          <Text style={styles.metaValue}>
            {summary.cameraReadyCount}/{summary.totalPredictions}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {BRUSH_ZONES.map((zone) => (
          <View key={zone.value} style={styles.zonePill}>
            <Text style={styles.zoneLabel}>{zone.label}</Text>
            <Text style={styles.zoneValue}>
              {summary.predictedCounts[zone.value] ?? 0}件
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>最近のAI推定</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineHead}>
              <Text style={styles.timelineTime}>{item.time}</Text>
              <Text style={styles.timelineZone}>{item.predictedZone}</Text>
              {item.confidenceLabel ? (
                <Text style={styles.timelineConfidence}>{item.confidenceLabel}</Text>
              ) : null}
            </View>
            <Text style={styles.timelineReason}>{item.reasoning}</Text>
            <Text style={styles.timelineMeta}>
              手動入力: {item.manualZone ?? 'なし'} / カメラ:
              {' '}
              {item.cameraReady ? '準備完了' : '未準備'} / 推定元:
              {' '}
              {getProviderLabel(item.providerId)}
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
    gap: 14,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaPill: {
    flexGrow: 1,
    minWidth: 100,
    backgroundColor: '#e8f7ff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zonePill: {
    width: '31%',
    minWidth: 96,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  zoneLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  zoneValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timelineCard: {
    backgroundColor: '#f7fbfe',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timelineItem: {
    gap: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d8ebf6',
  },
  timelineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
  timelineZone: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timelineConfidence: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  timelineReason: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  timelineMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
