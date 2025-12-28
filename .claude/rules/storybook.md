# Storybook Rules

**Note:** All Tailwind utility classes in stories must use `nx:` prefix (e.g., `className="nx:flex nx:gap-2"`).

## File Naming

Stories file: `{ComponentName}.stories.tsx` (PascalCase)

Example: `Button.stories.tsx`, `Card.stories.tsx`

## Adaptation Note

This template assumes components with `variant`, `size`, `disabled`, and `asChild` props. **Adapt based on actual component API:**

| Component Type | Typical Stories |
|----------------|-----------------|
| Interactive (Button, Input) | Variants, Sizes, Disabled, States |
| Container (Card, Dialog) | Default, WithContent, Composition |
| Display (Badge, Avatar) | Variants, Sizes |
| Layout (Separator, Spacer) | Default, Orientation |

Skip sections that don't apply. Add component-specific stories as needed.

## Meta Configuration

```tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Component } from './component';

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'The visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'The size of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (for composition)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;
```

## Required Stories

Every component must have these stories:

### 1. Default Story

```tsx
export const Default: Story = {
  args: {
    children: 'Component',
  },
};
```

### 2. Individual Variant Stories

```tsx
export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};
```

### 3. Size Stories

```tsx
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};
```

### 4. Disabled Story

```tsx
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
```

### 5. AllVariants Grid

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">Variants</h3>
        <div className="nx:flex nx:gap-2">
          <Component variant="primary">Primary</Component>
          <Component variant="secondary">Secondary</Component>
          <Component variant="outline">Outline</Component>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">Sizes</h3>
        <div className="nx:flex nx:items-center nx:gap-2">
          <Component size="sm">Small</Component>
          <Component size="default">Default</Component>
          <Component size="lg">Large</Component>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">Disabled</h3>
        <div className="nx:flex nx:gap-2">
          <Component variant="primary" disabled>Primary</Component>
          <Component variant="secondary" disabled>Secondary</Component>
          <Component variant="outline" disabled>Outline</Component>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
```

### 6. Usage Examples (as needed)

```tsx
// With Icon
export const WithIcon: Story = {
  render: () => (
    <Component>
      <IconComponent />
      With Icon
    </Component>
  ),
};

// As Link (using asChild)
export const AsLink: Story = {
  render: () => (
    <Component asChild>
      <a href="https://example.com">Visit Website</a>
    </Component>
  ),
};
```

## Layout Parameters

| Layout | Use Case |
|--------|----------|
| `centered` | Single component display (default) |
| `padded` | Multi-component grids like AllVariants |
| `fullscreen` | Full-page components |

## Theme Testing

Storybook has a theme toggle in the toolbar. Stories automatically support:
- Light mode (default)
- Dark mode (via `.dark` class wrapper)

## Running Storybook

```bash
yarn storybook        # Dev server on port 6006
yarn build-storybook  # Build static site
```

## Story Organization

Stories appear in sidebar under `Components/{ComponentName}`:

```
Components/
├── Button
│   ├── Default
│   ├── Primary
│   ├── Secondary
│   ├── Outline
│   ├── Small
│   ├── Large
│   ├── Disabled
│   ├── AllVariants
│   ├── WithIcon
│   └── AsLink
```

## Autodocs

The `tags: ['autodocs']` in meta generates automatic documentation including:
- Component description
- Props table
- Interactive playground
- All story examples
