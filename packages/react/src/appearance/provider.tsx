import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
  themeToCss,
} from '@nexus/core';

const DEFAULT_STORAGE_KEY = 'nexus-appearance';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_STYLE_SELECTOR = 'style[data-nexus-appearance-theme]';
const PREFS_STYLE_SELECTOR = 'style[data-nexus-appearance-prefs]';

export type NexusResolvedAppearanceMode = 'light' | 'dark';

export interface NexusAppearanceContextValue {
  state: NexusAppearanceState;
  setState: Dispatch<SetStateAction<NexusAppearanceState>>;
  resolvedMode: NexusResolvedAppearanceMode;
  reset: () => void;
}

export interface NexusAppearanceProviderProps {
  children: ReactNode;
  state?: NexusAppearanceState;
  defaultState?: NexusAppearanceState;
  onStateChange?: (state: NexusAppearanceState) => void;
  storageKey?: string | false;
}

const NexusAppearanceContext =
  createContext<NexusAppearanceContextValue | null>(null);

const canUseDOM = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

function resolveAppearanceMode(
  mode: NexusAppearanceState['mode']
): NexusResolvedAppearanceMode {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  if (!canUseDOM() || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

function readStoredState(
  storageKey: string | false,
  fallback: NexusAppearanceState
): NexusAppearanceState {
  if (!canUseDOM() || storageKey === false) return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);

    return raw ? sanitizeNexusAppearance(JSON.parse(raw)) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredState(
  storageKey: string | false,
  state: NexusAppearanceState
): void {
  if (!canUseDOM() || storageKey === false) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Storage can fail in privacy modes or quota-constrained embeds.
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
  for (const attr of [
    'data-style',
    'data-radius',
    'data-shadow',
    'data-borderwidth',
  ]) {
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
}: NexusAppearanceProviderProps) {
  const isControlled = state !== undefined;
  const initialState = useMemo(
    () => sanitizeNexusAppearance(defaultState ?? DEFAULT_NEXUS_APPEARANCE),
    [defaultState]
  );
  const [internalState, setInternalState] = useState<NexusAppearanceState>(() =>
    readStoredState(storageKey, initialState)
  );
  // Controlled state is trusted as-is — the parent owns it. `sanitizeNexusAppearance`
  // is exported for parents to validate untrusted input before passing it in.
  const activeState = state ?? internalState;
  const [resolvedMode, setResolvedMode] = useState<NexusResolvedAppearanceMode>(
    () => resolveAppearanceMode(activeState.mode)
  );
  const themeCss = useMemo(
    () => themeToCss(deriveTheme(createNexusThemeContract(activeState))),
    [activeState]
  );
  const prefsCss = useMemo(
    () => appearancePrefsToCss(activeState.prefs),
    [activeState.prefs]
  );

  const setState = useCallback<Dispatch<SetStateAction<NexusAppearanceState>>>(
    (update) => {
      // Uncontrolled path uses the functional updater so synchronous
      // back-to-back updates compose instead of collapsing onto the render
      // snapshot. Controlled mode never owns internal state — the parent does.
      if (!isControlled) {
        setInternalState((previous) => nextAppearanceState(update, previous));
      }

      onStateChange?.(nextAppearanceState(update, activeState));
    },
    [activeState, isControlled, onStateChange]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState, setState]);

  useEffect(() => {
    if (!isControlled) {
      writeStoredState(storageKey, activeState);
    }
  }, [activeState, isControlled, storageKey]);

  useEffect(() => {
    if (!canUseDOM()) return;

    const root = document.documentElement;

    root.setAttribute('data-style', activeState.density);
    root.setAttribute('data-radius', activeState.corners);
    root.setAttribute('data-shadow', activeState.elevation);
    root.setAttribute('data-borderwidth', activeState.stroke);
  }, [activeState]);

  useEffect(() => {
    if (!canUseDOM()) return;

    const apply = () => {
      setResolvedMode(resolveAppearanceMode(activeState.mode));
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
  }, [activeState.mode]);

  useEffect(() => {
    if (!canUseDOM()) return;

    const root = document.documentElement;

    root.classList.toggle('dark', resolvedMode === 'dark');
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode]);

  useEffect(() => {
    if (!canUseDOM()) return;

    const themeStyle = upsertStyle(
      THEME_STYLE_SELECTOR,
      'data-nexus-appearance-theme'
    );
    themeStyle.textContent = themeCss;
  }, [themeCss]);

  useEffect(() => {
    if (!canUseDOM()) return;

    const prefsStyle = upsertStyle(
      PREFS_STYLE_SELECTOR,
      'data-nexus-appearance-prefs'
    );
    prefsStyle.textContent = prefsCss;
  }, [prefsCss]);

  useEffect(() => {
    if (!canUseDOM()) return;

    return removeAppearanceArtifacts;
  }, []);

  const value = useMemo<NexusAppearanceContextValue>(
    () => ({ state: activeState, setState, resolvedMode, reset }),
    [activeState, reset, resolvedMode, setState]
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
