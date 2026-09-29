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
  NEXUS_DOCUMENT_ROOT_KEY,
  NEXUS_ROOT_ATTRIBUTES,
  type NexusAppearanceSnapshot,
  type NexusAppearanceState,
  type NexusResolvedMode,
  nexusRootAttributes,
  sanitizeNexusAppearance,
  sanitizeNexusAppearanceSnapshot,
  serializeNexusAppearanceStateCookie,
} from '@nexus_ds/core';

import { NexusRootContext } from '../../../lib/nexus-root-context';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_STYLE_SELECTOR = 'style[data-nexus-appearance-theme]';
const PREFS_STYLE_SELECTOR = 'style[data-nexus-appearance-prefs]';
const DEFAULT_COOKIE_PATH = '/';
const DEFAULT_COOKIE_SAME_SITE = 'Lax';
export const NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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
  resolvedMode: NexusResolvedMode;
  mounted: boolean;
}

/**
 * Props for the standalone provider, whose Nexus root is `<html>`. It owns the
 * appearance state, resolves `system` mode, and can persist to storage and a
 * cookie. To scope Nexus to part of a page, use `NexusRoot` instead.
 */
export interface NexusAppearanceProviderProps {
  children: ReactNode;
  defaultState?: NexusAppearanceState;
  onStateChange?: (state: NexusAppearanceState) => void;
  /**
   * Client snapshot storage. When enabled, the local snapshot is read after
   * mount and is the client-side source of truth — it takes precedence over the
   * SSR-seeded cookie and `defaultState`. Disable with `false` to make the
   * provider cookie/SSR-driven only.
   */
  storageKey?: string | false;
  /**
   * Optional state cookie for SSR and first-paint seeding. The cookie is written
   * from the active client state for the next request; during client hydration it
   * is NOT read — `localStorage` (when `storageKey` is enabled) wins. This keeps
   * the SSR paint stable: the server renders from the cookie, the client then
   * adopts the local snapshot without a flash. Consumers who seed only the
   * cookie (no `storageKey`, or a fresh device with no localStorage) will hydrate
   * from `defaultState` and paint with whatever the server did not override.
   */
  cookieWriteKey?: string | false;
  cookieOptions?: NexusAppearanceCookieOptions;
}

export const NexusAppearanceContext =
  createContext<NexusAppearanceContextValue | null>(null);

const canUseDOM = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

function resolveAppearanceMode(
  mode: NexusAppearanceState['mode'],
  systemPrefersDark = false
): NexusResolvedMode {
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
  cookieWriteKey: string | false,
  state: NexusAppearanceState,
  options: NexusAppearanceCookieOptions = {}
): void {
  if (!canUseDOM() || cookieWriteKey === false) return;

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

    document.cookie = `${cookieWriteKey}=${serializeNexusAppearanceStateCookie(
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

// Server-rendered root attributes stay on <html>; only the ones this provider
// added are removed when it unmounts.
function removeAppearanceArtifacts(addedAttributes: readonly string[]): void {
  document
    .querySelectorAll(`${THEME_STYLE_SELECTOR}, ${PREFS_STYLE_SELECTOR}`)
    .forEach((style) => style.remove());

  for (const attr of addedAttributes) {
    document.documentElement.removeAttribute(attr);
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
  defaultState,
  onStateChange,
  storageKey = DEFAULT_STORAGE_KEY,
  cookieWriteKey = false,
  cookieOptions,
}: NexusAppearanceProviderProps) {
  const initialState = useMemo(
    () => sanitizeNexusAppearance(defaultState ?? DEFAULT_NEXUS_APPEARANCE),
    [defaultState]
  );
  const [activeState, setActiveState] =
    useState<NexusAppearanceState>(initialState);
  const [mounted, setMounted] = useState(false);
  const [resolvedMode, setResolvedMode] = useState<NexusResolvedMode>(() =>
    resolveAppearanceMode(activeState.mode)
  );
  const activeSnapshot = useMemo(
    () => createNexusAppearanceSnapshotFromState(activeState),
    [activeState]
  );
  const rootAttributes = useMemo(
    () =>
      nexusRootAttributes(activeState, resolvedMode, NEXUS_DOCUMENT_ROOT_KEY),
    [activeState, resolvedMode]
  );

  const activeStateRef = useRef(activeState);

  useEffect(() => {
    if (!canUseDOM()) return;

    const nextState = readStoredState(storageKey, initialState);
    activeStateRef.current = nextState;
    setActiveState(nextState);
    setResolvedMode(resolveAppearanceMode(nextState.mode, systemPrefersDark()));
    setMounted(true);
  }, [initialState, storageKey]);

  const setState = useCallback<Dispatch<SetStateAction<NexusAppearanceState>>>(
    (update) => {
      const next = nextAppearanceState(update, activeStateRef.current);
      activeStateRef.current = next;
      setActiveState(next);
      onStateChange?.(next);
    },
    [onStateChange]
  );

  useEffect(() => {
    if (!mounted) return;
    writeStoredSnapshot(storageKey, activeSnapshot);
    writeStateCookie(cookieWriteKey, activeState, cookieOptions);
  }, [
    activeSnapshot,
    activeState,
    cookieWriteKey,
    cookieOptions,
    mounted,
    storageKey,
  ]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    for (const [attr, value] of Object.entries(rootAttributes)) {
      document.documentElement.setAttribute(attr, value);
    }
  }, [rootAttributes, mounted]);

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

    syncColorSchemeMeta(
      activeState.mode === 'system' ? 'light dark' : activeState.mode
    );
  }, [activeState.mode, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const themeStyle = upsertStyle(
      THEME_STYLE_SELECTOR,
      'data-nexus-appearance-theme'
    );
    themeStyle.textContent = activeSnapshot.themeCss;
  }, [activeSnapshot, mounted]);

  useEffect(() => {
    if (!canUseDOM() || !mounted) return;

    const prefsStyle = upsertStyle(
      PREFS_STYLE_SELECTOR,
      'data-nexus-appearance-prefs'
    );
    prefsStyle.textContent = activeSnapshot.prefsCss;
  }, [activeSnapshot, mounted]);

  useEffect(() => {
    if (!canUseDOM()) return;

    const root = document.documentElement;
    const addedAttributes = NEXUS_ROOT_ATTRIBUTES.filter(
      (attr) => !root.hasAttribute(attr)
    );
    return () => removeAppearanceArtifacts(addedAttributes);
  }, []);

  const value = useMemo<NexusAppearanceContextValue>(
    () => ({ state: activeState, setState, resolvedMode, mounted }),
    [activeState, mounted, resolvedMode, setState]
  );

  return (
    <NexusAppearanceContext.Provider value={value}>
      <NexusRootContext.Provider value={rootAttributes}>
        {children}
      </NexusRootContext.Provider>
    </NexusAppearanceContext.Provider>
  );
}

export function useNexusAppearance(): NexusAppearanceContextValue {
  const context = useContext(NexusAppearanceContext);

  if (!context) {
    throw new Error(
      'useNexusAppearance must be used within <NexusRoot> or <NexusAppearanceProvider>'
    );
  }

  return context;
}
