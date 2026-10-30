import { createContext, useContext } from 'react';
import { Platform, StatusBar } from 'react-native';

// react-native-safe-area-context is an optional peer dependency. Metro treats a
// require() inside try/catch as optional, so the library works without it.
let ExternalInsetsContext = null;
try {
  ExternalInsetsContext =
    require('react-native-safe-area-context').SafeAreaInsetsContext;
} catch (error) {
  ExternalInsetsContext = null;
}

const FallbackContext = createContext(null);
const InsetsContext = ExternalInsetsContext || FallbackContext;
const SIDES = ['top', 'bottom', 'left', 'right'];

function fallbackInsets() {
  if (Platform.OS === 'android') {
    return { top: StatusBar.currentHeight || 0, bottom: 0, left: 0, right: 0 };
  }
  // Conservative values for devices with a notch / Dynamic Island. Install
  // react-native-safe-area-context (and add a SafeAreaProvider) for exact values.
  return { top: 47, bottom: 34, left: 0, right: 0 };
}

function isValidInset(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Only sides that hold a valid number are taken from `override`. Anything else
 * (undefined, null, strings, NaN, negative numbers) is ignored, so
 * `insets={{ top: undefined }}` cannot turn into NaN positions.
 */
function pickValidInsets(override) {
  const picked = {};
  if (override && typeof override === 'object') {
    SIDES.forEach(side => {
      if (isValidInset(override[side])) {
        picked[side] = override[side];
      }
    });
  }
  return picked;
}

/**
 * Priority: explicit `override` prop > react-native-safe-area-context
 * (when installed and a SafeAreaProvider is mounted) > platform fallback.
 */
export default function useToastInsets(override) {
  const external = useContext(InsetsContext);
  const base = external || fallbackInsets();
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    ...base,
    ...pickValidInsets(override),
  };
}
