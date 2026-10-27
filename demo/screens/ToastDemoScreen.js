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

export default function ToastUltimateDemoScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [isRunning, setIsRunning] = useState(false);

  const timers = useRef(new Set());

  // Stop the demo (and every pending wait) when the screen unmounts
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

    // ===== 1. DEFAULT SUCCESS (Library's original design) =====
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

    // ===== 5. CUSTOM TOAST (Library's design language) =====
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
      icon: ({ color }) => <Text style={[styles.emoji, { color }]}>🚀</Text>,
      iconColor: '#C7D2FE',
      titleStyle: { letterSpacing: 0.5 },
      duration: 1500,
      progress: true,
      closeButton: true,
    });
    await delay(1600);

    // ===== 6. CUSTOM RENDER (Library's render functionality) =====
    toast.show({
      type: 'custom',
      position: 'bottom-right',
      duration: 1500,
      progress: true,
      closeButton: true,
      render: ({ colors, hide }) => (
        <View style={styles.renderRow}>
          <Text style={[styles.renderText, { color: colors.text }]}>
            🎉 Fully custom layout bottom right
          </Text>
        </View>
      ),
    });
    await delay(1600);

    // ===== 7. QUEUE TEST (All positions rapid fire) =====
    toast.success('Center toast layout', {
      position: 'center',
      duration: 1500,
      progress: true,
      closeButton: true,
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
          <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
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
  hintText: {
    marginTop: 32,
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
