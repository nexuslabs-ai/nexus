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
