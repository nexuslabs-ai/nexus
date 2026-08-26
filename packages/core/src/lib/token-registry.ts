export type TokenCategory =
  | 'surface'
  | 'text'
  | 'border'
  | 'brand'
  | 'status'
  | 'chart'
  | 'focus'
  | 'alpha';

export interface SemanticTokenMeta {
  /** Bare token name, without the --nx-color- prefix. */
  name: string;
  category: TokenCategory;
  description?: string;
}

const SURFACE_TOKEN_NAMES = [
  'background',
  'background-hover',
  'background-active',
  'muted',
  'muted-extralight',
  'container',
  'container-hover',
  'container-active',
  'popover',
  'popover-hover',
  'popover-active',
  'control-background',
  'control-background-hover',
  'control-thumb',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
  'disabled',
  'border-active',
] as const;

const TEXT_TOKEN_NAMES = [
  'foreground',
  'container-foreground',
  'popover-foreground',
  'nav-foreground',
  'muted-foreground',
  'nav-muted-foreground',
  'muted-foreground-subtle',
  'disabled-foreground',
] as const;

const BORDER_TOKEN_NAMES = [
  'border-default',
  'border-disabled',
  'border-hairline',
] as const;

const BRAND_TOKEN_NAMES = [
  'primary-background',
  'primary-background-hover',
  'primary-background-active',
  'primary-foreground',
  'primary-disabled',
  'primary-subtle',
  'primary-subtle-foreground',
  'primary-subtle-hover',
  'primary-subtle-active',
  'border-primary',
  'border-primary-active',
  'secondary-background',
  'secondary-background-hover',
  'secondary-background-active',
  'secondary-foreground',
  'secondary-disabled',
  'secondary-subtle',
  'secondary-subtle-foreground',
  'secondary-subtle-hover',
  'secondary-subtle-active',
] as const;

const STATUS_TOKEN_NAMES = [
  'success-background',
  'success-background-hover',
  'success-background-active',
  'success-foreground',
  'success-disabled',
  'success-subtle',
  'success-subtle-foreground',
  'success-subtle-hover',
  'success-subtle-active',
  'border-success',
  'border-success-active',
  'warning-background',
  'warning-background-hover',
  'warning-background-active',
  'warning-foreground',
  'warning-disabled',
  'warning-subtle',
  'warning-subtle-foreground',
  'warning-subtle-hover',
  'warning-subtle-active',
  'border-warning',
  'border-warning-active',
  'error-background',
  'error-background-hover',
  'error-background-active',
  'error-foreground',
  'error-disabled',
  'error-subtle',
  'error-subtle-foreground',
  'error-subtle-hover',
  'error-subtle-active',
  'border-error',
  'border-error-active',
  'information-background',
  'information-background-hover',
  'information-background-active',
  'information-foreground',
  'information-disabled',
  'information-subtle',
  'information-subtle-foreground',
  'information-subtle-hover',
  'information-subtle-active',
  'border-information',
  'border-information-active',
] as const;

const CHART_TOKEN_NAMES = [
  'chart-categorical-1',
  'chart-categorical-2',
  'chart-categorical-3',
  'chart-categorical-4',
  'chart-categorical-5',
] as const;

const FOCUS_TOKEN_NAMES = ['focus-default', 'focus-error'] as const;

const ALPHA_TOKEN_NAMES = [
  'background-hover-alpha',
  'border-default-alpha',
  'overlay',
  'popover-alpha',
  'popover-backdrop',
] as const;

const DESCRIPTIONS: Partial<Record<string, string>> = {
  'muted-extralight':
    'Quietest muted surface — sits between background and muted for barely-there fills (empty states, subtle panels).',
  'muted-foreground':
    "It's a gray that softens contrast so primary content stands forward.",
  'muted-foreground-subtle':
    'Tertiary text tier below muted-foreground - helper text, captions, divider labels.',
};

function metas(
  category: TokenCategory,
  names: readonly string[]
): SemanticTokenMeta[] {
  return names.map((name) => ({
    name,
    category,
    ...(DESCRIPTIONS[name] ? { description: DESCRIPTIONS[name] } : {}),
  }));
}

export const SEMANTIC_TOKEN_REGISTRY: readonly SemanticTokenMeta[] = [
  ...metas('surface', SURFACE_TOKEN_NAMES),
  ...metas('text', TEXT_TOKEN_NAMES),
  ...metas('border', BORDER_TOKEN_NAMES),
  ...metas('brand', BRAND_TOKEN_NAMES),
  ...metas('status', STATUS_TOKEN_NAMES),
  ...metas('chart', CHART_TOKEN_NAMES),
  ...metas('focus', FOCUS_TOKEN_NAMES),
  ...metas('alpha', ALPHA_TOKEN_NAMES),
] as const;
