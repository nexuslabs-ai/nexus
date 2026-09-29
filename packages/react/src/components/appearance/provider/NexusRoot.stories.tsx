import { useState } from 'react';

import {
  DEFAULT_NEXUS_APPEARANCE,
  deriveNexusAppearanceCss,
  type NexusAppearanceState,
  nexusRootScope,
} from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../../button';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';

import {
  NexusRoot,
  type NexusRootProps,
  type NexusRootState,
} from './nexus-root';
import { NexusAppearanceProvider, useNexusAppearance } from './provider';

const LIGHT: NexusRootState = { ...DEFAULT_NEXUS_APPEARANCE, mode: 'light' };
const DARK: NexusRootState = { ...LIGHT, mode: 'dark' };
// A class a host app toggles for its own dark mode; Nexus must ignore it.
const HOST_DARK_CLASS = 'dark';

const meta: Meta<typeof NexusRoot> = {
  title: 'Appearance/NexusRoot',
  component: NexusRoot,
  parameters: {
    docs: {
      description: {
        component:
          'Scopes Nexus to its subtree: the root element carries the appearance attributes and a keyed `<style>` with its theme and preference CSS. Portalled surfaces (dialogs, popovers, menus, tooltips) copy the nearest root’s attributes, so they keep its tokens. Nothing is written outside the root.',
      },
    },
  },
  args: { state: LIGHT },
};

export default meta;
type Story = StoryObj<typeof NexusRoot>;

/** The story's own root, inside the Storybook decorator's root. */
function rootIn(canvasElement: HTMLElement): HTMLElement {
  const root = canvasElement.querySelector<HTMLElement>(
    '[data-nexus-root] [data-nexus-root]'
  );
  if (!root) throw new Error('Missing the story root');
  return root;
}

function probe(root: ParentNode, name: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(`[data-probe="${name}"]`);
  if (!element) throw new Error(`Missing probe ${name}`);
  return element;
}

export const Default: Story = {
  args: {
    state: { ...LIGHT, density: 'compact', corners: 'round' },
    children: (
      <p className="nx:typography-body-default nx:text-foreground">
        Nexus content
      </p>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const root = rootIn(canvasElement);
    const key = root.getAttribute('data-nexus-root')!;

    await expect(key).not.toBe('');
    await expect(root).toHaveAttribute('data-nx-mode', 'light');
    await expect(root).toHaveAttribute('data-nx-density', 'compact');
    await expect(root).toHaveAttribute('data-nx-radius', 'round');
    await expect(root).toHaveAttribute('data-nx-shadow', 'quiet');
    await expect(root).toHaveAttribute('data-nx-borderwidth', 'normal');

    const style = root.previousElementSibling;
    const expected = deriveNexusAppearanceCss(args.state, nexusRootScope(key));
    await expect(style?.tagName).toBe('STYLE');
    await expect(style?.textContent).toBe(
      `${expected.themeCss}\n${expected.prefsCss}`
    );
  },
};

export const DarkMode: Story = {
  args: {
    state: DARK,
    children: <p className="nx:text-foreground">Dark root</p>,
  },
  play: async ({ canvasElement }) => {
    const root = rootIn(canvasElement);

    await expect(root).toHaveAttribute('data-nx-mode', 'dark');
    await expect(getComputedStyle(root).colorScheme).toBe('dark');
  },
};

function LiveModePopover() {
  const [state, setState] = useState<NexusRootState>(LIGHT);
  return (
    <NexusRoot state={state}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent data-probe="popover">
          <Button size="sm" onClick={() => setState(DARK)}>
            Go dark
          </Button>
        </PopoverContent>
      </Popover>
    </NexusRoot>
  );
}

export const PortalKeepsRoot: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The popover renders into `document.body`, outside the root’s DOM, yet carries the root’s key and mode, resolves the same tokens, and follows a mode change while it is open.',
      },
    },
  },
  render: () => <LiveModePopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = rootIn(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open popover' }));
    const content = await waitFor(() => probe(document.body, 'popover'));

    await expect(root.contains(content)).toBe(false);
    await expect(content).toHaveAttribute(
      'data-nexus-root',
      root.getAttribute('data-nexus-root')!
    );
    await expect(
      getComputedStyle(content).getPropertyValue('--nx-color-popover')
    ).toBe(getComputedStyle(root).getPropertyValue('--nx-color-popover'));

    await userEvent.click(
      within(content).getByRole('button', { name: 'Go dark' })
    );
    await waitFor(() =>
      expect(content).toHaveAttribute('data-nx-mode', 'dark')
    );
    await expect(getComputedStyle(content).colorScheme).toBe('dark');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(document.querySelector('[data-probe="popover"]')).toBeNull()
    );
  },
};

