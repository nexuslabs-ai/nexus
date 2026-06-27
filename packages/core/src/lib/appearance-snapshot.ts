import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from './appearance-model';
import { deriveTheme, themeToCss } from './derive-theme';

export const SNAPSHOT_VERSION = 1;

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

export function createDefaultNexusAppearanceSnapshot(): NexusAppearanceSnapshot {
  return createNexusAppearanceSnapshot(
    DEFAULT_NEXUS_APPEARANCE,
    deriveThemeCss(DEFAULT_NEXUS_APPEARANCE),
    derivePrefsCss(DEFAULT_NEXUS_APPEARANCE)
  );
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

  return createNexusAppearanceSnapshot(
    state,
    deriveThemeCss(state),
    derivePrefsCss(state)
  );
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
