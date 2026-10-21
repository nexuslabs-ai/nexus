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
} from 'react';

import {
  createNxdsAppearanceSnapshotFromState,
  DEFAULT_NXDS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  NXDS_APPEARANCE_DATA_ATTRS,
  type NxdsAppearanceSnapshot,
  type NxdsAppearanceState,
  resolveFirstPaint,
  sanitizeNxdsAppearance,
  sanitizeNxdsAppearanceSnapshot,
  serializeNxdsAppearanceStateCookie,
} from '@nxds/core';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_STYLE_SELECTOR = 'style[data-nxds-appearance-theme]';
const PREFS_STYLE_SELECTOR = 'style[data-nxds-appearance-prefs]';
const DEFAULT_COOKIE_PATH = '/';
const DEFAULT_COOKIE_SAME_SITE = 'Lax';
export const NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type NxdsResolvedAppearanceMode = 'light' | 'dark';
export type NxdsAppearanceCookieSameSite = 'Lax' | 'Strict' | 'None';

export interface NxdsAppearanceCookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: NxdsAppearanceCookieSameSite;
  secure?: boolean | 'auto';
  domain?: string;
}

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

function resolveAppearanceMode(
  mode: NxdsAppearanceState['mode'],
  systemPrefersDark = false
): NxdsResolvedAppearanceMode {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return systemPrefersDark ? 'dark' : 'light';
}

function systemPrefersDark(): boolean {
  if (!canUseDOM() || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

function readStoredState(
  storageKey: string | false,
  fallback: NxdsAppearanceState
): NxdsAppearanceState {
  if (!canUseDOM() || storageKey === false) return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);

    return raw
      ? sanitizeNxdsAppearanceSnapshot(JSON.parse(raw)).state
      : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredSnapshot(
  storageKey: string | false,
  snapshot: NxdsAppearanceSnapshot
): void {
  if (!canUseDOM() || storageKey === false) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    // Storage can fail in privacy modes or quota-constrained embeds.
  }
}

function writeStateCookie(
  cookieWriteKey: string | false,
  state: NxdsAppearanceState,
  options: NxdsAppearanceCookieOptions = {}
): void {
  if (!canUseDOM() || cookieWriteKey === false) return;

  try {
    const maxAge = options.maxAge ?? NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS;
    const path = options.path ?? DEFAULT_COOKIE_PATH;
    const sameSite = options.sameSite ?? DEFAULT_COOKIE_SAME_SITE;
    const secure =
      options.secure === true ||
      (options.secure !== false && window.location.protocol === 'https:');
    const attrs = [
      `Path=${path.replace(/[;\r\n]/g, '')}`,
      `SameSite=${sameSite}`,
      `Max-Age=${maxAge}`,
      options.domain ? `Domain=${options.domain.replace(/[;\r\n]/g, '')}` : '',
      secure ? 'Secure' : '',
    ].filter(Boolean);

    document.cookie = `${cookieWriteKey}=${serializeNxdsAppearanceStateCookie(
      state
    )}; ${attrs.join('; ')}`;
  } catch {
    // Cookie writes can fail in locked-down embeds.
  }
}

function upsertStyle(selector: string, attribute: string): HTMLStyleElement {
  const styles = Array.from(
    document.querySelectorAll<HTMLStyleElement>(selector)
  );
  const style = styles[0] ?? document.createElement('style');

  for (const duplicate of styles.slice(1)) {
    duplicate.remove();
  }

  style.setAttribute(attribute, '');

  if (!style.parentNode) {
    document.head.appendChild(style);
  }

  return style;
}

function removeAppearanceArtifacts(): void {
  document
    .querySelectorAll(`${THEME_STYLE_SELECTOR}, ${PREFS_STYLE_SELECTOR}`)
    .forEach((style) => style.remove());

  const root = document.documentElement;
  root.classList.remove('dark');
  for (const attr of NXDS_APPEARANCE_DATA_ATTRS) {
    root.removeAttribute(attr);
  }
}

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
  const [resolvedMode, setResolvedMode] = useState<NxdsResolvedAppearanceMode>(
    () => resolveAppearanceMode(activeState.mode)
  );
  const activeSnapshot = useMemo(
    () => createNxdsAppearanceSnapshotFromState(activeState),
    [activeState]
  );
  const firstPaint = useMemo(
    () => resolveFirstPaint(activeSnapshot, resolvedMode === 'dark'),
    [activeSnapshot, resolvedMode]
  );

  const internalStateRef = useRef(internalState);

  useEffect(() => {
    if (!canUseDOM()) return;

    if (isControlled) {
      setResolvedMode(
        resolveAppearanceMode((state ?? initialState).mode, systemPrefersDark())
      );
      setMounted(true);
      return;
    }

    const nextState = readStoredState(storageKey, initialState);
    internalStateRef.current = nextState;
    setInternalState(nextState);
    setResolvedMode(resolveAppearanceMode(nextState.mode, systemPrefersDark()));
    setMounted(true);
  }, [initialState, isControlled, state, storageKey]);

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
    if (mounted && !isControlled) {
      writeStoredSnapshot(storageKey, activeSnapshot);
      writeStateCookie(cookieWriteKey, activeState, cookieOptions);
    }
  }, [
    activeSnapshot,
    activeState,
    cookieWriteKey,
    cookieOptions,
    isControlled,
    mounted,
    storageKey,
  ]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const root = document.documentElement;

    for (const attr of NXDS_APPEARANCE_DATA_ATTRS) {
      root.setAttribute(attr, firstPaint.dataAttrs[attr]);
    }
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const apply = () => {
      setResolvedMode(
        resolveAppearanceMode(activeState.mode, systemPrefersDark())
      );
    };

    apply();

    if (
      activeState.mode !== 'system' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    mediaQuery.addEventListener('change', apply);

    return () => mediaQuery.removeEventListener('change', apply);
  }, [activeState.mode, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    document.documentElement.classList.toggle(
      'dark',
      firstPaint.className === 'dark'
    );
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const themeStyle = upsertStyle(
      THEME_STYLE_SELECTOR,
      'data-nxds-appearance-theme'
    );
    themeStyle.textContent = firstPaint.themeCss;
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const prefsStyle = upsertStyle(
      PREFS_STYLE_SELECTOR,
      'data-nxds-appearance-prefs'
    );
    prefsStyle.textContent = firstPaint.prefsCss;
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM()) return;

    return removeAppearanceArtifacts;
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
