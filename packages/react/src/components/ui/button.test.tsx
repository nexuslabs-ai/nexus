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
      expect(screen.getByRole('button')).toHaveTextContent('Hello World');
    });

    it('renders as button element by default', () => {
      render(<Button>Content</Button>);
      expect(screen.getByRole('button').tagName).toBe('BUTTON');
    });
  });

  describe('Props', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Content</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('forwards native button props', () => {
      render(
        <Button type="submit" disabled>
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
    });

    it('sets data-slot attribute', () => {
      render(<Button>Content</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
    });

    it('sets data-variant attribute', () => {
      render(<Button variant="secondary">Content</Button>);
      expect(screen.getByRole('button')).toHaveAttribute(
        'data-variant',
        'secondary'
      );
    });

    it('sets data-size attribute', () => {
      render(<Button size="lg">Content</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
    });

    it('supports asChild prop for composition', () => {
      render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('data-slot', 'button');
    });
  });

  describe('Variants', () => {
    it('renders default variant by default', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('nx:bg-primary-background');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'nx:bg-secondary-background'
      );
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('nx:bg-error-background');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('nx:border-border-default');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('nx:bg-primary-background');
      expect(button).not.toHaveClass('nx:bg-secondary-background');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('nx:text-primary-text');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('nx:px-3');
      expect(button).toHaveClass('nx:py-1.5');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('nx:px-8');
      expect(button).toHaveClass('nx:py-3');
    });

    it('renders icon size', () => {
      render(<Button size="icon">★</Button>);
      expect(screen.getByRole('button')).toHaveClass('nx:p-2.5');
    });

    it('buttonVariants function generates correct classes', () => {
      const classes = buttonVariants({ variant: 'secondary', size: 'lg' });
      expect(classes).toContain('nx:bg-secondary-background');
      expect(classes).toContain('nx:py-3');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('can be focused with keyboard', async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('can be triggered with Enter key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Press Enter</Button>);
      await user.tab();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be triggered with Space key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Press Space</Button>);
      await user.tab();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Button>Accessible</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByRole('button')).toHaveAccessibleName('Close dialog');
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="description">Action</Button>
          <span id="description">This action cannot be undone</span>
        </>
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-describedby',
        'description'
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles long content', () => {
      const longText = 'A'.repeat(100);
      render(<Button>{longText}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent(longText);
    });

    it('handles special characters', () => {
      render(<Button>{'<script>alert("xss")</script>'}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('<script>');
    });

    it('handles React elements as children', () => {
      render(
        <Button>
          <span data-testid="icon">★</span>
          Text
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Text');
    });

    it('handles multiple click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });
});
