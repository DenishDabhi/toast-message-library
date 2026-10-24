import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src';
import ToastDemoScreen from './demo/screens/ToastDemoScreen';

export default function App() {
  const system = useColorScheme();
  const [theme, setTheme] = useState('system');
  const isDark = theme === 'dark' || (theme === 'system' && system === 'dark');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ToastProvider
        global
        theme={theme}
        position="top"
        duration={3000}
        animation="slide"
        maxVisible={3}
      >
        <View style={[styles.root, isDark ? styles.dark : styles.light]}>
          <ToastDemoScreen
            theme={theme}
            onThemeChange={setTheme}
            isDark={isDark}
          />
        </View>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  light: { backgroundColor: '#F2F4F7' },
  dark: { backgroundColor: '#0C111D' },
});
