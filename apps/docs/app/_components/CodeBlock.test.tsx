import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeBlock } from './CodeBlock';

const canonicalCode = `import { Button } from '@nexus_ds/react';

function SaveButton() {
  return <Button>Save</Button>;
}
`;

describe('CodeBlock', () => {
  const originalClipboard = navigator.clipboard;
  const writeText = vi.fn<(text: string) => Promise<void>>();

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });

  it('copies the complete code text without trimming or including the control label', async () => {
    render(
      <CodeBlock>
        <code>{canonicalCode}</code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    copyButton.focus();
    expect(document.activeElement).toBe(copyButton);

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith(canonicalCode);
    expect(screen.getByRole('status').textContent).toBe(
      'Code copied to clipboard.'
    );
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('announces a failed write and resets the control', async () => {
    writeText.mockRejectedValue(
      new DOMException('Not allowed', 'NotAllowedError')
    );

    render(
      <CodeBlock>
        <code>{canonicalCode}</code>
      </CodeBlock>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    });

    expect(screen.getByRole('status').textContent).toBe('Unable to copy code.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('');
  });
});
