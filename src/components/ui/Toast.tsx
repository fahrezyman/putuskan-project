import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let externalAdd: ((msg: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  externalAdd?.(message, type);
}

const styles: Record<ToastType, string> = {
  success: 'bg-white border-[#1A1A1A] text-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A]',
  error: 'bg-white border-red-600 text-red-600 shadow-[4px_4px_0px_#dc2626]',
  info: 'bg-white border-[#FF3D00] text-[#FF3D00] shadow-[4px_4px_0px_#FF3D00]',
};

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    externalAdd = add;

    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      add(message, type ?? 'success');
    };
    window.addEventListener('show-toast', handler);
    return () => {
      externalAdd = null;
      window.removeEventListener('show-toast', handler);
    };
  }, [add]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 border-2 px-4 py-3 font-bold text-sm min-w-[220px] pointer-events-auto animate-in ${styles[t.type]}`}
          style={{ animation: 'slideIn 0.15s ease' }}
        >
          <span className="text-base">{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
