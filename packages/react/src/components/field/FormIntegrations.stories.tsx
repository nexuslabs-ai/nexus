import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ReactHookFormExample } from '../../recipes/forms/react-hook-form';
import hookFormSource from '../../recipes/forms/react-hook-form.tsx?raw';
import type { Values } from '../../recipes/forms/settings-layout';
import layoutSource from '../../recipes/forms/settings-layout.tsx?raw';
import { TanStackFormExample } from '../../recipes/forms/tanstack-form';
import tanStackSource from '../../recipes/forms/tanstack-form.tsx?raw';
import {
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifySaveCancel,
  verifyValidation,
} from '../../stories/support/settings-form-test-utils';

const meta = {
  title: 'Patterns/Form Integrations',
  component: ReactHookFormExample,
  args: {
    initialValues: {
      name: 'Priya Shah',
      email: 'priya@example.com',
      updates: false,
    },
    onSave: fn(async (_values: Values) => {}),
  },
  argTypes: { onSave: { control: false } },
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-3xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: hookFormSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
      description: {
        component:
          'The same Nexus form with two interchangeable form-management libraries. These recipes live in ordinary source files; Storybook imports the same implementation. Copy the chosen integration and settings-layout.tsx, and install only that form library. Both validate on submit, clear a field error when edited, focus the first invalid field, preserve edits on save failure, and restore the latest saved values on Cancel. React Hook Form uses useForm/useController; TanStack uses useForm/useField with subscriptions. TanStack unsaved state uses !isDefaultValue rather than historical isDirty. Both reset the saved baseline after success. onSave is application-owned; no backend persistence is included. Applications provide initialValues and onSave. Remount with a record key when switching records. The existing Forms and Settings recipe demonstrates plain React.',
      },
    },
  },
} satisfies Meta<typeof ReactHookFormExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReactHookForm: Story = { play: verifySaveCancel };
export const TanStackForm: Story = {
  parameters: {
    docs: {
      source: {
        code: tanStackSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => <TanStackFormExample {...args} />,
  play: verifySaveCancel,
};
export const ReactHookFormValidation: Story = { play: verifyValidation };
export const TanStackFormValidation: Story = {
  parameters: {
    docs: {
      source: {
        code: tanStackSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyValidation,
};
export const ReactHookFormSaving: Story = {
  args: {
    onSave: fn(
      (_values: Values) =>
        new Promise<void>((resolve) => setTimeout(resolve, 1000))
    ),
  },
  play: verifyPending,
};
export const TanStackFormSaving: Story = {
  args: {
    onSave: fn(
      (_values: Values) =>
        new Promise<void>((resolve) => setTimeout(resolve, 1000))
    ),
  },
  parameters: {
    docs: {
      source: {
        code: tanStackSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyPending,
};
export const ReactHookFormFailure: Story = { play: verifyFailure };
export const TanStackFormFailure: Story = {
  parameters: {
    docs: {
      source: {
        code: tanStackSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyFailure,
};
export const ReactHookFormNarrow: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <ReactHookFormExample {...args} />
    </div>
  ),
  play: verifyNarrow,
};
export const TanStackFormNarrow: Story = {
  parameters: {
    docs: {
      source: {
        code: tanStackSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <TanStackFormExample {...args} />
    </div>
  ),
  play: verifyNarrow,
};
export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code:
          hookFormSource +
          '\n\n// tanstack-form.tsx\n' +
          tanStackSource +
          '\n\n// settings-layout.tsx\n' +
          layoutSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => (
    <div className="nx:@container nx:w-full">
      <div className="nx:grid nx:gap-10 nx:@2xl:grid-cols-2">
        <section className="nx:min-w-0">
          <p className="nx:mb-4 nx:typography-label-default nx:text-muted-foreground">
            React Hook Form
          </p>
          <ReactHookFormExample {...args} />
        </section>
        <section className="nx:min-w-0">
          <p className="nx:mb-4 nx:typography-label-default nx:text-muted-foreground">
            TanStack Form
          </p>
          <TanStackFormExample {...args} />
        </section>
      </div>
    </div>
  ),
};
