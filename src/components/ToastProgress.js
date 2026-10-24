import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/**
 * Bar that drains from full to empty over the toast's duration.
 * It pauses while `paused` is true and continues from where it stopped.
 *
 * Trade-off: the bar animates `width`, a layout property, so it cannot use the
 * native driver. It is a thin absolutely-positioned element, so the cost is small.
 */
export default function ToastProgress({
  duration,
  remaining,
  paused,
  color,
  trackColor,
}) {
  const value = useRef(new Animated.Value(remaining / duration)).current;
  const current = useRef(remaining / duration);

  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      current.current = v;
    });
    return () => value.removeListener(id);
  }, [value]);

  useEffect(() => {
    if (paused || current.current <= 0) {
      return undefined;
    }
    const animation = Animated.timing(value, {
      toValue: 0,
      duration: current.current * duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [paused, duration, value]);

  return (
    <View
      testID="toast-progress"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.track, { backgroundColor: trackColor }]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: color,
            width: value.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3 },
  bar: { height: 3 },
});
