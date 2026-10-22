import {
  appearancePrefsToCss,
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
  sanitizeNxdsAppearance,
} from './appearance-model';
import {
  deriveThemeMode,
  type ThemeDerivationInput,
  themeToCss,
  type TokenMap,
} from './derive-theme';
import type { Mode } from './palette';

export const SNAPSHOT_VERSION = 9;
const STATE_COOKIE_VERSION = 6;
const SNAPSHOT_CACHE_LIMIT = 50;

export const NXDS_APPEARANCE_DATA_ATTRS = [
  'data-density',
  'data-radius',
  'data-shadow',
  'data-borderwidth',
] as const;

export type NxdsAppearanceDataAttr =
  (typeof NXDS_APPEARANCE_DATA_ATTRS)[number];

export interface NxdsAppearanceSnapshot {
  version: typeof SNAPSHOT_VERSION;
  state: NxdsAppearanceState;
  themeCss: string;
  prefsCss: string;
}

export interface NxdsAppearanceStateCookie {
  version: typeof STATE_COOKIE_VERSION;
  state: NxdsAppearanceState;
}

export interface NxdsFirstPaintResolution {
  className: '' | 'dark';
  dataAttrs: Record<NxdsAppearanceDataAttr, string>;
  themeCss: string;
  prefsCss: string;
}

export interface NxdsAppearanceBootstrapScriptOptions {
  storageKey?: string | false;
  defaultSnapshot?: NxdsAppearanceSnapshot;
}

export const DEFAULT_STORAGE_KEY = 'nxds-appearance';
export const DEFAULT_COOKIE_KEY = 'nxds-appearance-state';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const cachedSnapshots = new Map<string, NxdsAppearanceSnapshot>();
const cachedModes = new Map<string, TokenMap>();

function cacheKeyForState(state: NxdsAppearanceState): string {
  return JSON.stringify(state);
}

function remember<T>(cache: Map<string, T>, key: string, value: T): T {
  cache.set(key, value);
  if (cache.size > SNAPSHOT_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  return value;
}

// Each mode is cached on only the inputs it reads, so moving one mode's
// contrast slider (or any non-color preference) re-derives at most one mode.
function deriveModeCached(
  contract: ThemeDerivationInput,
  mode: Mode
): TokenMap {
  const key = JSON.stringify([
    mode,
    contract.surfaceTone,
    contract[mode],
    contract.contrast[mode],
  ]);
  return (
    cachedModes.get(key) ??
    remember(cachedModes, key, deriveThemeMode(contract, mode))
  );
}

function deriveThemeCss(state: NxdsAppearanceState): string {
  const contract = createNxdsThemeContract(state);
  return themeToCss({
    light: deriveModeCached(contract, 'light'),
    dark: deriveModeCached(contract, 'dark'),
  });
}

function derivePrefsCss(state: NxdsAppearanceState): string {
  return appearancePrefsToCss(state.prefs);
}

export function createNxdsAppearanceSnapshot(
  state: NxdsAppearanceState,
  themeCss: string,
  prefsCss: string
): NxdsAppearanceSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    state,
    themeCss,
    prefsCss,
  };
}

export function createNxdsAppearanceSnapshotFromState(
  state: NxdsAppearanceState
): NxdsAppearanceSnapshot {
  const sanitizedState = sanitizeNxdsAppearance(state);
  const cacheKey = cacheKeyForState(sanitizedState);
  const cachedSnapshot = cachedSnapshots.get(cacheKey);

  if (cachedSnapshot) return cachedSnapshot;

  return remember(
    cachedSnapshots,
    cacheKey,
    createNxdsAppearanceSnapshot(
      sanitizedState,
      deriveThemeCss(sanitizedState),
      derivePrefsCss(sanitizedState)
    )
  );
}

export function createNxdsAppearanceStateCookie(
  state: NxdsAppearanceState
): NxdsAppearanceStateCookie {
  return {
    version: STATE_COOKIE_VERSION,
    state: sanitizeNxdsAppearance(state),
  };
}

export function serializeNxdsAppearanceStateCookie(
  state: NxdsAppearanceState
): string {
  return encodeURIComponent(
    JSON.stringify(createNxdsAppearanceStateCookie(state))
  );
}

