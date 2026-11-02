import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export default function ToastProgress({
  duration,
  remaining,
  paused,
  color,
  trackColor,
}) {
  const [width, setWidth] = useState(0);
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
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [paused, duration, value]);

  return (
    <View
      testID="toast-progress"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: trackColor }]}
    >
      {width > 0 && (
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: color,
              width,
              transform: [
                {
                  translateX: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    overflow: 'hidden',
  },
  bar: {
    height: 3,
  },
});
