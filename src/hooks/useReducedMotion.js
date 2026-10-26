import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Tracks the system "reduce motion" accessibility setting. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (mounted) {
          setReduced(Boolean(value));
        }
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => setReduced(Boolean(value)),
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
