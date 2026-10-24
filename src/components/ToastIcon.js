import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const GLYPHS = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

/**
 * Renders the leading icon. `icon` may be:
 *  - false             -> nothing
 *  - a React element   -> rendered as is
 *  - a function        -> called with { type, color, size }
 *  - undefined         -> built-in glyph for the type (none for "custom")
 * The glyph is decorative; the toast's accessibility label carries the type.
 */
export default function ToastIcon({ type, icon, color, glyphColor, size }) {
  if (icon === false) {
    return null;
  }
  if (typeof icon === 'function') {
    return <View style={styles.wrapper}>{icon({ type, color, size })}</View>;
  }
  if (React.isValidElement(icon)) {
    return <View style={styles.wrapper}>{icon}</View>;
  }
  const glyph = GLYPHS[type];
  if (!glyph) {
    return null;
  }
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[styles.glyph, { color: glyphColor, fontSize: size * 0.62 }]}
      >
        {glyph}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginRight: 12, justifyContent: 'center' },
  badge: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontWeight: '800', textAlign: 'center', includeFontPadding: false },
});
