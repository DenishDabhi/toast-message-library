import { useContext } from 'react';
import ToastContext from '../context/ToastContext';

export default function useToast() {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error(
      '[react-native-toast-message-library] useToast() was called outside of a <ToastProvider>. ' +
        'Wrap your app (usually in App.js) with <ToastProvider>...</ToastProvider>.',
    );
  }
  return api;
}
