import { Animated, Easing } from 'react-native';

const SLIDE_DISTANCE = 64;

/**
 * Every animation is driven by a single Animated.Value `progress` that goes
 * 0 (hidden) -> 1 (shown). Only opacity and transforms are animated, so the
 * native driver can be used and no layout pass is needed per frame.
 */

export function resolveAnimation(animation, reducedMotion) {
  if (reducedMotion && (animation === 'slide' || animation === 'zoom')) {
    // Movement and scaling are replaced by a plain cross-fade.
    return 'fade';
  }
  return animation;
}

function slideOffset(position) {
  if (position.startsWith('top')) {
    return -SLIDE_DISTANCE;
  }
  if (position.startsWith('bottom')) {
    return SLIDE_DISTANCE;
  }
  return SLIDE_DISTANCE / 2;
}

export function getAnimatedStyle(animation, progress, position) {
  switch (animation) {
    case 'fade':
      return { opacity: progress };
    case 'slide':
      return {
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [slideOffset(position), 0],
            }),
          },
        ],
      };
    case 'zoom':
      return {
        opacity: progress,
        transform: [
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
      };
    default:
      return {};
  }
}

/**
 * Starts an enter (toValue 1) or exit (toValue 0) animation and returns the
 * Animated handle so the caller can stop it. With animation 'none' or a zero
 * duration the value is set immediately and `onEnd({ finished: true })` is
 * called synchronously.
 */
export function runToastAnimation(progress, toValue, options, onEnd) {
  const { animation, duration } = options;
  if (animation === 'none' || !(duration > 0)) {
    progress.setValue(toValue);
    if (onEnd) {
      onEnd({ finished: true });
    }
    return null;
  }
  const handle = Animated.timing(progress, {
    toValue,
    duration,
    easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
  handle.start(onEnd);
  return handle;
}
