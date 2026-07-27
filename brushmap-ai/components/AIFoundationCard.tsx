import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { AISessionState } from '../types/brush';
import { getZoneDisplayName } from '../utils/brushSession';

type AIFoundationCardProps = {
  aiState: AISessionState;
};

export function AIFoundationCard({ aiState }: AIFoundationCardProps) {
  const topCandidates = [...(aiState.latestPrediction?.confidences ?? [])]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
  const topConfidence = topCandidates[0]?.confidence;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>AI Foundation</Text>
      <Text style={styles.title}>{aiState.provider.label}</Text>
      <Text style={styles.body}>{aiState.provider.description}</Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>現在の推定部位</Text>
        <Text style={styles.heroValue}>
          {aiState.latestPrediction?.primaryZone
            ? getZoneDisplayName(aiState.latestPrediction.primaryZone)
            : '未推定'}
        </Text>
        <Text style={styles.heroMeta}>
          {typeof topConfidence === 'number'
            ? `信頼度 ${Math.round(topConfidence * 100)}%`
            : '信頼度はまだありません'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillLabel}>状態</Text>
          <Text style={styles.metaPillValue}>
            {aiState.provider.status === 'unavailable' ? '準備中' : aiState.provider.status}
          </Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillLabel}>推定回数</Text>
          <Text style={styles.metaPillValue}>{aiState.predictionCount}回</Text>
        </View>
      </View>

      <View style={styles.candidatesCard}>
        <Text style={styles.candidatesTitle}>上位候補</Text>
        {topCandidates.length > 0 ? (
          <View style={styles.candidateList}>
            {topCandidates.map((candidate) => (
              <View key={candidate.zone} style={styles.candidatePill}>
                <Text style={styles.candidateZone}>{getZoneDisplayName(candidate.zone)}</Text>
                <Text style={styles.candidateConfidence}>
                  {Math.round(candidate.confidence * 100)}%
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.meta}>候補はまだありません。</Text>
        )}
      </View>

      <Text style={styles.meta}>
        推定理由:
        {' '}
        {aiState.latestPrediction?.reasoning ?? 'まだAI推定は実行されていません。'}
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
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  hero: {
    backgroundColor: '#edf8fd',
    borderRadius: 20,
    padding: 16,
    gap: 4,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroMeta: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    backgroundColor: '#f7fbfe',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  metaPillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaPillValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  candidatesCard: {
    gap: 8,
  },
  candidatesTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  candidateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  candidatePill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  candidateZone: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  candidateConfidence: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  meta: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
});
