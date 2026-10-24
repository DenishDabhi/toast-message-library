import React, { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import useReducedMotion from '../hooks/useReducedMotion';
import { POSITIONS } from '../utils/constants';
import createAnnouncer from '../utils/createAnnouncer';
import useToastInsets from '../utils/safeArea';
import ToastItem from './ToastItem';

const SIDE_MARGIN = 16;
const MAX_WIDTH = 480;

function groupStyle(position, insets, offset) {
  const horizontal = {
    paddingLeft: SIDE_MARGIN + insets.left + offset.x,
    paddingRight: SIDE_MARGIN + insets.right + offset.x,
  };
  const alignItems = position.endsWith('left')
    ? 'flex-start'
    : position.endsWith('right')
    ? 'flex-end'
    : 'center';
  const base = {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems,
    ...horizontal,
  };
  if (position.startsWith('top')) {
    return { ...base, top: insets.top + offset.y };
  }
  if (position.startsWith('bottom')) {
    return { ...base, bottom: insets.bottom + offset.y };
  }
  return { ...base, top: 0, bottom: 0, justifyContent: 'center' };
}

export default function ToastContainer({
  manager,
  theme,
  spacing,
  offset,
  insets: insetsProp,
}) {
  const snapshot = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    manager.getSnapshot,
  );
  const reducedMotion = useReducedMotion();
  const insets = useToastInsets(insetsProp);
  const { width: windowWidth } = useWindowDimensions();
  const announcer = useRef(null);
  if (!announcer.current) {
    announcer.current = createAnnouncer();
  }
  useEffect(() => () => announcer.current.cancel(), []);

  const toastWidth = Math.min(
    MAX_WIDTH,
    windowWidth - 2 * SIDE_MARGIN - insets.left - insets.right - 2 * offset.x,
  );

  const groups = useMemo(() => {
    const map = {};
    snapshot.toasts.forEach(entry => {
      const key = entry.options.position;
      (map[key] = map[key] || []).push(entry);
    });
    return map;
  }, [snapshot]);

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {POSITIONS.filter(position => groups[position]).map(position => (
        <View
          key={position}
          pointerEvents="box-none"
          style={groupStyle(position, insets, offset)}
        >
          {groups[position].map((entry, index) => (
            <View
              key={entry.id}
              pointerEvents="box-none"
              style={index === 0 ? null : { marginTop: spacing }}
            >
              <ToastItem
                entry={entry}
                manager={manager}
                theme={theme}
                reducedMotion={reducedMotion}
                announce={announcer.current.announce}
                width={toastWidth}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});
