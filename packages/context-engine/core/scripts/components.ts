/**
 * Component Definitions for Processor
 *
 * Defines the list of Nexus design system components to process
 * through the extraction-generation processor.
 */

/**
 * Component definition for processor
 */
export interface ComponentDefinition {
  /** Component name (PascalCase) */
  name: string;

  /** Path to component source file (relative to scripts directory) */
  path: string;

  /** Optional path to Storybook stories file (relative to scripts directory) */
  storiesPath?: string;
}

/**
 * Nexus design system components to process
 *
 * Paths are relative to the scripts directory.
 */
export const COMPONENTS: ComponentDefinition[] = [
  {
    name: 'Button',
    path: '../../../../packages/react/src/components/ui/button.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Button.stories.tsx',
  },
  {
    name: 'Badge',
    path: '../../../../packages/react/src/components/ui/badge.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Badge.stories.tsx',
  },
  {
    name: 'Card',
    path: '../../../../packages/react/src/components/ui/card.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Card.stories.tsx',
  },
  {
    name: 'Avatar',
    path: '../../../../packages/react/src/components/ui/avatar.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Avatar.stories.tsx',
  },
  {
    name: 'Input',
    path: '../../../../packages/react/src/components/ui/input.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Input.stories.tsx',
  },
  {
    name: 'Switch',
    path: '../../../../packages/react/src/components/ui/switch.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Switch.stories.tsx',
  },
  {
    name: 'Accordion',
    path: '../../../../packages/react/src/components/ui/accordion.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Accordion.stories.tsx',
  },
  {
    name: 'Alert',
    path: '../../../../packages/react/src/components/ui/alert.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Alert.stories.tsx',
  },
  {
    name: 'Dialog',
    path: '../../../../packages/react/src/components/ui/dialog.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Dialog.stories.tsx',
  },
  {
    name: 'Tabs',
    path: '../../../../packages/react/src/components/ui/tabs.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Tabs.stories.tsx',
  },
  {
    name: 'Tooltip',
    path: '../../../../packages/react/src/components/ui/tooltip.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Tooltip.stories.tsx',
  },
  {
    name: 'Select',
    path: '../../../../packages/react/src/components/ui/select.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/Select.stories.tsx',
  },
  {
    name: 'DropdownMenu',
    path: '../../../../packages/react/src/components/ui/dropdown-menu.tsx',
    storiesPath:
      '../../../../packages/react/src/components/ui/DropdownMenu.stories.tsx',
  },
];

/**
 * Get all available component names
 */
export function getComponentNames(): string[] {
  return COMPONENTS.map((c) => c.name);
}

/**
 * Find a component by name (case-insensitive)
 */
export function findComponent(name: string): ComponentDefinition | undefined {
  const lowerName = name.toLowerCase();
  return COMPONENTS.find((c) => c.name.toLowerCase() === lowerName);
}
