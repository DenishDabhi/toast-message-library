// Compile-time check of the public typings (run with `npm run typecheck`).
import React from 'react';
import { Text } from 'react-native';
import {
  Toast,
  ToastProvider,
  createTheme,
  useToast,
  type ToastDismissReason,
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
  toast.error({ title: 'Oops', message: 'x' });
  const hidden: boolean = toast.hide(id);
  const count: number = toast.hideAll();
  toast.isVisible();
  Toast.info('global');
  // @ts-expect-error unknown position
  toast.show({ message: 'x', position: 'middle' });
  // @ts-expect-error unknown animation
  toast.show({ message: 'x', animation: 'spin' });
  return (
    <ToastProvider
      theme={createTheme('dark', { borderRadius: 4, colors: { info: { background: '#000' } } })}
      maxVisible={2}
      global>
      <Text>{String(hidden) + count}</Text>
    </ToastProvider>
  );
}
