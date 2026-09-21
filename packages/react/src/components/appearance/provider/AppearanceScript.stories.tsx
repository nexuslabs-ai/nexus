import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { createNexusAppearanceScript, NexusAppearanceScript } from './script';

// The component renders nothing a user can see: it emits the inline first-paint
// `<script>` a consumer puts in their server-rendered document head. The stories
// assert the emitted element instead of an appearance.
const meta: Meta<typeof NexusAppearanceScript> = {
  title: 'Appearance/AppearanceScript',
  component: NexusAppearanceScript,
  args: { storageKey: false },
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceScript>;

function bootstrapScriptIn(canvasElement: HTMLElement) {
  return canvasElement.querySelector<HTMLScriptElement>(
    'script[data-nexus-appearance-script]'
  );
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const script = bootstrapScriptIn(canvasElement);

    await expect(script).not.toBeNull();
    await expect(script!.nonce).toBe('');
    await expect(script!.textContent).toContain('data-nexus-appearance-theme');
  },
};

export const WithNonce: Story = {
  args: { nonce: 'nexus-first-paint-nonce' },
  play: async ({ canvasElement, args }) => {
    const script = bootstrapScriptIn(canvasElement);

    await expect(script).not.toBeNull();
    await expect(script!.nonce).toBe(args.nonce);
  },
};

const ConfiguredAppearanceScript = createNexusAppearanceScript({
  storageKey: false,
});

export const FromFactory: Story = {
  render: () => <ConfiguredAppearanceScript nonce="nexus-factory-nonce" />,
  play: async ({ canvasElement }) => {
    const script = bootstrapScriptIn(canvasElement);

    await expect(script).not.toBeNull();
    await expect(script!.nonce).toBe('nexus-factory-nonce');
    await expect(script!.textContent).toContain('data-nexus-appearance-theme');
  },
};
