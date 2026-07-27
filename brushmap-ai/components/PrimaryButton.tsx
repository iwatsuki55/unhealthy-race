import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/brush';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void | Promise<unknown>;
  variant?: ButtonVariant;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, textStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: '#e2f4fb',
  },
  danger: {
    backgroundColor: '#ffe4e7',
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: '#ffffff',
  },
  secondary: {
    color: colors.textPrimary,
  },
  danger: {
    color: '#b93852',
  },
});
