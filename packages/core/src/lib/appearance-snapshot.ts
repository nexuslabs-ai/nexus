import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from './appearance-model';
import { deriveTheme, themeToCss } from './derive-theme';

export const SNAPSHOT_VERSION = 5;
const SNAPSHOT_CACHE_LIMIT = 50;

export const NEXUS_APPEARANCE_DATA_ATTRS = [
  'data-density',
  'data-radius',
  'data-shadow',
  'data-borderwidth',
] as const;

export type NexusAppearanceDataAttr =
  (typeof NEXUS_APPEARANCE_DATA_ATTRS)[number];

export interface NexusAppearanceSnapshot {
  version: typeof SNAPSHOT_VERSION;
  state: NexusAppearanceState;
  themeCss: string;
  prefsCss: string;
}

export interface NexusAppearanceStateCookie {
  version: typeof SNAPSHOT_VERSION;
  state: NexusAppearanceState;
}

export interface NexusFirstPaintResolution {
  className: '' | 'dark';
  dataAttrs: Record<NexusAppearanceDataAttr, string>;
  colorScheme: 'light' | 'dark';
  metaColorScheme: 'light' | 'dark' | 'light dark';
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

function cacheKeyForState(state: NexusAppearanceState): string {
  return JSON.stringify(state);
}

function deriveThemeCss(state: NexusAppearanceState): string {
  return themeToCss(deriveTheme(createNexusThemeContract(state)));
}

function derivePrefsCss(state: NexusAppearanceState): string {
  return appearancePrefsToCss(state.prefs);
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

  const snapshot = createNexusAppearanceSnapshot(
    sanitizedState,
    deriveThemeCss(sanitizedState),
    derivePrefsCss(sanitizedState)
  );

  cachedSnapshots.set(cacheKey, snapshot);

  if (cachedSnapshots.size > SNAPSHOT_CACHE_LIMIT) {
    const oldestKey = cachedSnapshots.keys().next().value;
    if (oldestKey) cachedSnapshots.delete(oldestKey);
  }

  return snapshot;
}

export function createNexusAppearanceStateCookie(
  state: NexusAppearanceState
): NexusAppearanceStateCookie {
  return {
    version: SNAPSHOT_VERSION,
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
      parsed.version !== SNAPSHOT_VERSION ||
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

export function resolveFirstPaint(
  snapshot: NexusAppearanceSnapshot,
  systemPrefersDark: boolean
): NexusFirstPaintResolution {
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
    colorScheme: dark ? 'dark' : 'light',
    metaColorScheme: state.mode === 'system' ? 'light dark' : state.mode,
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

export function createNexusAppearanceBootstrapScript(
  options: NexusAppearanceBootstrapScriptOptions = {}
): string {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const defaultSnapshot = options.defaultSnapshot
    ? sanitizeNexusAppearanceSnapshot(options.defaultSnapshot)
    : createDefaultNexusAppearanceSnapshot();

  return `(function(){try{var k=${escapeInlineScriptJson(storageKey)};var f=${escapeInlineScriptJson(defaultSnapshot)};var s=f;try{if(k!==false){var r=window.localStorage&&window.localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p&&p.version===f.version&&p.state&&typeof p.themeCss==="string"&&typeof p.prefsCss==="string"){s=p;}}}}catch(e){}var st=s.state||f.state;var m=st.mode==="dark"||st.mode==="light"||st.mode==="system"?st.mode:f.state.mode;var sys=false;try{sys=m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}var dark=m==="dark"||sys===true;var root=document.documentElement;root.classList.toggle("dark",dark);root.setAttribute("data-density",typeof st.density==="string"?st.density:f.state.density);root.setAttribute("data-radius",typeof st.corners==="string"?st.corners:f.state.corners);root.setAttribute("data-shadow",typeof st.elevation==="string"?st.elevation:f.state.elevation);root.setAttribute("data-borderwidth",typeof st.stroke==="string"?st.stroke:f.state.stroke);root.style.colorScheme=dark?"dark":"light";var meta=document.querySelector('meta[name="color-scheme"]');if(!meta){meta=document.createElement("meta");meta.setAttribute("name","color-scheme");document.head.appendChild(meta);}meta.setAttribute("content",m==="system"?"light dark":m);function upsert(attr,css){var list=document.querySelectorAll("style["+attr+"]");var el=list[0]||document.createElement("style");for(var i=1;i<list.length;i++){list[i].remove();}el.setAttribute(attr,"");el.textContent=css||"";if(!el.parentNode){document.head.appendChild(el);}}upsert("data-nexus-appearance-theme",s.themeCss);upsert("data-nexus-appearance-prefs",s.prefsCss);}catch(e){}})();`;
}
