# Contributing to Nexus Design System

## Testing Philosophy

We use a **three-layer testing approach** where each layer has a distinct purpose. This prevents duplication and ensures comprehensive coverage.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHROMATIC                                │
│         Visual regression • Cross-browser • Responsive          │
├─────────────────────────────────────────────────────────────────┤
│                        STORYBOOK                                │
│         Visual docs • Playground • Usage examples               │
├─────────────────────────────────────────────────────────────────┤
│                      UNIT TESTS (Vitest)                        │
│         Behavior • Interactions • Accessibility • Edge cases    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Unit Tests (Vitest + React Testing Library)

**Purpose:** Verify component behavior and logic works correctly.

### What to Test

| Category          | Tests      | What to Cover                                                                                |
| ----------------- | ---------- | -------------------------------------------------------------------------------------------- |
| **Rendering**     | 2-3        | Basic render, renders children, renders correct element type                                 |
| **Props**         | 4-6        | className merging, native HTML props, data attributes, asChild polymorphism                  |
| **Variants**      | All combos | Every variant + size combination applies correct classes                                     |
| **Interactions**  | 3-5        | Click handlers, disabled state, focus management, keyboard (Enter/Space)                     |
| **Accessibility** | 3-5        | axe audit, aria-label, aria-describedby, disabled state, role                                |
| **Edge Cases**    | 3-5        | Empty children, long content, special characters, React elements as children, ref forwarding |

### Test File Structure

```tsx
// button.test.tsx
import { axe, render, screen, userEvent } from '@nexus/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { Button, buttonVariants } from './button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Button>Hello World</Button>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as button element by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button').tagName).toBe('BUTTON');
    });
  });

  describe('Props', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Click</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('passes native button props', () => {
      render(<Button type="submit" name="test-btn">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'test-btn');
    });

    it('applies data-slot attribute', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
    });

    it('supports asChild prop for polymorphism', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    it.each([
      ['primary', 'bg-primary'],
      ['secondary', 'bg-secondary'],
      ['outline', 'border'],
    ])('applies %s variant classes', (variant, expectedClass) => {
      render(<Button variant={variant as any}>Click</Button>);
      expect(screen.getByRole('button').className).toContain(expectedClass);
    });

    it.each([
      ['default', 'h-9'],
      ['sm', 'h-8'],
      ['lg', 'h-10'],
    ])('applies %s size classes', (size, expectedClass) => {
      render(<Button size={size as any}>Click</Button>);
      expect(screen.getByRole('button')).toHaveClass(expectedClass);
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('can be focused', async () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole('button');
      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it('triggers click on Enter key', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      screen.getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('triggers click on Space key', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      screen.getByRole('button').focus();
      await userEvent.keyboard(' ');
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="desc">Click</Button>
          <span id="desc">This button submits the form</span>
        </>
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'desc');
    });

    it('has correct disabled state for assistive technology', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles very long text content', () => {
      const longText = 'A'.repeat(100);
      render(<Button>{longText}</Button>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles special characters', () => {
      render(<Button>Click & Save <Test></Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click & Save <Test>');
    });

    it('handles React elements as children', () => {
      render(
        <Button>
          <span data-testid="icon">🚀</span>
          Launch
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Click</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
```

### What NOT to Test in Unit Tests

- Visual appearance (use Storybook/Chromatic)
- CSS values or computed styles
- Hover/focus visual states
- Responsive behavior
- Animation timing

---

## Layer 2: Storybook

**Purpose:** Visual documentation and interactive playground for designers and developers.

### What to Cover in Stories

| Story Type       | Purpose                  | Example                             |
| ---------------- | ------------------------ | ----------------------------------- |
| **Default**      | Primary use case         | `<Button>Click me</Button>`         |
| **All Variants** | Show each variant option | Primary, Secondary, Outline         |
| **All Sizes**    | Show each size option    | Small, Default, Large               |
| **States**       | Interactive states       | Hover, Focus, Active, Disabled      |
| **With Icons**   | Icon placement patterns  | Left icon, Right icon, Icon only    |
| **Composition**  | Common patterns          | Button groups, With loading spinner |
| **Playground**   | Interactive controls     | All props configurable              |

