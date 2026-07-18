import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

export type AlertLevel = 'success' | 'info' | 'warning' | 'error';

export type AlertItem = {
  id: string;
  level: AlertLevel;
  message: ReactNode;
};

export type AlertState = {
  alerts: AlertItem[];
};

export type AlertDispatch = {
  success(message: ReactNode): void;
  info(message: ReactNode): void;
  warning(message: ReactNode): void;
  error(message: ReactNode): void;
  remove(id: string): void;
  clear(): void;
};

const AlertStateContext = createContext<AlertState | null>(null);
const AlertDispatchContext = createContext<AlertDispatch | null>(null);

const AUTO_CLOSE: Record<AlertLevel, number | null> = {
  success: 3000,
  info: 5000,
  warning: null,
  error: null,
};

export function AlertProvider({ children }: PropsWithChildren) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const nextId = useRef(0);

  const remove = useCallback((id: string) => {
    setAlerts((current) => current.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => {
    setAlerts([]);
  }, []);

  const push = useCallback(
    (level: AlertLevel, message: ReactNode) => {
      const id = String(nextId.current++);
      setAlerts((current) => [
        ...current,
        {
          id,
          level,
          message,
        },
      ]);
      const timeout = AUTO_CLOSE[level];
      if (timeout != null) window.setTimeout(() => remove(id), timeout);
    },
    [remove]
  );

  const dispatch = useMemo<AlertDispatch>(
    () => ({
      success: (message) => push('success', message),
      info: (message) => push('info', message),
      warning: (message) => push('warning', message),
      error: (message) => push('error', message),
      remove,
      clear,
    }),
    [push, remove, clear]
  );

  const state = useMemo<AlertState>(() => ({ alerts }), [alerts]);

  return (
    <AlertDispatchContext.Provider value={dispatch}>
      <AlertStateContext.Provider value={state}>{children}</AlertStateContext.Provider>
    </AlertDispatchContext.Provider>
  );
}

export function useAlert(): AlertDispatch {
  const context = useContext(AlertDispatchContext);
  if (context == null) throw new Error('useAlert must be used within AlertProvider.');

  return context;
}

export function useAlertState(): AlertState {
  const context = useContext(AlertStateContext);
  if (context == null) throw new Error('useAlertState must be used within AlertProvider.');

  return context;
}
