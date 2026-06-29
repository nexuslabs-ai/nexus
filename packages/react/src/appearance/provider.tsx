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
  createNexusAppearanceSnapshotFromState,
  DEFAULT_NEXUS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  NEXUS_APPEARANCE_DATA_ATTRS,
  type NexusAppearanceSnapshot,
  type NexusAppearanceState,
  resolveFirstPaint,
  sanitizeNexusAppearance,
  sanitizeNexusAppearanceSnapshot,
  serializeNexusAppearanceStateCookie,
} from '@nexus/core';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_STYLE_SELECTOR = 'style[data-nexus-appearance-theme]';
const PREFS_STYLE_SELECTOR = 'style[data-nexus-appearance-prefs]';
const DEFAULT_COOKIE_PATH = '/';
const DEFAULT_COOKIE_SAME_SITE = 'Lax';
export const NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type NexusResolvedAppearanceMode = 'light' | 'dark';
export type NexusAppearanceCookieSameSite = 'Lax' | 'Strict' | 'None';

export interface NexusAppearanceCookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: NexusAppearanceCookieSameSite;
  secure?: boolean | 'auto';
  domain?: string;
}

export interface NexusAppearanceContextValue {
  state: NexusAppearanceState;
  setState: Dispatch<SetStateAction<NexusAppearanceState>>;
  resolvedMode: NexusResolvedAppearanceMode;
  mounted: boolean;
  reset: () => void;
}

export interface NexusAppearanceProviderProps {
  children: ReactNode;
  state?: NexusAppearanceState;
  defaultState?: NexusAppearanceState;
  onStateChange?: (state: NexusAppearanceState) => void;
  storageKey?: string | false;
  cookieKey?: string | false;
  cookieOptions?: NexusAppearanceCookieOptions;
}

const NexusAppearanceContext =
  createContext<NexusAppearanceContextValue | null>(null);

const canUseDOM = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

function resolveAppearanceMode(
  mode: NexusAppearanceState['mode'],
  systemPrefersDark = false
): NexusResolvedAppearanceMode {
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
  fallback: NexusAppearanceState
): NexusAppearanceState {
  if (!canUseDOM() || storageKey === false) return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);

    return raw
      ? sanitizeNexusAppearanceSnapshot(JSON.parse(raw)).state
      : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredSnapshot(
  storageKey: string | false,
  snapshot: NexusAppearanceSnapshot
): void {
  if (!canUseDOM() || storageKey === false) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    // Storage can fail in privacy modes or quota-constrained embeds.
  }
}

function writeStateCookie(
  cookieKey: string | false,
  state: NexusAppearanceState,
  options: NexusAppearanceCookieOptions = {}
): void {
  if (!canUseDOM() || cookieKey === false) return;

  try {
    const maxAge = options.maxAge ?? NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS;
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

    document.cookie = `${cookieKey}=${serializeNexusAppearanceStateCookie(
      state
    )}; ${attrs.join('; ')}`;
  } catch {
    // Cookie writes can fail in locked-down embeds.
  }
}

function syncColorSchemeMeta(content: 'light' | 'dark' | 'light dark'): void {
  const meta =
    document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]') ??
    document.createElement('meta');

  meta.setAttribute('name', 'color-scheme');
  meta.setAttribute('content', content);

  if (!meta.parentNode) {
    document.head.appendChild(meta);
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
  root.style.removeProperty('color-scheme');
  for (const attr of NEXUS_APPEARANCE_DATA_ATTRS) {
    root.removeAttribute(attr);
  }
}

function nextAppearanceState(
  update: SetStateAction<NexusAppearanceState>,
  previous: NexusAppearanceState
): NexusAppearanceState {
  return sanitizeNexusAppearance(
    typeof update === 'function' ? update(previous) : update
  );
}

export function NexusAppearanceProvider({
  children,
  state,
  defaultState,
  onStateChange,
  storageKey = DEFAULT_STORAGE_KEY,
  cookieKey = false,
  cookieOptions,
}: NexusAppearanceProviderProps) {
  const isControlled = state !== undefined;
  const initialState = useMemo(
    () => sanitizeNexusAppearance(defaultState ?? DEFAULT_NEXUS_APPEARANCE),
    [defaultState]
  );
  const [internalState, setInternalState] =
    useState<NexusAppearanceState>(initialState);
  const activeState = state ?? internalState;
  const [mounted, setMounted] = useState(false);
  const [resolvedMode, setResolvedMode] = useState<NexusResolvedAppearanceMode>(
    () => resolveAppearanceMode(activeState.mode)
  );
  const activeSnapshot = useMemo(
    () => createNexusAppearanceSnapshotFromState(activeState),
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

  const setState = useCallback<Dispatch<SetStateAction<NexusAppearanceState>>>(
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
      writeStateCookie(cookieKey, activeState, cookieOptions);
    }
  }, [
    activeSnapshot,
    activeState,
    cookieKey,
    cookieOptions,
    isControlled,
    mounted,
    storageKey,
  ]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const root = document.documentElement;

    for (const attr of NEXUS_APPEARANCE_DATA_ATTRS) {
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

    const root = document.documentElement;

    root.classList.toggle('dark', firstPaint.className === 'dark');
    root.style.colorScheme = firstPaint.colorScheme;
    syncColorSchemeMeta(firstPaint.metaColorScheme);
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const themeStyle = upsertStyle(
      THEME_STYLE_SELECTOR,
      'data-nexus-appearance-theme'
    );
    themeStyle.textContent = firstPaint.themeCss;
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const prefsStyle = upsertStyle(
      PREFS_STYLE_SELECTOR,
      'data-nexus-appearance-prefs'
    );
    prefsStyle.textContent = firstPaint.prefsCss;
  }, [firstPaint, mounted]);

  useEffect(() => {
    if (!canUseDOM()) return;

    return removeAppearanceArtifacts;
  }, []);

  const value = useMemo<NexusAppearanceContextValue>(
    () => ({ state: activeState, setState, resolvedMode, mounted, reset }),
    [activeState, mounted, reset, resolvedMode, setState]
  );

  return (
    <NexusAppearanceContext.Provider value={value}>
      {children}
    </NexusAppearanceContext.Provider>
  );
}

export function useNexusAppearance(): NexusAppearanceContextValue {
  const context = useContext(NexusAppearanceContext);

  if (!context) {
    throw new Error(
      'useNexusAppearance must be used within <NexusAppearanceProvider>'
    );
  }

  return context;
}
