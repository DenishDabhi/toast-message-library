// import React, { useRef, useState } from 'react';
// import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Toast, useToast } from '../../src';
// import {
//   Button,
//   Chips,
//   Section,
//   ToggleRow,
//   palette,
// } from '../components/Controls';

// const POSITIONS = [
//   'top',
//   'bottom',
//   'center',
//   'top-left',
//   'top-right',
//   'bottom-left',
//   'bottom-right',
// ].map(value => ({ value, label: value }));
// const ANIMATIONS = ['slide', 'fade', 'zoom', 'none'].map(value => ({
//   value,
//   label: value,
// }));
// const DURATIONS = [
//   { value: 1000, label: '1 s' },
//   { value: 3000, label: '3 s' },
//   { value: 6000, label: '6 s' },
// ];
// const THEMES = ['system', 'light', 'dark'].map(value => ({
//   value,
//   label: value,
// }));

// const LONG_MESSAGE =
//   'This is a deliberately long notification used to check wrapping. It keeps going across ' +
//   'several lines so that you can verify the layout, the close button, the action button and ' +
//   'dynamic font scaling all behave when the text does not fit on one line.';

// export default function ToastDemoScreen({ theme, onThemeChange, isDark }) {
//   const toast = useToast();
//   const insets = useSafeAreaInsets();
//   const colors = palette(isDark);

//   const [position, setPosition] = useState('top');
//   const [animation, setAnimation] = useState('slide');
//   const [duration, setDuration] = useState(3000);
//   const [closeButton, setCloseButton] = useState(false);
//   const [progress, setProgress] = useState(false);
//   const [swipe, setSwipe] = useState(true);
//   const [haptics, setHaptics] = useState(false);
//   const [log, setLog] = useState('Callbacks will be logged here.');
//   const counter = useRef(0);

//   const shared = {
//     position,
//     animation,
//     duration,
//     closeButton,
//     progress,
//     swipeToDismiss: swipe,
//     haptics,
//     onDismiss: (reason, id) => setLog(`onDismiss(${reason}) for ${id}`),
//   };

//   const next = () => {
//     counter.current += 1;
//     return counter.current;
//   };

//   const showCustom = () =>
//     toast.show({
//       ...shared,
//       type: 'custom',
//       title: 'Custom toast',
//       message: 'Custom colours, radius, icon and shadow.',
//       backgroundColor: '#1E1B4B',
//       textColor: '#EEF2FF',
//       borderColor: '#818CF8',
//       borderRadius: 28,
//       padding: 18,
//       shadow: {
//         color: '#4338CA',
//         opacity: 0.5,
//         radius: 18,
//         offsetY: 8,
//         elevation: 10,
//       },
//       icon: ({ color }) => <Text style={[styles.emoji, { color }]}>🚀</Text>,
//       iconColor: '#C7D2FE',
//       titleStyle: { letterSpacing: 0.5 },
//     });

//   return (
//     <ScrollView
//       contentContainerStyle={[
//         styles.content,
//         { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
//       ]}
//       keyboardShouldPersistTaps="handled"
//     >
//       <Text
//         accessibilityRole="header"
//         style={[styles.heading, { color: colors.text }]}
//       >
//         react-native-toast-message-library
//       </Text>
//       <Text style={[styles.lead, { color: colors.sub }]}>
//         Tap a button. Settings below apply to every toast fired from this
//         screen.
//       </Text>

//       <Section title="1 · Toast types" colors={colors}>
//         <Button
//           colors={colors}
//           color="#079455"
//           label="Show success"
//           onPress={() => toast.success('Your changes have been saved.', shared)}
//         />
//         <Button
//           colors={colors}
//           color="#D92D20"
//           label="Show error"
//           onPress={() => toast.error('Could not reach the server.', shared)}
//         />
//         <Button
//           colors={colors}
//           color="#B54708"
//           label="Show warning"
//           onPress={() => toast.warning('Your storage is almost full.', shared)}
//         />
//         <Button
//           colors={colors}
//           color="#1570EF"
//           label="Show info"
//           onPress={() => toast.info('A new version is available.', shared)}
//         />
//         <Button colors={colors} label="Show custom" onPress={showCustom} />
//       </Section>

