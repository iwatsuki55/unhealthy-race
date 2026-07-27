import { StyleSheet, Text, View } from 'react-native';

import { BRUSH_ZONES, colors } from '../constants/brush';
import { ZoneDurations } from '../types/brush';

type HeatmapCardProps = {
  zoneDurations: ZoneDurations;
};

export function HeatmapCard({ zoneDurations }: HeatmapCardProps) {
  const maxDuration = Math.max(...Object.values(zoneDurations), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>部位別ヒートマップ</Text>
      <View style={styles.grid}>
        {BRUSH_ZONES.map((zone) => {
          const duration = zoneDurations[zone.value];
          const intensity = duration / maxDuration;
          const backgroundColor = `rgba(46, 161, 214, ${0.22 + intensity * 0.68})`;

          return (
            <View
              key={zone.value}
              style={[styles.zoneCell, { backgroundColor }]}
            >
              <Text style={styles.zoneLabel}>{zone.label}</Text>
              <Text style={styles.zoneValue}>{duration}秒</Text>
            </View>
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
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  zoneCell: {
    width: '31%',
    minWidth: 98,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    gap: 4,
  },
  zoneLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#08364f',
  },
  zoneValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
});
