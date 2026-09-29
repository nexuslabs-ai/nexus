import type {
  NexusAppearanceMode,
  NexusAppearanceState,
} from './appearance-model';

/** Marks the element Nexus styles apply to; its value keys the runtime CSS. */
export const NEXUS_ROOT_ATTRIBUTE = 'data-nexus-root';

/** Key for the standalone root on `<html>`. */
export const NEXUS_DOCUMENT_ROOT_KEY = 'document';

export const NEXUS_MODE_ATTRIBUTE = 'data-nx-mode';

/** Root attribute → the appearance field it carries. */
export const NEXUS_APPEARANCE_ATTRIBUTE_FIELDS = {
  'data-nx-density': 'density',
  'data-nx-radius': 'corners',
  'data-nx-shadow': 'elevation',
  'data-nx-borderwidth': 'stroke',
} as const satisfies Record<string, keyof NexusAppearanceState>;

/** Every attribute a Nexus root carries. */
export const NEXUS_ROOT_ATTRIBUTES = [
  NEXUS_ROOT_ATTRIBUTE,
  NEXUS_MODE_ATTRIBUTE,
  ...(Object.keys(
    NEXUS_APPEARANCE_ATTRIBUTE_FIELDS
  ) as (keyof typeof NEXUS_APPEARANCE_ATTRIBUTE_FIELDS)[]),
] as const;

export type NexusRootAttributeName = (typeof NEXUS_ROOT_ATTRIBUTES)[number];

export type NexusResolvedMode = Exclude<NexusAppearanceMode, 'system'>;

/** Tailwind's layer order; stated first so an early runtime `<style>` cannot reorder the layers. */
export const NEXUS_LAYER_ORDER = '@layer theme, base, components, utilities;';

/** Selector for the Nexus root with the given key. */
export function nexusRootScope(key: string): string {
  const value = key
    .replace(/["\\]/g, '\\$&')
    .replace(/[\n\r\f]/g, (c) => `\\${c.charCodeAt(0).toString(16)} `);
  return `[${NEXUS_ROOT_ATTRIBUTE}="${value}"]`;
}

/** The attributes a Nexus root renders for an appearance. */
export function nexusRootAttributes(
  state: NexusAppearanceState,
  resolvedMode: NexusResolvedMode,
  key: string
): Record<NexusRootAttributeName, string> {
  const fields = Object.entries(NEXUS_APPEARANCE_ATTRIBUTE_FIELDS).map(
    ([attribute, field]) => [attribute, state[field]]
  );
  return Object.fromEntries([
    [NEXUS_ROOT_ATTRIBUTE, key],
    [NEXUS_MODE_ATTRIBUTE, resolvedMode],
    ...fields,
  ]) as Record<NexusRootAttributeName, string>;
}
