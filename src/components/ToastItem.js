import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  getAnimatedStyle,
  resolveAnimation,
  runToastAnimation,
} from '../animations/toastAnimations';
import { TYPE_LABELS } from '../utils/constants';
import ToastAction from './ToastAction';
import ToastIcon from './ToastIcon';
import ToastProgress from './ToastProgress';

const SWIPE_THRESHOLD = 80;

function buildShadow(theme, shadow) {
  if (shadow === false) {
    return { elevation: 0 };
  }
  const s = { ...theme.shadow, ...(shadow || {}) };
  return {
    shadowColor: s.color,
    shadowOpacity: s.opacity,
    shadowRadius: s.radius,
    shadowOffset: { width: 0, height: s.offsetY },
    elevation: s.elevation,
  };
}

function vibrate() {
  try {
    Vibration.vibrate([0, 30, 60, 30]);
  } catch (error) {
    // Missing VIBRATE permission on Android must never break the toast.
  }
}

function ToastItem({ entry, manager, theme, reducedMotion, announce, width }) {
  const { options, status, paused, remaining } = entry;
  const { id, type, position } = options;
  const { width: windowWidth } = useWindowDimensions();

  const animation = resolveAnimation(options.animation, reducedMotion);
  const animationRef = useRef({
    animation,
    duration: options.animationDuration,
  });
  animationRef.current = { animation, duration: options.animationDuration };

  const initial = animation === 'none' ? 1 : 0;
  const progress = useRef(new Animated.Value(initial)).current;
  const swipeX = useRef(new Animated.Value(0)).current;

  const palette = theme.colors[type] || theme.colors.custom;
  const colors = {
    background: options.backgroundColor || palette.background,
    text: options.textColor || palette.text,
    border: options.borderColor || palette.border,
    icon: options.iconColor || palette.icon,
  };
  const typography = theme.typography;
  const fontFamily = typography.fontFamily;

  const title = options.title === undefined ? TYPE_LABELS[type] : options.title;
  const showTitle = title !== null && title !== '' && title !== undefined;
  const label =
    options.accessibilityLabel ||
    [
      TYPE_LABELS[type],
      showTitle && title !== TYPE_LABELS[type] ? title : '',
      options.message,
    ]
      .filter(Boolean)
      .join('. ');

  // Latest values for the long-lived PanResponder and callbacks.
  const live = useRef({});
  live.current = { options, status, windowWidth };

  // Enter / exit lifecycle.
  useEffect(() => {
    let handle = null;
    if (status === 'visible') {
      handle = runToastAnimation(progress, 1, animationRef.current);
    } else {
      handle = runToastAnimation(progress, 0, animationRef.current, result => {
        if (result.finished) {
          manager.remove(id);
        }
      });
    }
    return () => {
      if (handle) {
        handle.stop();
      }
    };
  }, [status, id, manager, progress]);

  // Mount-only side effects: haptics and iOS announcement.
  useEffect(() => {
    if (options.haptics) {
      vibrate(type);
    }
    if (Platform.OS === 'ios' && label) {
      announce(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const info = { id, type, hide: () => manager.hide(id) };
  const actionFired = useRef(false);
  useEffect(() => {
    actionFired.current = false;
  }, [status]);

  const handlePress = () => {
    if (live.current.status !== 'visible') {
      return;
    }
    if (live.current.options.onPress) {
      live.current.options.onPress(info);
    }
    if (live.current.options.dismissOnPress) {
      manager.hide(id, 'press');
    }
  };

  const handleAction = () => {
    const current = live.current;
    if (current.status !== 'visible' || actionFired.current) {
      return;
    }
    if (current.options.dismissOnAction) {
      actionFired.current = true;
    }
    if (current.options.onAction) {
      current.options.onAction(info);
    }
    if (current.options.dismissOnAction) {
      manager.hide(id, 'action');
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          live.current.options.swipeToDismiss &&
          live.current.status === 'visible' &&
          Math.abs(g.dx) > 8 &&
          Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderGrant: () => manager.pause(id),
        onPanResponderMove: (_, g) => swipeX.setValue(g.dx),
        onPanResponderTerminationRequest: () => true,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > SWIPE_THRESHOLD || Math.abs(g.vx) > 0.9) {
            const direction = g.dx >= 0 ? 1 : -1;
            manager.hide(id, 'swipe');
            Animated.timing(swipeX, {
              toValue: direction * live.current.windowWidth,
              duration: 180,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(swipeX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            manager.resume(id);
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          manager.resume(id);
        },
      }),
    [id, manager, swipeX],
  );

  const innerRadius = Math.max(
    0,
    (options.borderRadius != null ? options.borderRadius : theme.borderRadius) -
      theme.borderWidth,
  );
  const padding = options.padding != null ? options.padding : theme.padding;

  const outerStyle = [
    styles.container,
    {
      width,
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: theme.borderWidth,
      borderRadius:
        options.borderRadius != null
          ? options.borderRadius
          : theme.borderRadius,
    },
    buildShadow(theme, options.shadow),
    getAnimatedStyle(animation, progress, position),
    {
      transform: [
        ...(getAnimatedStyle(animation, progress, position).transform || []),
        { translateX: swipeX },
      ],
    },
    options.containerStyle,
  ];

  const textFont = fontFamily ? { fontFamily } : null;

  const body = options.render ? (
    options.render({ ...info, colors, theme })
  ) : (
    <>
      <ToastIcon
        type={type}
        icon={options.icon}
        color={colors.icon}
        glyphColor={palette.iconText}
        size={theme.iconSize}
      />
      <View style={styles.texts}>
        {showTitle ? (
          <Text
            maxFontSizeMultiplier={1.6}
            style={[
              textFont,
              {
                color: colors.text,
                fontSize: typography.titleSize,
                fontWeight: typography.titleWeight,
              },
              options.titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}
        {options.message ? (
          <Text
            maxFontSizeMultiplier={1.6}
            style={[
              textFont,
              {
                color: colors.text,
                fontSize: typography.messageSize,
                fontWeight: typography.messageWeight,
              },
              showTitle && styles.messageGap,
              options.messageStyle,
            ]}
          >
            {options.message}
          </Text>
        ) : null}
      </View>
    </>
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      pointerEvents={status === 'visible' ? 'auto' : 'none'}
      style={outerStyle}
      testID={`toast-${id}`}
    >
      <View style={[styles.clip, { borderRadius: innerRadius }]}>
        <View style={[styles.row, { padding }]}>
          <Pressable
            accessibilityRole={options.onPress ? 'button' : 'alert'}
            accessibilityLabel={
              options.render ? options.accessibilityLabel : label
            }
            accessibilityLiveRegion="polite"
            onPress={handlePress}
            onPressIn={() => manager.pause(id)}
            onPressOut={() => manager.resume(id)}
            style={styles.body}
          >
            {body}
          </Pressable>
          {options.action ? (
            <ToastAction
              label={options.action.label}
              accessibilityLabel={options.action.accessibilityLabel}
              color={theme.actionColor || colors.icon}
              fontFamily={fontFamily}
              onPress={handleAction}
            />
          ) : null}
          {options.closeButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                options.closeAccessibilityLabel || 'Dismiss notification'
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => manager.hide(id, 'close')}
              style={styles.close}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.closeGlyph,
                  { color: theme.closeColor || colors.text },
                ]}
              >
                ✕
              </Text>
            </Pressable>
          ) : null}
        </View>
        {options.progress && options.duration > 0 ? (
          <ToastProgress
            duration={options.duration}
            remaining={remaining}
            paused={paused || status !== 'visible'}
            color={colors.icon}
            trackColor={theme.progressTrack}
          />
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'auto' },
  clip: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  texts: { flex: 1 },
  messageGap: { marginTop: 2 },
  close: {
    width: 32,
    height: 32,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: { fontSize: 16, fontWeight: '600' },
});

export default React.memo(ToastItem);
