export const COMPOSITE_UTILITIES: {
  group: string;
  items: { cls: string; sample: string }[];
}[] = [
  {
    group: 'Heading',
    items: [
      { cls: 'nx:typography-heading-large', sample: 'Heading Large' },
      { cls: 'nx:typography-heading-medium', sample: 'Heading Medium' },
      { cls: 'nx:typography-heading-small', sample: 'Heading Small' },
      { cls: 'nx:typography-heading-xsmall', sample: 'Heading XSmall' },
      { cls: 'nx:typography-heading-xxsmall', sample: 'Heading XXSmall' },
    ],
  },
  {
    group: 'Body',
    items: [
      {
        cls: 'nx:typography-body-default',
        sample: 'The quick brown fox jumps over the lazy dog.',
      },
      {
        cls: 'nx:typography-body-small',
        sample: 'The quick brown fox jumps over the lazy dog.',
      },
    ],
  },
  {
    group: 'Label',
    items: [
      { cls: 'nx:typography-label-default', sample: 'Label Default' },
      { cls: 'nx:typography-label-small', sample: 'Label Small' },
      { cls: 'nx:typography-label-caps', sample: 'LABEL CAPS' },
    ],
  },
  {
    group: 'Shortcut',
    items: [{ cls: 'nx:typography-shortcut', sample: 'Cmd+Shift+P' }],
  },
  {
    group: 'Code',
    items: [
      {
        cls: 'nx:typography-code-block',
        sample: 'const sum = (a, b) => a + b;',
      },
      { cls: 'nx:typography-code-inline', sample: 'useState<T>()' },
    ],
  },
];

export function collectTypographyUtilityClasses(
  node: Record<string, unknown>,
  path: string[] = []
): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    if (key.startsWith('$') || !value || typeof value !== 'object') return [];

    const child = value as Record<string, unknown>;
    const nextPath = [...path, key];

    if (child.$type === 'typography') {
      return [`nx:typography-${nextPath.join('-')}`];
    }

    return collectTypographyUtilityClasses(child, nextPath);
  });
}
