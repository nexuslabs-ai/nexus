import * as React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeBlock } from './CodeBlock';

// Shaped like a real block from content/getting-started/install.mdx: the import
// line is what a trimmed excerpt would drop, and the fence leaves a trailing \n.
const SNIPPET = `import { Button } from '@nexus_ds/react';

export function Example() {
  return <Button>Save</Button>;
}
`;

const writeText = vi.fn<(text: string) => Promise<void>>();

function renderBlock() {
  render(
    <CodeBlock>
      <code className="language-tsx">{SNIPPET}</code>
    </CodeBlock>
  );
  return screen.getByRole('button', { name: 'Copy code' });
}

describe('CodeBlock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('copies the block verbatim — imports, trailing newline, no control label', async () => {
    const copy = renderBlock();

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(writeText).toHaveBeenCalledWith(SNIPPET);
    expect(writeText.mock.calls[0]![0]).not.toMatch(/copy/i);
  });

  it('announces the confirmation, then resets it', async () => {
    const copy = renderBlock();

    expect(screen.getByRole('status').textContent).toBe('');

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(screen.getByRole('status').textContent).toBe(
      'Code copied to clipboard'
    );
    expect(copy.dataset.copyStatus).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('status').textContent).toBe('');
    expect(copy.dataset.copyStatus).toBe('idle');
  });

  it('announces a failed write instead of leaving a silent no-op', async () => {
    writeText.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
    const copy = renderBlock();

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(screen.getByRole('status').textContent).toBe('Could not copy code');
    expect(copy.dataset.copyStatus).toBe('failed');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(copy.dataset.copyStatus).toBe('idle');
  });

  it('exposes the control as a focusable native button', () => {
    const copy = renderBlock();

    expect(copy.tagName).toBe('BUTTON');
    expect(copy.hasAttribute('tabindex')).toBe(false);

    copy.focus();
    expect(document.activeElement).toBe(copy);
  });
});
