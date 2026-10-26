import React, { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import useReducedMotion from '../hooks/useReducedMotion';
import { POSITIONS } from '../utils/constants';
import createAnnouncer from '../utils/createAnnouncer';
import useToastInsets from '../utils/safeArea';
import ToastItem from './ToastItem';

// Own full-screen style. Newer React Native versions no longer provide
// StyleSheet.absoluteFillObject, which silently left the overlay in normal
// layout flow (content-sized and pushed to the bottom of the screen).
const FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const SIDE_MARGIN = 16;
// Full-width positions (top / bottom / center) stop growing at this width.
const MAX_WIDTH = 480;
// Corner positions are narrower on purpose, otherwise on a phone
// "top-left" / "top-right" would look identical to "top".
const CORNER_MAX_WIDTH = 340;
const CORNER_WIDTH_RATIO = 0.82;

function isLeft(position) {
  return position.endsWith('left');
}

function isRight(position) {
  return position.endsWith('right');
}

function groupStyle(position, insets, offset) {
  const top = position.startsWith('top');
  const bottom = position.startsWith('bottom');
  // Every position uses the SAME mechanism: a full-screen layer whose content
  // is aligned with flexbox. No position uses `top` / `bottom` keys, so top,
  // center and bottom all behave identically.
  return {
    ...FILL,
    justifyContent: top ? 'flex-start' : bottom ? 'flex-end' : 'center',
    alignItems: isLeft(position)
      ? 'flex-start'
      : isRight(position)
      ? 'flex-end'
      : 'center',
    paddingTop: insets.top + (top ? offset.y : 0),
    paddingBottom: insets.bottom + (bottom ? offset.y : 0),
    paddingLeft: SIDE_MARGIN + insets.left + offset.x,
    paddingRight: SIDE_MARGIN + insets.right + offset.x,
  };
}

function toastWidth(position, windowWidth, insets, offset, extraX) {
  const available = Math.max(
    0,
    windowWidth - 2 * SIDE_MARGIN - insets.left - insets.right - 2 * offset.x,
  );
  const corner = isLeft(position) || isRight(position);
  const limit = corner
    ? Math.min(CORNER_MAX_WIDTH, Math.round(available * CORNER_WIDTH_RATIO))
    : MAX_WIDTH;
  return Math.max(0, Math.min(limit, available - (corner ? extraX : 0)));
}

/** Margins for the per-toast `offsetX` / `offsetY` options. */
function entryStyle(position, index, spacing, options) {
  const x = options.offsetX || 0;
  const y = options.offsetY || 0;
  const style = {};
  style.marginTop = index === 0 ? 0 : spacing;
  if (position.startsWith('top')) {
    style.marginTop += y;
  } else if (position.startsWith('bottom')) {
    style.marginBottom = y;
  }
  if (isLeft(position)) {
    style.marginLeft = x;
  } else if (isRight(position)) {
    style.marginRight = x;
  }
  return style;
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
          collapsable={false}
          pointerEvents="box-none"
          style={groupStyle(position, insets, offset)}
        >
          {groups[position].map((entry, index) => (
            <View
              key={entry.id}
              collapsable={false}
              pointerEvents="box-none"
              style={entryStyle(position, index, spacing, entry.options)}
            >
              <ToastItem
                entry={entry}
                manager={manager}
                theme={theme}
                reducedMotion={reducedMotion}
                announce={announcer.current.announce}
                width={toastWidth(
                  position,
                  windowWidth,
                  insets,
                  offset,
                  entry.options.offsetX || 0,
                )}
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
    ...FILL,
    zIndex: 9999,
    elevation: 9999,
  },
});
