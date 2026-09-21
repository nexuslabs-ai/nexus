import {
  appearancePrefsToCss,
  createNexusAppearanceSnapshot,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  inspectTheme,
  type NexusAppearanceState,
  resolveFirstPaint,
  themeToCss,
} from '@nexus_ds/core';
import { BRAND_COLOR_PRESETS } from '@nexus_ds/core/palette';

const bluePreset = BRAND_COLOR_PRESETS.find(
  (preset) => preset.value === 'blue'
);
if (!bluePreset) throw new Error('Missing Blue brand preset');

export const PREVIEW_DEFAULT_STATE: NexusAppearanceState = {
  ...DEFAULT_NEXUS_APPEARANCE,
  brandColor: bluePreset.color,
};

export function createPreviewResult(
  state: NexusAppearanceState,
  revision: number,
  inspection = inspectTheme(createNexusThemeContract(state)),
  systemPrefersDark = false
) {
  const snapshot = createNexusAppearanceSnapshot(
    state,
    themeToCss(inspection.theme),
    appearancePrefsToCss(state.prefs)
  );
  return {
    state,
    inspection,
    render: {
      revision,
      appearance: resolveFirstPaint(snapshot, systemPrefersDark),
    },
  };
}

export type AcceptedPreview = ReturnType<typeof createPreviewResult>;

export function updatePreviewResult(
  previous: AcceptedPreview,
  patch: Partial<NexusAppearanceState>
): AcceptedPreview {
  const state = { ...previous.state, ...patch };
  const inspection =
    JSON.stringify(createNexusThemeContract(state)) ===
    JSON.stringify(createNexusThemeContract(previous.state))
      ? previous.inspection
      : inspectTheme(createNexusThemeContract(state));
  return createPreviewResult(state, previous.render.revision + 1, inspection);
}
