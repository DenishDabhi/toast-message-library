import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function ToastAction({
  label,
  accessibilityLabel,
  color,
  onPress,
  fontFamily,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text
        maxFontSizeMultiplier={1.4}
        style={[styles.label, { color }, fontFamily && { fontFamily }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    minWidth: 44,
    paddingHorizontal: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '700', textTransform: 'none' },
});
