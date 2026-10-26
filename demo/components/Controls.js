import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export function palette(isDark) {
  return isDark
    ? {
        card: '#161B26',
        text: '#F5F5F6',
        sub: '#94969C',
        chip: '#1F242F',
        chipOn: '#7F56D9',
        border: '#333741',
        button: '#7F56D9',
      }
    : {
        card: '#FFFFFF',
        text: '#101828',
        sub: '#667085',
        chip: '#EAECF0',
        chipOn: '#6941C6',
        border: '#E4E7EC',
        button: '#6941C6',
      };
}

export function Section({ title, subtitle, colors, children }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.sub }]}>{subtitle}</Text>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function Button({ label, onPress, colors, color, outline }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        outline
          ? { borderWidth: 1.5, borderColor: color || colors.button }
          : { backgroundColor: color || colors.button },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          outline && { color: color || colors.button },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chips({ options, value, onChange, colors }) {
  return (
    <View style={styles.chips}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              { backgroundColor: selected ? colors.chipOn : colors.chip },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: selected ? '#FFFFFF' : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({ label, value, onChange, colors }) {
  return (
    <View style={styles.toggle}>
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  body: { marginTop: 12, gap: 10 },
  button: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: { fontSize: 14 },
});
