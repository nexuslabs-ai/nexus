import { SEMANTIC_TOKEN_REGISTRY } from '@nexus_ds/core';

export type ColorDraftSource = 'primitive' | 'custom';
export type ColorDraftMode = 'light' | 'dark' | 'both';

export interface ColorDraftOverride {
  source: ColorDraftSource;
  mode: ColorDraftMode;
  value: string;
  label?: string;
}

export type ColorDraftOverrides = Record<string, ColorDraftOverride>;

export const COLOR_DRAFT_STYLE_ATTRIBUTE = 'data-nexus-color-draft';
export const DEFAULT_COLOR_DRAFT_MODE: ColorDraftMode = 'light';

export const PRIMITIVE_FAMILIES = [
  'amber',
  'blue',
  'cyan',
  'emerald',
  'fuchsia',
  'gray',
  'green',
  'indigo',
  'lime',
  'neutral',
  'orange',
  'pink',
  'purple',
  'red',
  'rose',
  'sky',
  'slate',
  'stone',
  'teal',
  'violet',
  'yellow',
  'zinc',
] as const;

export type PrimitiveFamily = (typeof PRIMITIVE_FAMILIES)[number];

const BASE_SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

const SURFACE_TONE_SHADES = [
  '50',
  '75',
  '100',
  '150',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

const SURFACE_TONE_FAMILIES = new Set<PrimitiveFamily>([
  'gray',
  'neutral',
  'slate',
  'stone',
  'zinc',
]);

const TOKEN_NAMES = new Set(SEMANTIC_TOKEN_REGISTRY.map((token) => token.name));
const UNSAFE_CUSTOM_COLOR_PARTS = ['var(', 'url(', ';', '{', '}', '/*'];
const PRIMITIVE_VALUE_PATTERN =
  /^var\(--nx-color-[a-z]+-(?:50|75|100|150|200|300|400|500|600|700|800|900|950)\)$/;

export function isKnownToken(token: string): boolean {
  return TOKEN_NAMES.has(token);
}

export function shadesForFamily(family: PrimitiveFamily): readonly string[] {
  if (SURFACE_TONE_FAMILIES.has(family)) return SURFACE_TONE_SHADES;
  return BASE_SHADES;
}

export function primitiveValue(family: PrimitiveFamily, shade: string): string {
  return `var(--nx-color-${family}-${shade})`;
}

export function isColorDraftMode(value: unknown): value is ColorDraftMode {
  return value === 'light' || value === 'dark' || value === 'both';
}

export function colorDraftModeLabel(mode: ColorDraftMode): string {
  if (mode === 'both') return 'Light + dark';
  if (mode === 'dark') return 'Dark';
  return 'Light';
}

function defaultSupportsColor(value: string): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false;
  }

  return CSS.supports('color', value);
}

export function validateCustomColor(
  input: string,
  supportsColor: (value: string) => boolean = defaultSupportsColor
): string | null {
  const value = input.trim();
  if (!value) return null;

  const lowerValue = value.toLowerCase();
  if (UNSAFE_CUSTOM_COLOR_PARTS.some((part) => lowerValue.includes(part))) {
    return null;
  }

  if (!supportsColor(value)) return null;

  return value;
}

function sanitizeOverride(
  token: string,
  value: unknown,
  supportsColor: (value: string) => boolean
): ColorDraftOverride | null {
  if (!isKnownToken(token)) return null;
  if (!value || typeof value !== 'object') return null;

  const draft = value as Partial<ColorDraftOverride>;
  if (draft.source !== 'primitive' && draft.source !== 'custom') return null;
  if (typeof draft.value !== 'string') return null;
  const mode = isColorDraftMode(draft.mode)
    ? draft.mode
    : DEFAULT_COLOR_DRAFT_MODE;

  if (draft.source === 'primitive') {
    if (!PRIMITIVE_VALUE_PATTERN.test(draft.value)) return null;

    return {
      source: 'primitive',
      mode,
      value: draft.value,
      ...(typeof draft.label === 'string' ? { label: draft.label } : {}),
    };
  }

  const customValue = validateCustomColor(draft.value, supportsColor);
  if (!customValue) return null;

  return {
    source: 'custom',
    mode,
    value: customValue,
    ...(typeof draft.label === 'string' ? { label: draft.label } : {}),
  };
}

export function sanitizeOverrides(
  input: unknown,
  supportsColor: (value: string) => boolean = defaultSupportsColor
): ColorDraftOverrides {
  if (!input || typeof input !== 'object') return {};

  const output: ColorDraftOverrides = {};

  for (const [token, value] of Object.entries(input)) {
    const sanitized = sanitizeOverride(token, value, supportsColor);
    if (sanitized) output[token] = sanitized;
  }

  return output;
}

function sortedOverrides(overrides: ColorDraftOverrides) {
  return Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b));
}

export function buildDraftCss(overrides: ColorDraftOverrides): string {
  const entries = sortedOverrides(overrides);
  if (entries.length === 0) return '';

  const lightDeclarations: string[] = [];
  const darkDeclarations: string[] = [];

  for (const [token, override] of entries) {
    const declaration = `  --nx-color-${token}: ${override.value};`;

    if (override.mode === 'light' || override.mode === 'both') {
      lightDeclarations.push(declaration);
    }

    if (override.mode === 'dark' || override.mode === 'both') {
      darkDeclarations.push(declaration);
    }
  }

  return [
    lightDeclarations.length > 0
      ? `html:root {\n${lightDeclarations.join('\n')}\n}`
      : '',
    darkDeclarations.length > 0
      ? `html:root.dark {\n${darkDeclarations.join('\n')}\n}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function buildExportJson(overrides: ColorDraftOverrides): string {
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const [token, override] of sortedOverrides(overrides)) {
    const variableName = `--nx-color-${token}`;

    if (override.mode === 'light' || override.mode === 'both') {
      light[variableName] = override.value;
    }

    if (override.mode === 'dark' || override.mode === 'both') {
      dark[variableName] = override.value;
    }
  }

  const output = {
    ...(Object.keys(light).length > 0 ? { light } : {}),
    ...(Object.keys(dark).length > 0 ? { dark } : {}),
  };

  return JSON.stringify(output, null, 2);
}

export function buildExportSummary(overrides: ColorDraftOverrides): string {
  const entries = sortedOverrides(overrides);
  if (entries.length === 0) return 'No semantic color draft overrides.';

  return entries
    .map(([token, override]) => {
      const sourceLabel =
        override.source === 'primitive'
          ? (override.label ?? override.value)
          : 'custom CSS color';
      return `${token} (${colorDraftModeLabel(override.mode)}) = ${
        override.value
      } (${sourceLabel})`;
    })
    .join('\n');
}

export function applyColorDraft(overrides: ColorDraftOverrides): void {
  if (typeof document === 'undefined') return;

  const css = buildDraftCss(overrides);
  if (!css) {
    removeColorDraft();
    return;
  }

  const selector = `style[${COLOR_DRAFT_STYLE_ATTRIBUTE}]`;
  const existing = document.head.querySelector<HTMLStyleElement>(selector);
  const style = existing ?? document.createElement('style');

  if (!existing) {
    style.setAttribute(COLOR_DRAFT_STYLE_ATTRIBUTE, '');
    document.head.appendChild(style);
  }

  style.textContent = css;
}

export function removeColorDraft(): void {
  if (typeof document === 'undefined') return;

  const selector = `style[${COLOR_DRAFT_STYLE_ATTRIBUTE}]`;
  document.head.querySelector(selector)?.remove();
}
