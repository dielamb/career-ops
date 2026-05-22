'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'error';
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastItem['variant']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastItem['variant'] = 'info') => {
    const id = `t-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-lg right-lg z-[100] flex flex-col gap-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastMessage key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastMessage({ toast }: { toast: ToastItem }) {
  const bgClass =
    toast.variant === 'success'
      ? 'bg-acid text-ink border-ink'
      : toast.variant === 'error'
        ? 'bg-magenta text-ink border-ink'
        : 'bg-ink text-paper border-chrome';

  return (
    <div
      role="status"
      className={`pointer-events-auto font-mono text-xs uppercase tracking-wider px-md py-sm border-[2.5px] shadow-[3px_3px_0_var(--color-chrome)] rounded-none min-w-[240px] max-w-[360px] ${bgClass}`}
    >
      {toast.message}
    </div>
  );
}
