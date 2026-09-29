import { Canvas, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { DisabledSettings, ReadOnlyDetails } from './settings-display';
import displaySource from './settings-display.tsx?raw';

const meta = {
  title: 'Patterns/Forms and Settings',
  component: ReadOnlyDetails,
  args: { name: 'Priya Shah', email: 'priya@example.com' },
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-2xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      source: { code: displaySource, language: 'tsx', type: 'code' },
      page: () => (
        <>
          <Title />
          <p>
            Settings pages let people review and change information about
            themselves or their workspace. Two decisions shape each section;
            make them first.
          </p>
          <h2>1. Decide whether a section is editable</h2>
          <table>
            <thead>
              <tr>
                <th>State</th>
                <th>Use it when</th>
                <th>Build it with</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Editable</td>
                <td>The person may change these values now.</td>
                <td>One of the three settings form blocks, below</td>
              </tr>
              <tr>
                <td>Read-only</td>
                <td>
                  The values are information, not controls, such as details
                  another team manages. Say who can change them.
                </td>
                <td>DescriptionList, as in the example below</td>
              </tr>
              <tr>
                <td>Unavailable</td>
                <td>
                  The controls exist but cannot be used right now. Give a
                  visible reason and connect it with{' '}
                  <code>aria-describedby</code>.
                </td>
                <td>Disabled fields, as in the example below</td>
              </tr>
            </tbody>
          </table>
          <h3>Read-only</h3>
          <Canvas of={ReadOnly} />
          <h3>Unavailable</h3>
          <Canvas of={Disabled} />
          <h2>2. Decide who owns the form state</h2>
          <p>
            All three blocks render the same form and follow the same save and
            cancel contract. Pick the one that matches how your app already
            manages forms; copy only that one.
          </p>
          <table>
            <thead>
              <tr>
                <th>Block</th>
                <th>Use it when</th>
                <th>Extra dependency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a
                    href="/?path=/docs/blocks-settingsform--docs"
                    target="_top"
                  >
                    SettingsForm
                  </a>
                </td>
                <td>A small form without a form library</td>
                <td>None</td>
              </tr>
              <tr>
                <td>
                  <a
                    href="/?path=/docs/blocks-reacthookformsettingsform--docs"
                    target="_top"
                  >
                    ReactHookFormSettingsForm
                  </a>
                </td>
                <td>Your app uses React Hook Form</td>
                <td>
                  <code>react-hook-form</code> 7
                </td>
              </tr>
              <tr>
                <td>
                  <a
                    href="/?path=/docs/blocks-tanstacksettingsform--docs"
                    target="_top"
                  >
                    TanStackSettingsForm
                  </a>
                </td>
                <td>Your app uses TanStack Form</td>
                <td>
                  <code>@tanstack/react-form</code> 1
                </td>
              </tr>
            </tbody>
          </table>
          <h2>3. Follow the save and cancel contract</h2>
          <p>
            Save only when something changed, validate on submit, keep edits
            when a save fails, adopt the record the server saved as the new
            baseline, and let Cancel restore it. Each block page spells out the
            full contract and the stories that test it.
          </p>
          <h2>4. Where to go next</h2>
          <ul>
            <li>
              Components: Field, FieldSet and FieldLegend for labels, help and
              errors; DescriptionList for read-only values.
            </li>
            <li>
              The source lives in <code>packages/react/src/recipes/forms</code>;
              its README maps every file.
            </li>
            <li>
              Applications own loading the record, authorization, server
              validation, navigation guards and persistence.
            </li>
          </ul>
        </>
      ),
    },
  },
} satisfies Meta<typeof ReadOnlyDetails>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use a DescriptionList when values are information rather than editable controls. Explain who can change them; keep empty values explicit.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.getByText('Not provided')).toBeVisible();
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled controls are temporarily unavailable. Give a visible reason and connect it with aria-describedby. Apply disabled to the controls and data-disabled to their Field wrappers.',
      },
    },
  },
  render: () => <DisabledSettings address="24 Riverside Road" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('checkbox')).toBeDisabled();
    await expect(canvas.getByRole('textbox')).toHaveAccessibleDescription(
      /Delivery is paused/
    );
  },
};