//       <Section
//         title="2 · Position"
//         subtitle="All seven positions, respecting safe-area insets."
//         colors={colors}
//       >
//         <Chips
//           colors={colors}
//           options={POSITIONS}
//           value={position}
//           onChange={setPosition}
//         />
//         <Button
//           colors={colors}
//           outline
//           label={`Show at "${position}"`}
//           onPress={() => toast.info(`Positioned at ${position}`, shared)}
//         />
//       </Section>

//       <Section title="3 · Animation" colors={colors}>
//         <Chips
//           colors={colors}
//           options={ANIMATIONS}
//           value={animation}
//           onChange={setAnimation}
//         />
//         <Button
//           colors={colors}
//           outline
//           label={`Show with "${animation}"`}
//           onPress={() => toast.success(`Animation: ${animation}`, shared)}
//         />
//       </Section>

//       <Section title="4 · Duration & persistence" colors={colors}>
//         <Chips
//           colors={colors}
//           options={DURATIONS}
//           value={duration}
//           onChange={setDuration}
//         />
//         <Button
//           colors={colors}
//           outline
//           label={`Show for ${duration / 1000}s`}
//           onPress={() => toast.info(`Gone in ${duration / 1000}s`, shared)}
//         />
//         <Button
//           colors={colors}
//           label="Show persistent toast (duration 0)"
//           onPress={() =>
//             toast.warning('I stay until you dismiss me.', {
//               ...shared,
//               duration: 0,
//               closeButton: true,
//             })
//           }
//         />
//       </Section>

//       <Section title="5 · Dismiss" colors={colors}>
//         <Button
//           colors={colors}
//           outline
//           label="Show toast with id “demo-specific”"
//           onPress={() =>
//             toast.info('Dismiss me with the button below.', {
//               ...shared,
//               id: 'demo-specific',
//               duration: 0,
//             })
//           }
//         />
//         <Button
//           colors={colors}
//           label="Hide “demo-specific”"
//           onPress={() =>
//             setLog(`hide('demo-specific') -> ${toast.hide('demo-specific')}`)
//           }
//         />
//         <Button
//           colors={colors}
//           color="#D92D20"
//           label="Hide all"
//           onPress={() =>
//             setLog(`hideAll() dismissed ${toast.hideAll()} toast(s)`)
//           }
//         />
//         <Button
//           colors={colors}
//           outline
//           label="isVisible()?"
//           onPress={() => setLog(`isVisible() -> ${toast.isVisible()}`)}
//         />
//       </Section>

//       <Section
//         title="6 · Queue & stress"
//         subtitle="Provider maxVisible is 3; the rest wait (FIFO)."
//         colors={colors}
//       >
//         <Button
//           colors={colors}
//           label="Queue 6 toasts"
//           onPress={() => {
//             for (let i = 1; i <= 6; i += 1) {
//               toast.info(`Queued toast #${i}`, { ...shared, duration: 2000 });
//             }
//           }}
//         />
//         <Button
//           colors={colors}
//           outline
//           label="Fire 12 rapid toasts"
//           onPress={() => {
//             const types = ['success', 'error', 'warning', 'info'];
//             for (let i = 0; i < 12; i += 1) {
//               toast[types[i % 4]](`Rapid toast ${i + 1}`, {
//                 ...shared,
//                 duration: 1500,
//               });
//             }
//           }}
//         />
//       </Section>

//       <Section title="7 · Actions & callbacks" colors={colors}>
//         <Button
//           colors={colors}
//           label="Undo action"
//           onPress={() =>
//             toast.show({
//               ...shared,
//               type: 'success',
//               message: 'Message deleted.',
//               action: { label: 'Undo', accessibilityLabel: 'Undo delete' },
//               duration: 6000,
//               onAction: () => toast.info('Delete undone.', shared),
//             })
//           }
//         />
//         <Button
//           colors={colors}
//           outline
//           label="Retry action (stays after press)"
//           onPress={() => {
//             const n = next();
//             toast.show({
//               ...shared,
//               type: 'error',
//               message: 'Upload failed.',
//               action: { label: 'Retry' },
//               dismissOnAction: false,
//               duration: 0,
//               closeButton: true,
//               onAction: ({ hide }) => {
//                 setLog(`Retry pressed (#${n})`);
//                 setTimeout(hide, 600);
//               },
//             });
//           }}
//         />
//         <Button
//           colors={colors}
//           outline
//           label="Tappable toast (onPress)"
//           onPress={() =>
//             toast.info('Tap this toast to open it.', {
//               ...shared,
//               onPress: () => setLog('Toast body pressed'),
//               dismissOnPress: true,
//             })
//           }
//         />
//       </Section>

