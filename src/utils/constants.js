export const TOAST_TYPES = ['success', 'error', 'warning', 'info', 'custom'];
export const POSITIONS = [
  'top',
  'bottom',
  'center',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];
export const ANIMATIONS = ['fade', 'slide', 'zoom', 'none'];
export const DISMISS_REASONS = [
  'timeout',
  'manual',
  'swipe',
  'close',
  'action',
  'press',
  'hideAll',
];

export const TYPE_LABELS = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  custom: '',
};

export const DEFAULT_CONFIG = {
  position: 'top',
  duration: 3000,
  animation: 'slide',
  animationDuration: 250,
  maxVisible: 3,
  closeButton: false,
  swipeToDismiss: true,
  progress: false,
  haptics: false,
};
