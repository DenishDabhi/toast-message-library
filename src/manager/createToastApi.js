function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Builds the object returned by useToast() from a ToastManager. The returned
 * object is stable for the lifetime of the manager, so consumers do not
 * re-render when toasts appear or disappear.
 */
export default function createToastApi(manager) {
  const typed = type => (message, options) => {
    let input;
    if (typeof message === 'string' || typeof message === 'number') {
      input = { ...options, message: String(message) };
    } else if (isObject(message)) {
      input = { ...message, ...options };
    } else {
      input = { ...options };
    }
    return manager.show({ ...input, type });
  };

  return {
    show: input => manager.show(input),
    success: typed('success'),
    error: typed('error'),
    warning: typed('warning'),
    info: typed('info'),
    hide: id => manager.hide(id),
    hideAll: () => manager.hideAll(),
    isVisible: id => manager.isVisible(id),
  };
}
