/**
 * Calls a user-supplied callback and never lets it throw.
 *
 * Errors thrown by `onShow`, `onPress`, `onAction` and `onDismiss` are logged
 * with console.error. They must not break the toast, skip the dismissal that
 * should follow, or corrupt the manager state.
 */
export default function safeCall(fn, ...args) {
  if (typeof fn !== 'function') {
    return;
  }
  try {
    fn(...args);
  } catch (error) {
    console.error(
      '[react-native-toast-message-library] Error in toast callback:',
      error,
    );
  }
}
