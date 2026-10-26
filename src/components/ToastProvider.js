import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import ToastContext from '../context/ToastContext';
import { registerGlobalToast } from '../global';
import createToastApi from '../manager/createToastApi';
import ToastManager from '../manager/ToastManager';
import { resolveTheme } from '../themes';
import { DEFAULT_CONFIG } from '../utils/constants';
import ToastContainer from './ToastContainer';

const NO_OFFSET = { x: 0, y: 0 };

export default function ToastProvider({
  children,
  theme = 'light',
  position = DEFAULT_CONFIG.position,
  duration = DEFAULT_CONFIG.duration,
  animation = DEFAULT_CONFIG.animation,
  animationDuration = DEFAULT_CONFIG.animationDuration,
  maxVisible = DEFAULT_CONFIG.maxVisible,
  closeButton = DEFAULT_CONFIG.closeButton,
  swipeToDismiss = DEFAULT_CONFIG.swipeToDismiss,
  progress = DEFAULT_CONFIG.progress,
  haptics = DEFAULT_CONFIG.haptics,
  spacing,
  offset,
  insets,
  global = false,
  style,
}) {
  const config = {
    position,
    duration,
    animation,
    animationDuration,
    maxVisible,
    closeButton,
    swipeToDismiss,
    progress,
    haptics,
  };

  const managerRef = useRef(null);
  if (!managerRef.current) {
    managerRef.current = new ToastManager(config);
  }
  const manager = managerRef.current;

  useEffect(() => {
    manager.configure(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    manager,
    position,
    duration,
    animation,
    animationDuration,
    maxVisible,
    closeButton,
    swipeToDismiss,
    progress,
    haptics,
  ]);

  // Clear every timer on unmount. `revive` makes this safe under React
  // StrictMode, which runs effect cleanup and setup once more in development.
  useEffect(() => {
    manager.revive();
    return () => manager.destroy();
  }, [manager]);

  const api = useMemo(() => createToastApi(manager), [manager]);

  useEffect(() => {
    if (!global) {
      return undefined;
    }
    return registerGlobalToast(api);
  }, [global, api]);

  const colorScheme = useColorScheme();
  const resolvedTheme = useMemo(
    () => resolveTheme(theme, colorScheme === 'dark' ? 'dark' : 'light'),
    [theme, colorScheme],
  );

  const resolvedOffset = useMemo(() => ({ ...NO_OFFSET, ...offset }), [offset]);

  return (
    <ToastContext.Provider value={api}>
      <View style={[styles.root, style]}>
        {children}
        <ToastContainer
          manager={manager}
          theme={resolvedTheme}
          spacing={spacing != null ? spacing : resolvedTheme.spacing}
          offset={resolvedOffset}
          insets={insets}
        />
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