//       <Section title="8 · Content" colors={colors}>
//         <Button
//           colors={colors}
//           label="Long, multi-line message"
//           onPress={() =>
//             toast.show({
//               ...shared,
//               type: 'info',
//               title: 'Long content',
//               message: LONG_MESSAGE,
//               action: { label: 'View' },
//               closeButton: true,
//               duration: 8000,
//             })
//           }
//         />
//         <Button
//           colors={colors}
//           outline
//           label="Custom render content"
//           onPress={() =>
//             toast.show({
//               ...shared,
//               type: 'custom',
//               render: ({ colors: c, hide }) => (
//                 <View style={styles.renderRow}>
//                   <Text style={[styles.renderText, { color: c.text }]}>
//                     🎉 Fully custom layout
//                   </Text>
//                   <Text
//                     onPress={hide}
//                     style={[styles.renderText, { color: c.icon }]}
//                   >
//                     Close
//                   </Text>
//                 </View>
//               ),
//             })
//           }
//         />
//         <Button
//           colors={colors}
//           outline
//           label="Global API (Toast.success)"
//           onPress={() => Toast.success('Fired through the global API.', shared)}
//         />
//       </Section>

//       <Section title="9 · Options" colors={colors}>
//         <ToggleRow
//           colors={colors}
//           label="Close button"
//           value={closeButton}
//           onChange={setCloseButton}
//         />
//         <ToggleRow
//           colors={colors}
//           label="Progress bar"
//           value={progress}
//           onChange={setProgress}
//         />
//         <ToggleRow
//           colors={colors}
//           label="Swipe to dismiss"
//           value={swipe}
//           onChange={setSwipe}
//         />
//         <ToggleRow
//           colors={colors}
//           label="Haptics (vibration)"
//           value={haptics}
//           onChange={setHaptics}
//         />
//       </Section>

//       <Section title="10 · Theme" colors={colors}>
//         <Chips
//           colors={colors}
//           options={THEMES}
//           value={theme}
//           onChange={onThemeChange}
//         />
//         <Button
//           colors={colors}
//           outline
//           label="Show one of each type"
//           onPress={() =>
//             ['success', 'error', 'warning', 'info'].forEach(t =>
//               toast[t](`${t} in ${theme} theme`, shared),
//             )
//           }
//         />
//       </Section>

//       <View
//         style={[styles.log, { backgroundColor: colors.chip }]}
//         accessibilityLiveRegion="polite"
//       >
//         <Text style={[styles.logText, { color: colors.text }]}>{log}</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   content: { paddingHorizontal: 16 },
//   heading: { fontSize: 26, fontWeight: '800' },
//   lead: { fontSize: 14, marginTop: 4, marginBottom: 16 },
//   emoji: { fontSize: 22 },
//   renderRow: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   renderText: { fontSize: 15, fontWeight: '700' },
//   log: { borderRadius: 12, padding: 12 },
//   logText: {
//     fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
//     fontSize: 12,
//   },
// });

import React, { useState } from 'react';
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

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

    // ===== 6. ACTION TOAST (Library's action style) =====
    // toast.show({
    //   type: 'success',
    //   position: 'bottom-right',
    //   message: 'Message deleted.',
    //   duration: 1500,
    //   progress: true,
    //   closeButton: true,
    //   onAction: () => toast.info('Delete undone.', { duration: 1500 }),
    // });
    // await delay(1600);

    // ===== 7. CUSTOM RENDER (Library's render functionality) =====
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

    // ===== 8. QUEUE TEST (All positions rapid fire) =====
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
