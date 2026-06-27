import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from './appearance-model';
import { deriveTheme, themeToCss } from './derive-theme';

export const SNAPSHOT_VERSION = 2;

export interface NexusAppearanceSnapshot {
  version: typeof SNAPSHOT_VERSION;
  state: NexusAppearanceState;
  themeCss: string;
  prefsCss: string;
}

export interface NexusFirstPaintResolution {
  className: '' | 'dark';
  dataAttrs: {
    'data-style': string;
    'data-radius': string;
    'data-shadow': string;
    'data-borderwidth': string;
  };
  colorScheme: 'light' | 'dark';
  metaColorScheme: 'light' | 'dark' | 'light dark';
  themeCss: string;
  prefsCss: string;
}

export interface NexusAppearanceBootstrapScriptOptions {
  storageKey?: string;
  defaultSnapshot?: NexusAppearanceSnapshot;
}

export const DEFAULT_STORAGE_KEY = 'nexus-appearance';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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
  return createNexusAppearanceSnapshot(
    state,
    deriveThemeCss(state),
    derivePrefsCss(state)
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
      'data-style': state.density,
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

  return `(function(){try{var k=${escapeInlineScriptJson(storageKey)};var f=${escapeInlineScriptJson(defaultSnapshot)};var s=f;try{var r=window.localStorage&&window.localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p&&p.version===f.version&&p.state&&typeof p.themeCss==="string"&&typeof p.prefsCss==="string"){s=p;}}}catch(e){}var st=s.state||f.state;var m=st.mode==="dark"||st.mode==="light"||st.mode==="system"?st.mode:f.state.mode;var sys=false;try{sys=m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}var dark=m==="dark"||sys===true;var root=document.documentElement;root.classList.toggle("dark",dark);root.setAttribute("data-style",typeof st.density==="string"?st.density:f.state.density);root.setAttribute("data-radius",typeof st.corners==="string"?st.corners:f.state.corners);root.setAttribute("data-shadow",typeof st.elevation==="string"?st.elevation:f.state.elevation);root.setAttribute("data-borderwidth",typeof st.stroke==="string"?st.stroke:f.state.stroke);root.style.colorScheme=dark?"dark":"light";var meta=document.querySelector('meta[name="color-scheme"]');if(!meta){meta=document.createElement("meta");meta.setAttribute("name","color-scheme");document.head.appendChild(meta);}meta.setAttribute("content",m==="system"?"light dark":m);function upsert(attr,css){var list=document.querySelectorAll("style["+attr+"]");var el=list[0]||document.createElement("style");for(var i=1;i<list.length;i++){list[i].remove();}el.setAttribute(attr,"");el.textContent=css||"";if(!el.parentNode){document.head.appendChild(el);}}upsert("data-nexus-appearance-theme",s.themeCss);upsert("data-nexus-appearance-prefs",s.prefsCss);}catch(e){}})();`;
}
