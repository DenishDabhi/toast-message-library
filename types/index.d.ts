import * as React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'custom';
export type ToastPosition =
  | 'top'
  | 'bottom'
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type ToastAnimation = 'fade' | 'slide' | 'zoom' | 'none';
export type ToastDismissReason =
  | 'timeout'
  | 'manual'
  | 'swipe'
  | 'close'
  | 'action'
  | 'press'
  | 'hideAll';

export type ToastId = string;

/** Argument passed to onPress / onAction and to `render`. */
export interface ToastCallbackInfo {
  id: ToastId;
  type: ToastType;
  /** Dismisses this toast (reason "manual"). */
  hide: () => boolean;
}

export interface ToastColors {
  background: string;
  text: string;
  border: string;
  icon: string;
}

export interface ToastRenderInfo extends ToastCallbackInfo {
  colors: ToastColors;
  theme: ToastTheme;
}

export interface ToastShadow {
  color?: string;
  opacity?: number;
  radius?: number;
  offsetY?: number;
  elevation?: number;
}

export interface ToastAction {
  label: string;
  accessibilityLabel?: string;
}

export interface ToastOptions {
  /** Reusing an id updates that toast in place. Generated when omitted. */
  id?: string | number;
  type?: ToastType;
  /**
   * Heading of the toast. Defaults to the provider's `titles[type]`, then to
   * "Success" / "Error" / "Warning" / "Info" (no title for "custom").
   * Use '' or null to hide it.
   */
  title?: string | number | null;
  /** Body text. Same option as `description`; pass only one of them. */
  message?: string | number;
  /** Alias of `message`. Pass only one of them. */
  description?: string | number;
  /** ms. 0 keeps the toast until dismissed. Default 3000. */
  duration?: number;
  position?: ToastPosition;
  animation?: ToastAnimation;
  animationDuration?: number;
  /** Extra horizontal / vertical distance from the edge, added to the provider offset. */
  offsetX?: number;
  offsetY?: number;

  /** false hides the icon; an element or a function renders a custom one. */
  icon?:
    | false
    | React.ReactElement
    | ((info: { type: ToastType; color: string; size: number }) => React.ReactNode);
  /** Replaces the icon + title + message area. */
  render?: (info: ToastRenderInfo) => React.ReactNode;

  closeButton?: boolean;
  closeAccessibilityLabel?: string;
  swipeToDismiss?: boolean;
  progress?: boolean;
  haptics?: boolean;
  action?: ToastAction;
  dismissOnPress?: boolean;
  /** Default true. */
  dismissOnAction?: boolean;

  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  borderRadius?: number;
  padding?: number;
  /** false removes the shadow. */
  shadow?: false | ToastShadow;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;

  /** Called when the toast becomes visible (after leaving the queue). */
  onShow?: (id: ToastId) => void;
  onPress?: (info: ToastCallbackInfo) => void;
  onAction?: (info: ToastCallbackInfo) => void;
  /** Called once, when dismissal starts, also for toasts cancelled while queued. */
  onDismiss?: (reason: ToastDismissReason, id: ToastId) => void;
}

/** Options accepted by toast.success / error / warning / info (the type is fixed). */
export type ToastShortcutOptions = Omit<ToastOptions, 'type'>;

export interface ToastApi {
  /** Throws a TypeError on invalid options. Returns the toast id. */
  show(options: ToastOptions | string | number): ToastId;
  success(message: string | number | ToastShortcutOptions, options?: ToastShortcutOptions): ToastId;
  error(message: string | number | ToastShortcutOptions, options?: ToastShortcutOptions): ToastId;
  warning(message: string | number | ToastShortcutOptions, options?: ToastShortcutOptions): ToastId;
  info(message: string | number | ToastShortcutOptions, options?: ToastShortcutOptions): ToastId;
  /** true if a toast was dismissed (visible or queued). */
  hide(id: ToastId | number): boolean;
  /** Returns how many toasts were dismissed. */
  hideAll(): number;
  /** Without an id: is any toast visible? */
  isVisible(id?: ToastId | number): boolean;
}

export interface ToastTypeColors {
  background: string;
  text: string;
  border: string;
  icon: string;
  /** Colour of the glyph drawn inside the built-in icon badge. */
  iconText: string;
}

export interface ToastTheme {
  name: string;
  colors: Record<ToastType, ToastTypeColors>;
  actionColor?: string;
  closeColor?: string;
  progressTrack: string;
  borderRadius: number;
  borderWidth: number;
  padding: number;
  spacing: number;
  iconSize: number;
  typography: {
    titleSize: number;
    titleWeight: TextStyle['fontWeight'];
    messageSize: number;
    messageWeight: TextStyle['fontWeight'];
    fontFamily?: string;
  };
  shadow: Required<ToastShadow>;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type ToastThemeOverrides = DeepPartial<ToastTheme> & { extends?: 'light' | 'dark' };

export interface Insets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/** Default title per toast type. Use '' to hide the title for that type. */
export type ToastTitles = Partial<Record<ToastType, string>>;

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** 'system' follows the device colour scheme. Objects are merged over the light theme (or `extends`). */
  theme?: 'light' | 'dark' | 'system' | ToastThemeOverrides;
  position?: ToastPosition;
  duration?: number;
  animation?: ToastAnimation;
  animationDuration?: number;
  /** Max toasts on screen at once; the rest wait in a FIFO queue. Default 3. */
  maxVisible?: number;
  closeButton?: boolean;
  swipeToDismiss?: boolean;
  progress?: boolean;
  haptics?: boolean;
  /** Default title per toast type, e.g. { success: 'Done', error: '' }. Also used to translate titles. */
  titles?: ToastTitles;
  /** Gap between stacked toasts. Defaults to the theme's spacing. */
  spacing?: number;
  offset?: { x?: number; y?: number };
  /** Overrides detected safe-area insets. */
  insets?: Insets;
  /** Registers this provider for the imperative `Toast` API. */
  global?: boolean;
  /** Style of the wrapper View (default { flex: 1 }). */
  style?: StyleProp<ViewStyle>;
}

export const ToastProvider: React.FC<ToastProviderProps>;
export function useToast(): ToastApi;
/** Imperative API. Requires <ToastProvider global>; throws if none is mounted. */
export const Toast: ToastApi;
export function createTheme(base?: 'light' | 'dark', overrides?: ToastThemeOverrides): ToastTheme;
export const lightTheme: ToastTheme;
export const darkTheme: ToastTheme;
