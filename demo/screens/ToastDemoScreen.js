import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../src';

// The render functions below are defined outside the component so React does
// not see a new component type on every render.
function renderRocketIcon({ color }) {
  return <Text style={[styles.emoji, { color }]}>🚀</Text>;
}

function renderCustomToast({ colors }) {
  return (
    <View style={styles.renderRow}>
      <Text style={[styles.renderText, { color: colors.text }]}>
        🎉 Fully custom layout bottom right
      </Text>
    </View>
  );
}

export default function ToastDemoScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [isRunning, setIsRunning] = useState(false);

  const timers = useRef(new Set());

  // Stop the demo (and every pending wait) when the screen unmounts.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const delay = ms =>
    new Promise(resolve => {
      const id = setTimeout(() => {
        timers.current.delete(id);
        resolve();
      }, ms);
      timers.current.add(id);
    });

  const startDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    toast.hideAll();
    await delay(300);

    // ===== 1. DEFAULT SUCCESS =====
    toast.success('Top toast layout', {
      position: 'top',
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 2. DEFAULT ERROR =====
    toast.error('Bottom toast layout', {
      position: 'bottom',
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 3. DEFAULT WARNING =====
    toast.warning('Top-left toast layout', {
      position: 'top-left',
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 4. DEFAULT INFO =====
    toast.info('Top-right toast layout', {
      position: 'top-right',
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 5. CUSTOM TOAST =====
    toast.show({
      type: 'custom',
      position: 'bottom-left',
      title: 'Custom toast',
      message: 'Custom toast at bottom-left',
      backgroundColor: '#1E1B4B',
      textColor: '#EEF2FF',
      borderColor: '#818CF8',
      borderRadius: 28,
      padding: 18,
      shadow: {
        color: '#4338CA',
        opacity: 0.5,
        radius: 18,
        offsetY: 8,
        elevation: 10,
      },
      icon: renderRocketIcon,
      iconColor: '#C7D2FE',
      titleStyle: { letterSpacing: 0.5 },
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 6. CUSTOM RENDER FUNCTION =====
    toast.show({
      type: 'custom',
      position: 'bottom-right',
      duration: 1500,
      progress: true,
      closeButton: true,
      render: renderCustomToast,
    });
    await delay(1600);

    // ===== 7. CENTER POSITION =====
    toast.success('Center toast layout', {
      position: 'center',
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 8. TITLE AND DESCRIPTION =====
    toast.success({
      title: 'Profile saved',
      description: 'Everyone can see your new photo.',
      position: 'top',
      duration: 1500,
    });
    await delay(1600);

    // ===== 9. HIDDEN TITLE (title: '') =====
    toast.error('Could not reach the server.', {
      title: '',
      position: 'bottom',
      duration: 1500,
    });
    await delay(1600);

    // ===== 10. UPDATE A TOAST IN PLACE (same id) =====
    toast.show({
      id: 'upload',
      type: 'info',
      title: 'Uploading',
      description: 'Please wait...',
      position: 'top',
      duration: 0,
    });
    await delay(1200);
    toast.show({
      id: 'upload',
      type: 'success',
      title: 'Uploaded',
      description: 'Your file is ready.',
      position: 'top',
      duration: 1500,
      progress: true,
    });
    await delay(1600);

    // ===== 11. ACTION BUTTON =====
    toast.show({
      type: 'success',
      title: 'Item deleted',
      position: 'bottom',
      duration: 1500,
      action: { label: 'Undo' },
    });

    await delay(2500);
    toast.hideAll();
    setIsRunning(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={startDemo}
        disabled={isRunning}
        activeOpacity={0.85}
      >
        {isRunning ? (
          <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
        ) : (
          <Text style={styles.icon}>▶️</Text>
        )}
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Demo...' : 'Start Toast Demo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#000000',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#555555',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spinner: {
    marginRight: 8,
  },
  emoji: {
    fontSize: 22,
  },
  renderRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  renderText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
