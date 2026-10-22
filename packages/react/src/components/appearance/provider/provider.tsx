'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  applyNxdsAppearance,
  DEFAULT_NXDS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  type NxdsAppearanceCookieOptions,
  type NxdsAppearanceState,
  type NxdsResolvedAppearanceMode,
  persistNxdsAppearance,
  prefersDarkColorScheme,
  readStoredNxdsAppearance,
  removeNxdsAppearance,
  resolveNxdsAppearanceMode,
  sanitizeNxdsAppearance,
  watchColorScheme,
} from '@nxds/core';

export interface NxdsAppearanceContextValue {
  state: NxdsAppearanceState;
  setState: Dispatch<SetStateAction<NxdsAppearanceState>>;
  resolvedMode: NxdsResolvedAppearanceMode;
  mounted: boolean;
  reset: () => void;
}

export interface NxdsAppearanceProviderProps {
  children: ReactNode;
  state?: NxdsAppearanceState;
  defaultState?: NxdsAppearanceState;
  onStateChange?: (state: NxdsAppearanceState) => void;
  /**
   * localStorage key for the saved appearance. The head script reads it before first paint and the provider after mount, overriding `defaultState`.
   * Pass `false` to turn it off.
   */
  storageKey?: string | false;
  /**
   * Cookie the provider writes so your server can render the saved appearance.
   * The client never reads it.
   */
  cookieWriteKey?: string | false;
  cookieOptions?: NxdsAppearanceCookieOptions;
}

const NxdsAppearanceContext = createContext<NxdsAppearanceContextValue | null>(
  null
);

const canUseDOM = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

function nextAppearanceState(
  update: SetStateAction<NxdsAppearanceState>,
  previous: NxdsAppearanceState
): NxdsAppearanceState {
  return sanitizeNxdsAppearance(
    typeof update === 'function' ? update(previous) : update
  );
}

export function NxdsAppearanceProvider({
  children,
  state,
  defaultState,
  onStateChange,
  storageKey = DEFAULT_STORAGE_KEY,
  cookieWriteKey = false,
  cookieOptions,
}: NxdsAppearanceProviderProps) {
  const isControlled = state !== undefined;
  const initialState = useMemo(
    () => sanitizeNxdsAppearance(defaultState ?? DEFAULT_NXDS_APPEARANCE),
    [defaultState]
  );
  const [internalState, setInternalState] =
    useState<NxdsAppearanceState>(initialState);
  const activeState = state ?? internalState;
  const [mounted, setMounted] = useState(false);
  const systemDark = useSyncExternalStore(
    watchColorScheme,
    prefersDarkColorScheme,
    () => false
  );
  const resolvedMode = resolveNxdsAppearanceMode(activeState.mode, systemDark);

  const internalStateRef = useRef(internalState);

  useEffect(() => {
    if (!canUseDOM()) return;

    setMounted(true);
    if (isControlled) return;

    const nextState = readStoredNxdsAppearance(storageKey, initialState);
    internalStateRef.current = nextState;
    setInternalState(nextState);
  }, [initialState, isControlled, storageKey]);

  const setState = useCallback<Dispatch<SetStateAction<NxdsAppearanceState>>>(
    (update) => {
      if (isControlled) {
        onStateChange?.(nextAppearanceState(update, activeState));
        return;
      }
      const next = nextAppearanceState(update, internalStateRef.current);
      internalStateRef.current = next;
      setInternalState(next);
      onStateChange?.(next);
    },
    [activeState, isControlled, onStateChange]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState, setState]);

  useEffect(() => {
    if (!mounted || isControlled) return;

    persistNxdsAppearance(activeState, {
      storageKey,
      cookieWriteKey,
      cookieOptions,
    });
  }, [
    activeState,
    cookieWriteKey,
    cookieOptions,
    isControlled,
    mounted,
    storageKey,
  ]);

  useEffect(() => {
    if (!mounted) return;

    applyNxdsAppearance(activeState, systemDark);
  }, [activeState, mounted, systemDark]);

  useEffect(() => {
    if (!canUseDOM()) return;

    return removeNxdsAppearance;
  }, []);

  const value = useMemo<NxdsAppearanceContextValue>(
    () => ({ state: activeState, setState, resolvedMode, mounted, reset }),
    [activeState, mounted, reset, resolvedMode, setState]
  );

  return (
    <NxdsAppearanceContext.Provider value={value}>
      {children}
    </NxdsAppearanceContext.Provider>
  );
}

export function useNxdsAppearance(): NxdsAppearanceContextValue {
  const context = useContext(NxdsAppearanceContext);

  if (!context) {
    throw new Error(
      'useNxdsAppearance must be used within <NxdsAppearanceProvider>'
    );
  }

  return context;
}
