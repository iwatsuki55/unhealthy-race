import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { AIProviderDescriptor, AIProviderId } from '../types/brush';

type AIProviderSelectorCardProps = {
  providers: AIProviderDescriptor[];
  selectedProviderId: AIProviderId;
  onSelect: (providerId: AIProviderId) => void;
};

export function AIProviderSelectorCard({
  providers,
  selectedProviderId,
  onSelect,
}: AIProviderSelectorCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>AI Mode</Text>
      <Text style={styles.title}>AI推定プロバイダ</Text>
      <Text style={styles.body}>
        現在の推定方式を切り替えられます。将来は MediaPipe や Face Detection の実装もここへ追加します。
      </Text>

      <View style={styles.list}>
        {providers.map((provider) => {
          const selected = provider.id === selectedProviderId;

          return (
            <Pressable
              key={provider.id}
              accessibilityRole="button"
              onPress={() => onSelect(provider.id)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                {provider.label}
              </Text>
              <Text style={styles.optionDescription}>{provider.description}</Text>
              <Text style={styles.optionMeta}>
                状態: {provider.status === 'unavailable' ? '準備中' : provider.status}
              </Text>
            </Pressable>
          );
        })}
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  list: {
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: '#d8ebf6',
    borderRadius: 18,
    padding: 14,
    gap: 4,
    backgroundColor: '#f8fcfe',
  },
  optionSelected: {
    backgroundColor: '#e8f7ff',
    borderColor: colors.accent,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  optionTitleSelected: {
    color: colors.accent,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  optionMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
