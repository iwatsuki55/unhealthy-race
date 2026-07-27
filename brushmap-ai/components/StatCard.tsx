import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
