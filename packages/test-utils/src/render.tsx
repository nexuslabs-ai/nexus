import * as React from 'react';

import {
  render as rtlRender,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';

export interface NexusRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Theme to use for the test ('light' | 'dark')
   * @default 'light'
   */
  theme?: 'light' | 'dark';
}

/**
 * Theme wrapper component for tests
 */
function ThemeWrapper({
  children,
  theme = 'light',
}: {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}) {
  return <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>;
}

/**
 * Custom render function that wraps components with theme context
 *
 * @example
 * ```tsx
 * import { render, screen } from '@nexus/test-utils';
 *
 * test('renders button', () => {
 *   render(<Button>Click me</Button>);
 *   expect(screen.getByRole('button')).toBeInTheDocument();
 * });
 *
 * test('renders in dark mode', () => {
 *   render(<Button>Click me</Button>, { theme: 'dark' });
 *   expect(screen.getByRole('button').closest('.dark')).toBeInTheDocument();
 * });
 * ```
 */
export function render(
  ui: React.ReactElement,
  options: NexusRenderOptions = {}
): RenderResult {
  const { theme = 'light', ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeWrapper theme={theme}>{children}</ThemeWrapper>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}