export const LightInsideDark: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A light root nested in a dark one keeps light values, including shadows, which the dark root sets only on itself.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:gap-4">
      <NexusRoot state={DARK} className="nx:bg-background nx:p-4">
        <NexusRoot state={LIGHT} className="nx:bg-background nx:p-4">
          <div
            data-probe="nested"
            className="nx:size-12 nx:rounded-md nx:bg-container nx:shadow-lg"
          />
        </NexusRoot>
      </NexusRoot>
      <NexusRoot state={LIGHT} className="nx:bg-background nx:p-4">
        <div
          data-probe="reference"
          className="nx:size-12 nx:rounded-md nx:bg-container nx:shadow-lg"
        />
      </NexusRoot>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const nested = getComputedStyle(probe(canvasElement, 'nested'));
    const reference = getComputedStyle(probe(canvasElement, 'reference'));

    await expect(nested.boxShadow).toBe(reference.boxShadow);
    await expect(nested.backgroundColor).toBe(reference.backgroundColor);
    await expect(nested.colorScheme).toBe('light');
  },
};

export const IgnoresHostDarkClass: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A host app’s own `.dark` class on an ancestor does not change Nexus: only the root’s `data-nx-mode` does.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:gap-4">
      <div className={HOST_DARK_CLASS}>
        <NexusRoot state={LIGHT}>
          <Button data-probe="under-host-dark">Nexus</Button>
        </NexusRoot>
      </div>
      <NexusRoot state={LIGHT}>
        <Button data-probe="reference">Nexus</Button>
      </NexusRoot>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const underHostDark = getComputedStyle(
      probe(canvasElement, 'under-host-dark')
    );
    const reference = getComputedStyle(probe(canvasElement, 'reference'));

    await expect(underHostDark.backgroundColor).toBe(reference.backgroundColor);
    await expect(underHostDark.colorScheme).toBe('light');
  },
};

export const InsideStandaloneRoot: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An embedded root inside the standalone provider on `<html>` keeps its own brand: each root’s CSS targets its own key.',
      },
    },
  },
  render: () => (
    <NexusAppearanceProvider
      storageKey={false}
      defaultState={{ ...DEFAULT_NEXUS_APPEARANCE, brandColor: '#dc2626' }}
    >
      <NexusRoot state={{ ...LIGHT, brandColor: '#2563eb' }}>
        <div
          data-probe="embedded"
          className="nx:size-12 nx:bg-primary-background"
        />
      </NexusRoot>
    </NexusAppearanceProvider>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute(
        'data-nexus-root',
        'document'
      )
    );
    const page = getComputedStyle(document.documentElement);

    await expect(
      getComputedStyle(probe(canvasElement, 'embedded')).getPropertyValue(
        '--nx-color-primary-background'
      )
    ).not.toBe(page.getPropertyValue('--nx-color-primary-background'));
  },
};

export const PortalTypography: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A portalled surface carries the root attribute, so the root’s font size lands on it too — but its own typography utility still wins.',
      },
    },
  },
  render: () => (
    <NexusRoot state={LIGHT}>
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button variant="outline">Trigger</Button>
          </TooltipTrigger>
          <TooltipContent data-probe="tooltip">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span data-probe="reference" className="nx:typography-body-small">
        Reference
      </span>
    </NexusRoot>
  ),
  play: async ({ canvasElement }) => {
    const tooltip = await waitFor(() => probe(document.body, 'tooltip'));
    const reference = probe(canvasElement, 'reference');

    await expect(getComputedStyle(tooltip).fontSize).toBe(
      getComputedStyle(reference).fontSize
    );
  },
};

export const PrefsStayInTheirRoot: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A root’s preference rules stop at a nested root: pointer cursors on the outer root do not reach the inner one.',
      },
    },
  },
  render: () => (
    <NexusRoot
      state={{ ...LIGHT, prefs: { ...LIGHT.prefs, pointerCursors: true } }}
    >
      <button type="button" data-probe="outer">
        Outer
      </button>
      <NexusRoot state={LIGHT}>
        <button type="button" data-probe="inner">
          Inner
        </button>
      </NexusRoot>
    </NexusRoot>
  ),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(probe(canvasElement, 'outer')).cursor).toBe(
      'pointer'
    );
    await expect(
      getComputedStyle(probe(canvasElement, 'inner')).cursor
    ).not.toBe('pointer');
  },
};