export function parseNxdsAppearanceStateCookie(
  raw: unknown
): NxdsAppearanceState | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);

    if (
      !isRecord(parsed) ||
      parsed.version !== STATE_COOKIE_VERSION ||
      !isRecord(parsed.state)
    ) {
      return null;
    }

    return sanitizeNxdsAppearance(parsed.state);
  } catch {
    return null;
  }
}

export function createNxdsAppearanceSnapshotFromCookie(
  raw: unknown,
  fallbackState: NxdsAppearanceState = DEFAULT_NXDS_APPEARANCE
): NxdsAppearanceSnapshot {
  return createNxdsAppearanceSnapshotFromState(
    parseNxdsAppearanceStateCookie(raw) ?? sanitizeNxdsAppearance(fallbackState)
  );
}

let cachedDefaultSnapshot: NxdsAppearanceSnapshot | undefined;

export function createDefaultNxdsAppearanceSnapshot(): NxdsAppearanceSnapshot {
  return (cachedDefaultSnapshot ??= createNxdsAppearanceSnapshotFromState(
    DEFAULT_NXDS_APPEARANCE
  ));
}

export function sanitizeNxdsAppearanceSnapshot(
  raw: unknown
): NxdsAppearanceSnapshot {
  if (!isRecord(raw) || !isRecord(raw.state)) {
    return createDefaultNxdsAppearanceSnapshot();
  }

  const state = sanitizeNxdsAppearance(raw.state);

  if (
    raw.version === SNAPSHOT_VERSION &&
    typeof raw.themeCss === 'string' &&
    typeof raw.prefsCss === 'string'
  ) {
    return createNxdsAppearanceSnapshot(state, raw.themeCss, raw.prefsCss);
  }

  return createNxdsAppearanceSnapshotFromState(state);
}

export function resolveFirstPaint(
  snapshot: NxdsAppearanceSnapshot,
  systemPrefersDark: boolean
): NxdsFirstPaintResolution {
  const { state } = snapshot;
  const dark =
    state.mode === 'dark' ||
    (state.mode === 'system' && systemPrefersDark === true);

  return {
    className: dark ? 'dark' : '',
    dataAttrs: {
      'data-density': state.density,
      'data-radius': state.corners,
      'data-shadow': state.elevation,
      'data-borderwidth': state.stroke,
    },
    themeCss: snapshot.themeCss,
    prefsCss: snapshot.prefsCss,
  };
}

function escapeInlineScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003C')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function createNxdsAppearanceBootstrapScript(
  options: NxdsAppearanceBootstrapScriptOptions = {}
): string {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const defaultSnapshot = options.defaultSnapshot
    ? sanitizeNxdsAppearanceSnapshot(options.defaultSnapshot)
    : createDefaultNxdsAppearanceSnapshot();

  return `(function(){try{var k=${escapeInlineScriptJson(storageKey)};var f=${escapeInlineScriptJson(defaultSnapshot)};var s=f;try{if(k!==false){var r=window.localStorage&&window.localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p&&p.version===f.version&&p.state&&typeof p.themeCss==="string"&&typeof p.prefsCss==="string"){s=p;}}}}catch(e){}var st=s.state||f.state;var m=st.mode==="dark"||st.mode==="light"||st.mode==="system"?st.mode:f.state.mode;var sys=false;try{sys=m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}var dark=m==="dark"||sys===true;var root=document.documentElement;root.classList.toggle("dark",dark);root.setAttribute("data-density",typeof st.density==="string"?st.density:f.state.density);root.setAttribute("data-radius",typeof st.corners==="string"?st.corners:f.state.corners);root.setAttribute("data-shadow",typeof st.elevation==="string"?st.elevation:f.state.elevation);root.setAttribute("data-borderwidth",typeof st.stroke==="string"?st.stroke:f.state.stroke);function upsert(attr,css){var list=document.querySelectorAll("style["+attr+"]");var el=list[0]||document.createElement("style");for(var i=1;i<list.length;i++){list[i].remove();}el.setAttribute(attr,"");el.textContent=css||"";if(!el.parentNode){document.head.appendChild(el);}}upsert("data-nxds-appearance-theme",s.themeCss);upsert("data-nxds-appearance-prefs",s.prefsCss);}catch(e){}})();`;
}