### Story File Structure

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// Variants
export const Primary: Story = {
  args: { children: 'Primary', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};

export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
};

// Sizes
export const Small: Story = {
  args: { children: 'Small', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Large', size: 'lg' },
};

// States
export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};

// All variants grid (for visual comparison)
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  ),
};
```

### What NOT to Include in Storybook

- Implementation details or internal logic
- Test assertions
- Edge case scenarios (unless visually relevant)

---

## Layer 3: Chromatic (Visual Regression)

**Purpose:** Catch unintended visual changes across browsers and viewports.

### What Chromatic Captures

| Test Type              | What It Does                                |
| ---------------------- | ------------------------------------------- |
| **Snapshot Baseline**  | Captures visual state of each story         |
| **Diff Detection**     | Highlights pixel differences from baseline  |
| **Cross-browser**      | Tests Chrome, Firefox, Safari               |
| **Responsive**         | Tests at multiple viewport widths           |
| **Interaction States** | Captures hover, focus, active if configured |

### Chromatic Best Practices

1. **One visual state per story** - Makes diffs easy to identify
2. **Use consistent viewport** - Set in Storybook parameters
3. **Avoid animations** - Disable or mock for consistent snapshots
4. **Review all changes** - Don't auto-accept without checking

### Configuring Stories for Chromatic

```tsx
// Disable animations for consistent snapshots
export const Animated: Story = {
  parameters: {
    chromatic: {
      disableSnapshot: false,
      delay: 300, // Wait for animations
    },
  },
};

// Test at specific viewports
export const Responsive: Story = {
  parameters: {
    chromatic: {
      viewports: [320, 768, 1200],
    },
  },
};

// Skip specific stories from Chromatic
export const Development: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
```

---

## Component Checklist

Use this checklist when creating or updating a component:

### Unit Tests

- [ ] Rendering (2-3 tests)
  - [ ] Renders without crashing
  - [ ] Renders children correctly
  - [ ] Renders correct element type
- [ ] Props (4-6 tests)
  - [ ] className merging works
  - [ ] Native HTML props pass through
  - [ ] data-slot attribute present
  - [ ] asChild polymorphism works (if applicable)
  - [ ] Custom data attributes work
- [ ] Variants (all combinations)
  - [ ] Each variant applies correct classes
  - [ ] Each size applies correct classes
  - [ ] Default variants work
- [ ] Interactions (3-5 tests)
  - [ ] Click handler fires
  - [ ] Disabled state prevents interaction
  - [ ] Focus management works
  - [ ] Keyboard navigation (Enter/Space)
- [ ] Accessibility (3-5 tests)
  - [ ] No axe violations
  - [ ] aria-label support
  - [ ] aria-describedby support
  - [ ] Correct disabled state for AT
- [ ] Edge Cases (3-5 tests)
  - [ ] Empty children
  - [ ] Long content
  - [ ] Special characters
  - [ ] React elements as children
  - [ ] Ref forwarding

### Storybook

- [ ] Default story
- [ ] All variants
- [ ] All sizes
- [ ] Disabled state
- [ ] With icons (if applicable)
- [ ] AllVariants grid story
- [ ] Autodocs enabled

### Chromatic

- [ ] Stories appear in Chromatic builds
- [ ] Baseline approved
- [ ] Viewport tests configured (if responsive)

---

## Quick Reference

### Test Imports

```tsx
// Unit tests
import { axe, render, screen, userEvent } from '@nexus/test-utils';
import { describe, expect, it, vi } from 'vitest';

// Stories
import type { Meta, StoryObj } from '@storybook/react';
```

### Running Tests

```bash
yarn test              # Run all unit tests
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage report
yarn storybook         # Start Storybook dev server
yarn build-storybook   # Build static Storybook
```

### Test File Naming

```
button.tsx           # Component
button.test.tsx      # Unit tests (same directory)
Button.stories.tsx   # Storybook stories (same directory)
```
