/** Which semantic color tokens a component part reads, and the stories that show them. */
export interface ComponentTokenEntry {
  component: string;
  part: string;
  states: string;
  tokens: readonly string[];
  sourceFile: string;
  stories: readonly string[];
}

export const COMPONENT_TOKEN_MATRIX: readonly ComponentTokenEntry[] = [
  {
    component: 'Card',
    part: 'Root',
    states: 'Rest',
    tokens: ['container', 'container-foreground', 'border-default'],
    sourceFile: 'packages/react/src/components/card/card.tsx',
    stories: ['Default', 'AllVariants'],
  },
  {
    component: 'Button',
    part: 'Primary variant',
    states: 'Rest, hover, active, disabled',
    tokens: [
      'primary-background',
      'primary-background-hover',
      'primary-background-active',
      'primary-foreground',
      'primary-disabled',
    ],
    sourceFile: 'packages/react/src/components/button/button.tsx',
    stories: ['Primary', 'Disabled', 'VariantClassesMatchFigmaTokens'],
  },
  {
    component: 'Button',
    part: 'Outline and dashed variants',
    states: 'Rest, hover, active, disabled',
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
    stories: ['Outline', 'Dashed'],
  },
  {
    component: 'Input',
    part: 'Bordered field',
    states: 'Rest, hover, focus, invalid, disabled',
    tokens: [
      'container',
      'container-hover',
      'foreground',
      'muted-foreground',
      'border-default',
      'border-disabled',
      'border-error',
      'focus-default',
      'focus-error',
      'disabled',
      'disabled-foreground',
    ],
    sourceFile: 'packages/react/src/components/input/input.tsx',
    stories: ['VisualStateTokens', 'Invalid', 'Disabled'],
  },
  {
    component: 'Input',
    part: 'Borderless field',
    states: 'Rest, hover',
    tokens: ['control-background', 'control-background-hover', 'foreground'],
    sourceFile: 'packages/react/src/components/input/input.tsx',
    stories: ['BorderlessStates', 'BorderlessSurfaceComparison'],
  },
  {
    component: 'InputGroup',
    part: 'Group frame',
    states: 'Rest, hover, focus, invalid, disabled',
    tokens: [
      'container',
      'container-hover',
      'control-background',
      'control-background-hover',
      'border-default',
      'border-disabled',
      'border-error',
      'focus-default',
      'focus-error',
      'disabled',
      'disabled-foreground',
    ],
    sourceFile: 'packages/react/src/components/input-group/input-group.tsx',
    stories: ['VisualStateTokens', 'BorderlessHoverSurface', 'Invalid'],
  },
  {
    component: 'Table',
    part: 'Rows and header',
    states: 'Hover, selected, sticky header, striped rows',
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
    stories: ['SelectableRows', 'Striped', 'StickyHeader'],
  },
  {
    component: 'DropdownMenu',
    part: 'Content and item rows',
    states: 'Open, focus, destructive, separator',
    tokens: [
      'popover-alpha',
      'popover-hover',
      'popover-foreground',
      'error-background',
      'error-foreground',
      'border-default-alpha',
      'muted-foreground',
    ],
    sourceFile: 'packages/react/src/components/dropdown-menu/dropdown-menu.tsx',
    stories: ['KeyboardInteraction', 'WithDestructiveItem'],
  },
  {
    component: 'Select',
    part: 'Trigger and item rows',
    states: 'Rest, hover, focus, checked item',
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
    stories: ['AllVariants', 'KeyboardInteraction'],
  },
  {
    component: 'Popover',
    part: 'Floating content',
    states: 'Open',
    tokens: ['popover-alpha', 'popover-foreground', 'border-default'],
    sourceFile: 'packages/react/src/components/popover/popover.tsx',
    stories: ['Default', 'Placements'],
  },
  {
    component: 'NavigationMenu',
    part: 'Trigger and flyout',
    states: 'Rest, hover, open',
    tokens: [
      'background',
      'background-hover',
      'foreground',
      'focus-default',
      'popover-alpha',
      'popover-hover',
      'popover-foreground',
    ],
    sourceFile:
      'packages/react/src/components/navigation-menu/navigation-menu.tsx',
    stories: ['Default', 'WithoutViewport'],
  },
  {
    component: 'Menubar',
    part: 'Bar, trigger, floating menu',
    states: 'Rest, focus, open',
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
    stories: ['KeyboardInteraction', 'WithSubMenu'],
  },
  {
    component: 'Sidebar',
    part: 'Rail and menu buttons',
    states: 'Rest, hover, active, open',
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
    stories: ['Default', 'InteractiveControls', 'StylingContracts'],
  },
  {
    component: 'Command',
    part: 'Dialog content and command item',
    states: 'Rest, selected, separator',
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
    stories: ['WithDialog', 'KeyboardInteraction'],
  },
];

export function filterComponentTokens(
  query: string
): readonly ComponentTokenEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return COMPONENT_TOKEN_MATRIX;
  return COMPONENT_TOKEN_MATRIX.filter((entry) =>
    [
      entry.component,
      entry.part,
      entry.states,
      entry.sourceFile,
      ...entry.tokens,
      ...entry.stories,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  );
}
