import { AccessibilityInfo } from 'react-native';

/**
 * Throttled screen-reader announcements (used on iOS, which has no live
 * regions). If several toasts appear at once, only the most recent message
 * waiting is spoken after the minimum gap, so VoiceOver is not interrupted
 * repeatedly.
 */
export default function createAnnouncer(minGap = 1500) {
  let lastAt = 0;
  let pending = null;
  let timer = null;

  function speak(message) {
    lastAt = Date.now();
    AccessibilityInfo.announceForAccessibility(message);
  }

  return {
    announce(message) {
      const wait = lastAt + minGap - Date.now();
      if (wait <= 0 && timer == null) {
        speak(message);
        return;
      }
      pending = message;
      if (timer == null) {
        timer = setTimeout(() => {
          timer = null;
          const next = pending;
          pending = null;
          if (next != null) {
            speak(next);
          }
        }, Math.max(wait, 0));
      }
    },
    cancel() {
      if (timer != null) {
        clearTimeout(timer);
      }
      timer = null;
      pending = null;
    },
  };
}
