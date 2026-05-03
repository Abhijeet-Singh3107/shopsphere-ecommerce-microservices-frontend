import { useEffect, useRef } from 'react';
import { useNotification } from '../../hooks/useNotification.js';

export default function Notification() {
  const { toasts, dismiss } = useNotification();
  const timers = useRef({});

  useEffect(() => {
    toasts.forEach((toast) => {
      if (!timers.current[toast.id]) {
        timers.current[toast.id] = setTimeout(() => {
          dismiss(toast.id);
          delete timers.current[toast.id];
        }, 4000);
      }
    });
  }, [toasts, dismiss]);

  const typeStyles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border-l-4 p-4 shadow-lg ${typeStyles[toast.type] ?? typeStyles.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-lg font-bold leading-none opacity-40 hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
