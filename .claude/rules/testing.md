# Testing Rules

## Imports

```tsx
import { axe, render, screen, userEvent } from '@nexus/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { Component, componentVariants } from './component';
```

## Test Structure

Organize tests into 6 describe blocks:

```tsx
describe('Component', () => {
  describe('Rendering', () => {
    // Basic render tests
  });

  describe('Props', () => {
    // Props handling tests
  });

  describe('Variants', () => {
    // Variant/size combination tests
  });

  describe('Interactions', () => {
    // User interaction tests
  });

  describe('Accessibility', () => {
    // a11y tests
  });

  describe('Edge Cases', () => {
    // Edge case handling
  });
});
```

## Rendering Tests

```tsx
describe('Rendering', () => {
  it('renders without crashing', () => {
    render(<Component>Content</Component>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<Component>Hello World</Component>);
    expect(screen.getByRole('button')).toHaveTextContent('Hello World');
  });

  it('renders as correct element by default', () => {
    render(<Component>Content</Component>);
    expect(screen.getByRole('button').tagName).toBe('BUTTON');
  });
});
```

## Props Tests

```tsx
describe('Props', () => {
  it('applies custom className', () => {
    render(<Component className="custom-class">Content</Component>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards native props', () => {
    render(<Component type="submit" disabled>Submit</Component>);
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('type', 'submit');
    expect(el).toBeDisabled();
  });

  it('sets data-slot attribute', () => {
    render(<Component>Content</Component>);
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'component');
  });

  it('sets data-variant attribute', () => {
    render(<Component variant="secondary">Content</Component>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'secondary');
  });

  it('sets data-size attribute', () => {
    render(<Component size="lg">Content</Component>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
  });

  it('supports asChild prop for composition', () => {
    render(
      <Component asChild>
        <a href="/test">Link</a>
      </Component>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('data-slot', 'component');
  });
});
```

## Variants Tests

```tsx
describe('Variants', () => {
  it('renders primary variant by default', () => {
    render(<Component>Primary</Component>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('renders secondary variant', () => {
    render(<Component variant="secondary">Secondary</Component>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
  });

  // Test each variant...

  it('componentVariants function generates correct classes', () => {
    const classes = componentVariants({ variant: 'secondary', size: 'lg' });
    expect(classes).toContain('bg-secondary');
    expect(classes).toContain('h-10');
  });
});
```

## Interactions Tests

```tsx
describe('Interactions', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Component onClick={handleClick}>Click me</Component>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Component onClick={handleClick} disabled>Click me</Component>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('can be focused with keyboard', async () => {
    const user = userEvent.setup();
    render(<Component>Focusable</Component>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('can be triggered with Enter key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Component onClick={handleClick}>Press Enter</Component>);
    await user.tab();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Accessibility Tests

```tsx
describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Component>Accessible</Component>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when disabled', async () => {
    const { container } = render(<Component disabled>Disabled</Component>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports aria-label', () => {
    render(<Component aria-label="Close">×</Component>);
    expect(screen.getByRole('button')).toHaveAccessibleName('Close');
  });
});
```

## Edge Cases Tests

```tsx
describe('Edge Cases', () => {
  it('handles empty children', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles long content', () => {
    const longText = 'A'.repeat(100);
    render(<Component>{longText}</Component>);
    expect(screen.getByRole('button')).toHaveTextContent(longText);
  });

  it('handles special characters', () => {
    render(<Component>{'<script>alert("xss")</script>'}</Component>);
    expect(screen.getByRole('button')).toHaveTextContent('<script>');
  });

  it('handles React elements as children', () => {
    render(
      <Component>
        <span data-testid="icon">🎉</span>
        Text
      </Component>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
```

## Dark Mode Testing

```tsx
// Light mode (default)
render(<Component>Light</Component>);

// Dark mode
render(<Component>Dark</Component>, { theme: 'dark' });
```

## Running Tests

```bash
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage report
```

Coverage thresholds: 70% for statements, branches, functions, lines.