function BatchedEdits() {
  const { setState } = useNexusAppearance();

  function applyBoth() {
    setState((current) => ({ ...current, density: 'compact' }));
    setState((current) => ({ ...current, corners: 'round' }));
  }

  return <Button onClick={applyBoth}>Compact and round</Button>;
}

function EditableRoot() {
  const [state, setState] = useState<NexusRootState>(LIGHT);
  return (
    <NexusRoot
      state={state}
      onStateChange={(next) => setState({ ...next, mode: state.mode })}
    >
      <BatchedEdits />
    </NexusRoot>
  );
}

export const BatchedStateChanges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two functional updates in one event both land: the second builds on the first, not on the last rendered state.',
      },
    },
  },
  render: () => <EditableRoot />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Compact and round' })
    );
    const root = rootIn(canvasElement);

    await expect(root).toHaveAttribute('data-nx-density', 'compact');
    await expect(root).toHaveAttribute('data-nx-radius', 'round');
  },
};

function DensityAndCornerEdits() {
  const { setState } = useNexusAppearance();
  return (
    <>
      <Button
        onClick={() =>
          setState((current) => ({ ...current, density: 'compact' }))
        }
      >
        Compact
      </Button>
      <Button
        onClick={() =>
          setState((current) => ({ ...current, corners: 'round' }))
        }
      >
        Round
      </Button>
    </>
  );
}

// Accepts compact density only with round corners, like a host enforcing its
// own constraint; a rejected update leaves the state untouched.
function RejectingRoot({
  onStateChange,
}: Pick<NexusRootProps, 'onStateChange'>) {
  const [state, setState] = useState<NexusRootState>(LIGHT);

  function acceptOrReject(next: NexusAppearanceState) {
    onStateChange?.(next);
    if (next.density === 'compact' && next.corners !== 'round') return;
    setState({ ...next, mode: state.mode });
  }

  return (
    <NexusRoot state={state} onStateChange={acceptOrReject}>
      <DensityAndCornerEdits />
    </NexusRoot>
  );
}

export const RejectedUpdateDoesNotCarryForward: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An update the host rejects is dropped: the next update, in a later event, builds on the rendered state.',
      },
    },
  },
  args: { onStateChange: fn() },
  render: (args) => <RejectingRoot onStateChange={args.onStateChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Compact' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Round' }));
    const root = rootIn(canvasElement);

    await expect(args.onStateChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ density: 'compact', corners: 'square' })
    );
    await expect(args.onStateChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ density: 'default', corners: 'round' })
    );
    await expect(root).toHaveAttribute('data-nx-density', 'default');
    await expect(root).toHaveAttribute('data-nx-radius', 'round');
  },
};

export const RootAttributesWin: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A consumer’s `data-nexus-root` or `data-nx-mode` prop cannot move the root off the key its `<style>` targets.',
      },
    },
  },
  render: () => (
    <NexusRoot state={LIGHT} data-nexus-root="spoofed" data-nx-mode="dark">
      <p>Root</p>
    </NexusRoot>
  ),
  play: async ({ canvasElement }) => {
    const root = rootIn(canvasElement);

    await expect(root).not.toHaveAttribute('data-nexus-root', 'spoofed');
    await expect(root).toHaveAttribute('data-nx-mode', 'light');
  },
};

export const UnresolvedModeRendersLight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A `system` mode passed from untyped code renders light; the host resolves `system` before passing state.',
      },
    },
  },
  args: {
    state: { ...LIGHT, mode: 'system' as unknown as NexusRootState['mode'] },
  },
  play: async ({ canvasElement }) => {
    await expect(rootIn(canvasElement)).toHaveAttribute(
      'data-nx-mode',
      'light'
    );
  },
};

export const ProviderStyleNonce: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The standalone provider sets its `nonce` on the `<style>` elements it injects, for a strict `style-src` policy.',
      },
    },
  },
  render: () => (
    <NexusAppearanceProvider storageKey={false} nonce="provider-nonce">
      <p>Standalone</p>
    </NexusAppearanceProvider>
  ),
  play: async () => {
    const styles = await waitFor(() => {
      const found = document.querySelectorAll<HTMLStyleElement>(
        'style[data-nexus-appearance-theme], style[data-nexus-appearance-prefs]'
      );
      expect(found).toHaveLength(2);
      return [...found];
    });

    await expect(styles.map((style) => style.nonce)).toEqual([
      'provider-nonce',
      'provider-nonce',
    ]);
  },
};
