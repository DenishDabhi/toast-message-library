// Compile-time check of the public typings (run with `npm run typecheck`).
import React from 'react';
import { Text } from 'react-native';
import {
  Toast,
  ToastProvider,
  createTheme,
  useToast,
  type ToastDismissReason,
  type ToastOptions,
  type ToastTitles,
} from 'react-native-toast-message-library';

export function Demo() {
  const toast = useToast();
  const id: string = toast.show({
    type: 'success',
    title: 'Saved',
    message: 'Done',
    duration: 0,
    position: 'bottom-right',
    animation: 'zoom',
    action: { label: 'Undo' },
    icon: ({ color }) => <Text style={{ color }}>*</Text>,
    onAction: info => info.hide(),
    onDismiss: (reason: ToastDismissReason, toastId: string) => void (reason + toastId),
  });
  toast.success('ok', { closeButton: true });
  toast.success(42);
  toast.error('Card declined.', { title: 'Payment failed' });
  toast.info({ title: 'Update', description: 'Version 2.0 is available.' });
  toast.show(7);
  const options: ToastOptions = { type: 'info', title: null, description: 'Body' };
  toast.show(options);
  const titles: ToastTitles = { success: 'Done', error: '' };
  toast.error({ title: 'Oops', message: 'x' });
  const hidden: boolean = toast.hide(id);
  const count: number = toast.hideAll();
  toast.isVisible();
  Toast.info('global');
  // @ts-expect-error unknown position
  toast.show({ message: 'x', position: 'middle' });
  // @ts-expect-error unknown title type
  const badTitles: ToastTitles = { warn: 'x' };
  void badTitles;
  // @ts-expect-error unknown animation
  toast.show({ message: 'x', animation: 'spin' });
  return (
    <ToastProvider
      theme={createTheme('dark', { borderRadius: 4, colors: { info: { background: '#000' } } })}
      maxVisible={2}
      titles={titles}
      offset={{ y: 56 }}
      insets={{ bottom: 24 }}
      global>
      <Text>{String(hidden) + count}</Text>
    </ToastProvider>
  );
}
