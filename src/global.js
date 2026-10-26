let active = null;

/**
 * Called by <ToastProvider global>. Returns an unregister function. If several
 * global providers are mounted, the most recently mounted one wins and the
 * previous one is restored when it unmounts.
 */
export function registerGlobalToast(api) {
  const previous = active;
  active = api;
  return () => {
    if (active === api) {
      active = previous;
    }
  };
}

function current() {
  if (!active) {
    throw new Error(
      '[react-native-toast-message-library] Toast.* was called but no <ToastProvider global> is mounted. ' +
        'Render <ToastProvider global> near the root of your app, or use the useToast() hook.',
    );
  }
  return active;
}

/** Imperative API. Requires <ToastProvider global>. Throws if none is mounted. */
export const Toast = {
  show: input => current().show(input),
  success: (message, options) => current().success(message, options),
  error: (message, options) => current().error(message, options),
  warning: (message, options) => current().warning(message, options),
  info: (message, options) => current().info(message, options),
  hide: id => current().hide(id),
  hideAll: () => current().hideAll(),
  isVisible: id => current().isVisible(id),
};
