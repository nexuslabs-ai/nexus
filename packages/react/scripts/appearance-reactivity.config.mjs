export const APPEARANCE_REACTIVITY_SCAN_ROOTS = [
  'packages/react/src/components',
  'apps/console/src/modules/design-system/appearance',
];

export const APPEARANCE_REACTIVITY_ALLOWLIST = [
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[0.625rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[0.6875rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[0.75rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[1rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[1.125rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[1.25rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[1.5rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[1.875rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/avatar/avatar.tsx',
    className: 'nx:text-[2.25rem]',
    reason: 'Avatar initials scale with the fixed avatar size ladder.',
  },
  {
    file: 'packages/react/src/components/ui/chart/chart.tsx',
    className: 'nx:rounded-[2px]',
    reason: 'Chart swatches need a tiny non-interactive mark radius.',
  },
  {
    file: 'packages/react/src/components/ui/chart/chart.tsx',
    className: 'nx:border-[1.5px]',
    reason:
      'Chart tooltip mark uses a fixed stroke matching chart glyphs.',
  },
];
