import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium';
}

export default function Badge({ label, color = Colors.primary, style, size = 'medium' }: BadgeProps) {
  const bg = color + '20';
  return (
    <View style={[styles.badge, size === 'small' ? styles.small : styles.medium, { backgroundColor: bg, borderColor: color + '40' }, style]}>
      <Text style={[styles.text, size === 'small' ? styles.textSmall : styles.textMedium, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  small: { paddingHorizontal: 8, paddingVertical: 3 },
  medium: { paddingHorizontal: 12, paddingVertical: 5 },
  text: { fontWeight: '600' },
  textSmall: { fontSize: 11 },
  textMedium: { fontSize: 13 },
});
