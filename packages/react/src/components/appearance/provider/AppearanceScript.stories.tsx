import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import {
  createNxdsAppearanceScript,
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

const ConfiguredAppearanceScript = createNxdsAppearanceScript({
  storageKey: false,
});

export const Default: Story = {
  render: (args) => (
    <>
      <NxdsAppearanceScript {...args} />
      <ConfiguredAppearanceScript nonce="nxds-factory-nonce" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const scripts = [
      ...canvasElement.querySelectorAll<HTMLScriptElement>(
        'script[data-nxds-appearance-script]'
      ),
    ];

    await expect(scripts.map((script) => script.nonce)).toEqual([
      '',
      'nxds-factory-nonce',
    ]);
    for (const script of scripts) {
      await expect(script.textContent).toContain('data-nxds-appearance-theme');
    }
  },
};
