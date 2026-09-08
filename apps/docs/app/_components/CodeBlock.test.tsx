import * as React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeBlock } from './CodeBlock';
import { CopyAnnouncerProvider } from './CopyAnnouncer';

// A real block shape: an import line, and the fence's trailing newline.
const SNIPPET = `import { Button } from '@nexus_ds/react';

export function Example() {
  return <Button>Save</Button>;
}
`;

const writeText = vi.fn<(text: string) => Promise<void>>();

// The live region lives in the provider, so a block is only testable inside one.
function renderInDocs(block: React.ReactNode) {
  render(<CopyAnnouncerProvider>{block}</CopyAnnouncerProvider>);
  return screen.getByRole('button', { name: 'Copy code' });
}

function renderBlock() {
  return renderInDocs(
    <CodeBlock>
      <code className="language-tsx">{SNIPPET}</code>
    </CodeBlock>
  );
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

  it('announces the confirmation, then returns the control to idle', async () => {
    const copy = renderBlock();

    expect(screen.getByRole('status').textContent).toBe('');

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(screen.getByRole('status').textContent).toBe(
      'Code copied to clipboard'
    );
    expect(copy.dataset.copyStatus).toBe('copied');
    const announcement = screen.getByRole('status').firstElementChild;

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(copy.dataset.copyStatus).toBe('idle');
    expect(screen.getByRole('status').textContent).toBe('');
    expect(screen.getByRole('status').firstElementChild).toBe(announcement);
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

  it('restarts the reset window and re-announces on a repeat copy', async () => {
    const copy = renderBlock();
    const region = screen.getByRole('status');

    await act(async () => {
      fireEvent.click(copy);
    });
    const firstAnnouncement = region.firstElementChild;

    act(() => {
      vi.advanceTimersByTime(1900);
    });

    await act(async () => {
      fireEvent.click(copy);
    });

    // The first click's timer would have fired 100ms from here.
    act(() => {
      vi.advanceTimersByTime(1900);
    });
    expect(copy.dataset.copyStatus).toBe('copied');
    expect(region.firstElementChild).not.toBe(firstAnnouncement);
    expect(region.textContent).toBe('Code copied to clipboard');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(copy.dataset.copyStatus).toBe('idle');
  });

  it('reports a failure when the clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    const copy = renderBlock();

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(screen.getByRole('status').textContent).toBe('Could not copy code');
    expect(copy.dataset.copyStatus).toBe('failed');
  });

  it('reports a failure rather than a silent no-op for an empty block', async () => {
    const copy = renderInDocs(
      <CodeBlock>
        <code />
      </CodeBlock>
    );

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe('Could not copy code');
    expect(copy.dataset.copyStatus).toBe('failed');
  });

  it('shares one live region across every block on the page', async () => {
    render(
      <CopyAnnouncerProvider>
        <CodeBlock>
          <code>{SNIPPET}</code>
        </CodeBlock>
        <CodeBlock>
          <code>{'const x = 1;\n'}</code>
        </CodeBlock>
      </CopyAnnouncerProvider>
    );
    const controls = screen.getAllByRole('button', { name: 'Copy code' });

    expect(controls).toHaveLength(2);
    expect(screen.getAllByRole('status')).toHaveLength(1);

    await act(async () => {
      fireEvent.click(controls[1]!);
    });

    expect(writeText).toHaveBeenCalledWith('const x = 1;\n');
    expect(screen.getByRole('status').textContent).toBe(
      'Code copied to clipboard'
    );
    expect(controls[0]!.dataset.copyStatus).toBe('idle');
  });

  it("leaves another block's confirmation in the shared region on reset", async () => {
    render(
      <CopyAnnouncerProvider>
        <CodeBlock>
          <code>{SNIPPET}</code>
        </CodeBlock>
        <CodeBlock>
          <code>{'const x = 1;\n'}</code>
        </CodeBlock>
      </CopyAnnouncerProvider>
    );
    const controls = screen.getAllByRole('button', { name: 'Copy code' });
    const region = screen.getByRole('status');

    await act(async () => {
      fireEvent.click(controls[0]!);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      fireEvent.click(controls[1]!);
    });
    // Both blocks announce the same words, so identity separates the cases.
    const announcement = region.firstElementChild;

    // The first block's 2s reset lands here, after the other block announced.
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(controls[0]!.dataset.copyStatus).toBe('idle');
    expect(controls[1]!.dataset.copyStatus).toBe('copied');
    expect(region.firstElementChild).toBe(announcement);
    expect(region.textContent).toBe('Code copied to clipboard');
  });

  it('gives the scroll container a tab stop a caller cannot remove', () => {
    // The props type omits `tabIndex`, but an MDX plugin can still inject one.
    const injected: object = { tabIndex: -1 };
    const { container } = render(
      <CopyAnnouncerProvider>
        <CodeBlock>
          <code>{SNIPPET}</code>
        </CodeBlock>
        <CodeBlock {...injected}>
          <code>{SNIPPET}</code>
        </CodeBlock>
      </CopyAnnouncerProvider>
    );
    const [own, overridden] = Array.from(container.querySelectorAll('pre'));

    expect(own!.tabIndex).toBe(0);
    expect(overridden!.tabIndex).toBe(0);

    own!.focus();
    expect(document.activeElement).toBe(own);
  });

  it('exposes the control as a focusable native button', () => {
    const copy = renderBlock();

    expect(copy.tagName).toBe('BUTTON');
    expect(copy.hasAttribute('tabindex')).toBe(false);

    copy.focus();
    expect(document.activeElement).toBe(copy);
  });
});
