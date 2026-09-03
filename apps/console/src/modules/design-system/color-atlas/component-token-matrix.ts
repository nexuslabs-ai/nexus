import { SEMANTIC_TOKEN_REGISTRY } from '@nexus_ds/core';

export interface ComponentTokenMatrixEntry {
  component: string;
  part: string;
  state: string;
  tokens: readonly string[];
  sourceFile: string;
  storybookCheck: string;
  note?: string;
}

export const COMPONENT_TOKEN_MATRIX = [
  {
    component: 'Card',
    part: 'Root',
    state: 'Rest',
    tokens: ['container', 'container-foreground', 'border-default'],
    sourceFile: 'packages/react/src/components/card/card.tsx',
    storybookCheck: 'Card stories: compare root fill, text, and border.',
  },
  {
    component: 'Button',
    part: 'Primary variant',
    state: 'Rest, hover, active, disabled',
    tokens: [
      'primary-background',
      'primary-background-hover',
      'primary-background-active',
      'primary-foreground',
      'primary-disabled',
    ],
    sourceFile: 'packages/react/src/components/button/button.tsx',
    storybookCheck:
      'Button stories: InteractionStateTokens verifies hover/active classes.',
  },
  {
    component: 'Button',
    part: 'Outline / dashed variants',
    state: 'Rest, hover, active, disabled',
    tokens: [
      'container',
      'container-hover',
      'container-active',
      'foreground',
      'border-default',
      'disabled',
      'disabled-foreground',
    ],
    sourceFile: 'packages/react/src/components/button/button.tsx',
    storybookCheck: 'Button stories: Outline and Dashed variants.',
  },
  {
    component: 'Input',
    part: 'Bordered field',
    state: 'Rest, hover, focus, invalid, disabled',
    tokens: [
      'container',
      'container-hover',
      'foreground',
      'muted-foreground',
      'border-default',
      'border-disabled',
      'focus-default',
      'focus-error',
      'disabled',
      'disabled-foreground',
    ],
    sourceFile: 'packages/react/src/components/input/input.tsx',
    storybookCheck: 'Input stories: HoverToken and DisabledTokenSentinel.',
  },
  {
    component: 'Input',
    part: 'Borderless field',
    state: 'Rest, hover',
    tokens: ['control-background', 'control-background-hover', 'foreground'],
    sourceFile: 'packages/react/src/components/input/input.tsx',
    storybookCheck: 'Input stories: BorderlessBackgrounds.',
  },
  {
    component: 'InputGroup',
    part: 'Group frame',
    state: 'Rest, hover, focus, invalid, disabled',
    tokens: [
      'container',
      'container-hover',
      'control-background',
      'control-background-hover',
      'border-default',
      'border-disabled',
      'focus-default',
      'focus-error',
      'disabled',
      'disabled-foreground',
    ],
    sourceFile: 'packages/react/src/components/input-group/input-group.tsx',
    storybookCheck:
      'InputGroup stories: SurfaceTokens, BorderlessHover, HoverTokenSentinel.',
  },
  {
    component: 'Table',
    part: 'Rows and header',
    state: 'Hover, selected, sticky header, striped rows',
    tokens: [
      'background-hover',
      'control-background',
      'control-background-hover',
      'container',
      'muted',
      'muted-foreground',
      'border-default-alpha',
      'focus-default',
    ],
    sourceFile: 'packages/react/src/components/table/table.tsx',
    storybookCheck: 'Table stories: HoverSelectedStriped and StickyHeader.',
  },
  {
    component: 'DropdownMenu',
    part: 'Content and item rows',
    state: 'Open, focus, destructive, separator',
    tokens: [
      'popover-alpha',
      'popover',
      'popover-hover',
      'popover-foreground',
      'error-background',
      'error-foreground',
      'border-default-alpha',
      'muted-foreground',
    ],
    sourceFile: 'packages/react/src/components/dropdown-menu/dropdown-menu.tsx',
    storybookCheck: 'DropdownMenu stories: KeyboardNavigation and Destructive.',
  },
  {
    component: 'Select',
    part: 'Trigger and item rows',
    state: 'Rest, hover, focus, checked item',
    tokens: [
      'container',
      'container-hover',
      'control-background',
      'control-background-hover',
      'popover-hover',
      'popover-foreground',
      'border-default',
      'focus-default',
    ],
    sourceFile: 'packages/react/src/components/select/select.tsx',
    storybookCheck: 'Select stories: variants and keyboard navigation.',
  },
  {
    component: 'Popover',
    part: 'Floating content',
    state: 'Open',
    tokens: [
      'popover-alpha',
      'popover',
      'popover-foreground',
      'border-default',
    ],
    sourceFile: 'packages/react/src/components/popover/popover.tsx',
    storybookCheck: 'Popover stories: Default and Placement.',
  },
  {
    component: 'NavigationMenu',
    part: 'Trigger and flyout',
    state: 'Rest, hover, open',
    tokens: [
      'background',
      'background-hover',
      'foreground',
      'focus-default',
      'popover-alpha',
      'popover-foreground',
    ],
    sourceFile:
      'packages/react/src/components/navigation-menu/navigation-menu.tsx',
    storybookCheck: 'NavigationMenu stories: WithViewport and InlineContent.',
  },
  {
    component: 'Menubar',
    part: 'Bar, trigger, floating menu',
    state: 'Rest, focus, open',
    tokens: [
      'container',
      'container-hover',
      'foreground',
      'border-default',
      'popover-alpha',
      'popover-hover',
      'popover-foreground',
    ],
    sourceFile: 'packages/react/src/components/menubar/menubar.tsx',
    storybookCheck: 'Menubar stories: KeyboardNavigation and Submenus.',
  },
  {
    component: 'Sidebar',
    part: 'Rail and menu buttons',
    state: 'Rest, hover, active, open',
    tokens: [
      'nav-background',
      'nav-foreground',
      'nav-muted-foreground',
      'nav-item-hover',
      'nav-item-active',
      'nav-border',
      'focus-default',
    ],
    sourceFile: 'packages/react/src/components/sidebar/sidebar.tsx',
    storybookCheck:
      'Sidebar stories: active menu item plus hover/open menu action states.',
  },
  {
    component: 'Command',
    part: 'Dialog content and command item',
    state: 'Rest, selected, separator',
    tokens: [
      'popover',
      'popover-hover',
      'popover-foreground',
      'border-default',
      'border-active',
      'border-default-alpha',
      'muted-foreground',
    ],
    sourceFile: 'packages/react/src/components/command/command.tsx',
    storybookCheck: 'Command stories: Dialog and ItemSelected.',
  },
] as const satisfies readonly ComponentTokenMatrixEntry[];

const TOKEN_NAMES = new Set(SEMANTIC_TOKEN_REGISTRY.map((token) => token.name));

export function matrixUnknownTokens(
  entries: readonly ComponentTokenMatrixEntry[] = COMPONENT_TOKEN_MATRIX
): string[] {
  const unknown = new Set<string>();

  for (const entry of entries) {
    for (const token of entry.tokens) {
      if (!TOKEN_NAMES.has(token)) unknown.add(token);
    }
  }

  return [...unknown].sort();
}

export function filterMatrix(
  entries: readonly ComponentTokenMatrixEntry[],
  query: string
): ComponentTokenMatrixEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...entries];

  return entries.filter((entry) =>
    [
      entry.component,
      entry.part,
      entry.state,
      entry.sourceFile,
      entry.storybookCheck,
      entry.note ?? '',
      ...entry.tokens,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );
}
