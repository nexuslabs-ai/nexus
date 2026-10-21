import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import {
  createNxdsAppearanceScript,
  type CreateNxdsAppearanceScriptOptions,
  NxdsAppearanceScript,
  type NxdsAppearanceScriptProps,
} from './server';

// The component renders nothing a user can see: it emits the inline first-paint
// `<script>` a consumer puts in their server-rendered document head. The stories
// assert the emitted element instead of an appearance.
const meta: Meta<NxdsAppearanceScriptProps> = {
  title: 'Appearance/AppearanceScript',
  component: NxdsAppearanceScript,
  parameters: {
    docs: {
      description: {
        component:
          "NxdsAppearanceScript applies the saved appearance before the first paint, so the page doesn't flash the wrong theme. Render it in the `<head>` of your server-rendered document. Pass `nonce` when your Content Security Policy requires one.",
      },
    },
  },
  args: { storageKey: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

function bootstrapScriptIn(root: ParentNode) {
  const script = root.querySelector<HTMLScriptElement>(
    'script[data-nxds-appearance-script]'
  );
  if (!script) throw new Error('Missing the appearance bootstrap script');
  return script;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const script = bootstrapScriptIn(canvasElement);

    await expect(script.nonce).toBe('');
    await expect(script.textContent).toContain('data-nxds-appearance-theme');
  },
};

export const WithNonce: Story = {
  args: { nonce: 'nxds-first-paint-nonce' },
  play: async ({ canvasElement, args }) => {
    const script = bootstrapScriptIn(canvasElement);

    await expect(script.nonce).toBe(args.nonce);
  },
};

const factoryOptions: CreateNxdsAppearanceScriptOptions = {
  storageKey: false,
};
const ConfiguredAppearanceScript = createNxdsAppearanceScript(factoryOptions);

export const FromFactory: Story = {
  render: () => <ConfiguredAppearanceScript nonce="nxds-factory-nonce" />,
  play: async ({ canvasElement }) => {
    const script = bootstrapScriptIn(canvasElement);

    await expect(script.nonce).toBe('nxds-factory-nonce');
    await expect(script.textContent).toContain('data-nxds-appearance-theme');
  },
};
