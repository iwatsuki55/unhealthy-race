import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/brush';
import { BrushZone, ZoneOption } from '../types/brush';

type ZoneSelectorProps = {
  zones: ZoneOption[];
  activeZone?: BrushZone;
  onSelect: (zone: BrushZone) => void;
};

export function ZoneSelector({
  zones,
  activeZone,
  onSelect,
}: ZoneSelectorProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>今みがいている部位をタップ</Text>
      <View style={styles.grid}>
        {zones.map((zone) => {
          const active = activeZone === zone.value;

          return (
            <Pressable
              key={zone.value}
              accessibilityRole="button"
              onPress={() => onSelect(zone.value)}
              style={({ pressed }) => [
                styles.zoneButton,
                active && styles.zoneButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.zoneLabel,
                  active && styles.zoneLabelActive,
                ]}
              >
                {zone.label}
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
  zoneButton: {
    width: '31%',
    minWidth: 98,
    minHeight: 74,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
  },
  zoneButtonActive: {
    backgroundColor: colors.accent,
  },
  zoneLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  zoneLabelActive: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.85,
  },
});
