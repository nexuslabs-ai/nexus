import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from './appearance-model';
import {
  deriveThemeMode,
  type ThemeDerivationInput,
  themeToCss,
  type TokenMap,
} from './derive-theme';
import {
  NEXUS_APPEARANCE_ATTRIBUTE_FIELDS,
  NEXUS_DOCUMENT_ROOT_KEY,
  NEXUS_MODE_ATTRIBUTE,
  NEXUS_ROOT_ATTRIBUTE,
  nexusRootScope,
} from './nexus-root';
import type { Mode } from './palette';

export const SNAPSHOT_VERSION = 8;
const STATE_COOKIE_VERSION = 6;
const SNAPSHOT_CACHE_LIMIT = 50;

export interface NexusAppearanceSnapshot {
  version: typeof SNAPSHOT_VERSION;
  state: NexusAppearanceState;
  themeCss: string;
  prefsCss: string;
}

export interface NexusAppearanceStateCookie {
  version: typeof STATE_COOKIE_VERSION;
  state: NexusAppearanceState;
}

export interface NexusAppearanceCss {
  themeCss: string;
  prefsCss: string;
}

export interface NexusAppearanceBootstrapScriptOptions {
  storageKey?: string | false;
  defaultSnapshot?: NexusAppearanceSnapshot;
}

export const DEFAULT_STORAGE_KEY = 'nexus-appearance';
export const DEFAULT_COOKIE_KEY = 'nexus-appearance-state';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const cachedSnapshots = new Map<string, NexusAppearanceSnapshot>();
const cachedModes = new Map<string, TokenMap>();

function cacheKeyForState(state: NexusAppearanceState): string {
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

/** Runtime theme and preference CSS for the Nexus root matched by `scope`. */
export function deriveNexusAppearanceCss(
  state: NexusAppearanceState,
  scope: string
): NexusAppearanceCss {
  const sanitizedState = sanitizeNexusAppearance(state);
  const contract = createNexusThemeContract(sanitizedState);
  return {
    themeCss: themeToCss(
      {
        light: deriveModeCached(contract, 'light'),
        dark: deriveModeCached(contract, 'dark'),
      },
      scope
    ),
    prefsCss: appearancePrefsToCss(sanitizedState.prefs, scope),
  };
}

export function createNexusAppearanceSnapshot(
  state: NexusAppearanceState,
  themeCss: string,
  prefsCss: string
): NexusAppearanceSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    state,
    themeCss,
    prefsCss,
  };
}

export function createNexusAppearanceSnapshotFromState(
  state: NexusAppearanceState
): NexusAppearanceSnapshot {
  const sanitizedState = sanitizeNexusAppearance(state);
  const cacheKey = cacheKeyForState(sanitizedState);
  const cachedSnapshot = cachedSnapshots.get(cacheKey);

  if (cachedSnapshot) return cachedSnapshot;

  const { themeCss, prefsCss } = deriveNexusAppearanceCss(
    sanitizedState,
    nexusRootScope(NEXUS_DOCUMENT_ROOT_KEY)
  );
  return remember(
    cachedSnapshots,
    cacheKey,
    createNexusAppearanceSnapshot(sanitizedState, themeCss, prefsCss)
  );
}

export function createNexusAppearanceStateCookie(
  state: NexusAppearanceState
): NexusAppearanceStateCookie {
  return {
    version: STATE_COOKIE_VERSION,
    state: sanitizeNexusAppearance(state),
  };
}

export function serializeNexusAppearanceStateCookie(
  state: NexusAppearanceState
): string {
  return encodeURIComponent(
    JSON.stringify(createNexusAppearanceStateCookie(state))
  );
}

export function parseNexusAppearanceStateCookie(
  raw: unknown
): NexusAppearanceState | null {
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

    return sanitizeNexusAppearance(parsed.state);
  } catch {
    return null;
  }
}

export function createNexusAppearanceSnapshotFromCookie(
  raw: unknown,
  fallbackState: NexusAppearanceState = DEFAULT_NEXUS_APPEARANCE
): NexusAppearanceSnapshot {
  return createNexusAppearanceSnapshotFromState(
    parseNexusAppearanceStateCookie(raw) ??
      sanitizeNexusAppearance(fallbackState)
  );
}

let cachedDefaultSnapshot: NexusAppearanceSnapshot | undefined;

export function createDefaultNexusAppearanceSnapshot(): NexusAppearanceSnapshot {
  return (cachedDefaultSnapshot ??= createNexusAppearanceSnapshotFromState(
    DEFAULT_NEXUS_APPEARANCE
  ));
}

export function sanitizeNexusAppearanceSnapshot(
  raw: unknown
): NexusAppearanceSnapshot {
  if (!isRecord(raw) || !isRecord(raw.state)) {
    return createDefaultNexusAppearanceSnapshot();
  }

  const state = sanitizeNexusAppearance(raw.state);

  if (
    raw.version === SNAPSHOT_VERSION &&
    typeof raw.themeCss === 'string' &&
    typeof raw.prefsCss === 'string'
  ) {
    return createNexusAppearanceSnapshot(state, raw.themeCss, raw.prefsCss);
  }

  return createNexusAppearanceSnapshotFromState(state);
}

function escapeInlineScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003C')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function createNexusAppearanceBootstrapScript(
  options: NexusAppearanceBootstrapScriptOptions = {}
): string {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const defaultSnapshot = options.defaultSnapshot
    ? sanitizeNexusAppearanceSnapshot(options.defaultSnapshot)
    : createDefaultNexusAppearanceSnapshot();

  return `(function(){try{var nc=document.currentScript&&document.currentScript.nonce;var k=${escapeInlineScriptJson(storageKey)};var f=${escapeInlineScriptJson(defaultSnapshot)};var a=${escapeInlineScriptJson(NEXUS_APPEARANCE_ATTRIBUTE_FIELDS)};var s=f;try{if(k!==false){var r=window.localStorage&&window.localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p&&p.version===f.version&&p.state&&typeof p.themeCss==="string"&&typeof p.prefsCss==="string"){s=p;}}}}catch(e){}var st=s.state||f.state;var m=st.mode==="dark"||st.mode==="light"||st.mode==="system"?st.mode:f.state.mode;var sys=false;try{sys=m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}var root=document.documentElement;root.setAttribute(${escapeInlineScriptJson(NEXUS_ROOT_ATTRIBUTE)},${escapeInlineScriptJson(NEXUS_DOCUMENT_ROOT_KEY)});root.setAttribute(${escapeInlineScriptJson(NEXUS_MODE_ATTRIBUTE)},m==="dark"||sys===true?"dark":"light");for(var n in a){root.setAttribute(n,typeof st[a[n]]==="string"?st[a[n]]:f.state[a[n]]);}var meta=document.querySelector('meta[name="color-scheme"]');if(!meta){meta=document.createElement("meta");meta.setAttribute("name","color-scheme");document.head.appendChild(meta);}meta.setAttribute("content",m==="system"?"light dark":m);function upsert(attr,css){var list=document.querySelectorAll("style["+attr+"]");var el=list[0]||document.createElement("style");for(var i=1;i<list.length;i++){list[i].remove();}el.setAttribute(attr,"");if(nc){el.nonce=nc;}el.textContent=css||"";if(!el.parentNode){document.head.appendChild(el);}}upsert("data-nexus-appearance-theme",s.themeCss);upsert("data-nexus-appearance-prefs",s.prefsCss);}catch(e){}})();`;
}
