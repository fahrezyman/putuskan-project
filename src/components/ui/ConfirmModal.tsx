import { useState, useEffect, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

let resolver: ((value: boolean) => void) | null = null;
let externalOpen: ((opts: ConfirmOptions) => void) | null = null;

export function confirmModal(options: ConfirmOptions | string): Promise<boolean> {
  const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
  return new Promise((resolve) => {
    resolver = resolve;
    externalOpen?.(opts);
  });
}

export default function ConfirmModalContainer() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  const close = useCallback((result: boolean) => {
    resolver?.(result);
    resolver = null;
    setOpts(null);
  }, []);

  useEffect(() => {
    externalOpen = (o) => setOpts(o);
    return () => { externalOpen = null; };
  }, []);

  useEffect(() => {
    if (!opts) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [opts, close]);

  if (!opts) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={() => close(false)}
    >
      <div className="brutal-card bg-white p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {opts.title && <h2 className="text-lg font-bold mb-2">{opts.title}</h2>}
        <p className="text-sm text-[#333333] mb-6">{opts.message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => close(false)}
            className="brutal-btn px-4 py-2 bg-white text-[#1A1A1A] text-sm font-bold"
          >
            {opts.cancelLabel ?? 'Batal'}
          </button>
          <button
            onClick={() => close(true)}
            className={`brutal-btn px-4 py-2 text-white text-sm font-bold ${opts.danger ? 'bg-red-600' : 'bg-[#FF3D00]'}`}
          >
            {opts.confirmLabel ?? 'Ya, lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
}
