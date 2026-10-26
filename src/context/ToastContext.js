import { createContext } from 'react';

/** null means "no ToastProvider above": useToast() turns that into an error. */
const ToastContext = createContext(null);
export default ToastContext;
