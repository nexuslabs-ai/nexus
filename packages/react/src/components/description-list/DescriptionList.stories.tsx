import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../badge';
import { InlineEdit, type InlineEditProps } from '../inline-edit';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from './description-list';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  parameters: {
    docs: {
      description: {
        component:
          'Compose one term and description per item. Values, formatting, missing-value text and actions belong to the consumer. Put actions inside DescriptionListDescription. Rows stack in narrow containers and align in two columns when the list has enough room.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DescriptionList>;

function ProfileDetails() {
  return (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Name</DescriptionListTerm>
        <DescriptionListDescription>Priya Shah</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Email</DescriptionListTerm>
        <DescriptionListDescription>
          priya@example.com
        </DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  );
}

export const Default: Story = {
  render: () => <ProfileDetails />,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('dl');
    await expect(list).not.toBeNull();
    await expect(list?.children).toHaveLength(2);
    for (const item of Array.from(list!.children)) {
      await expect(item.tagName).toBe('DIV');
      await expect(Array.from(item.children, (child) => child.tagName)).toEqual(
        ['DT', 'DD']
      );
    }
  },
};

export const FileMetadata: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Filename</DescriptionListTerm>
        <DescriptionListDescription>
          Research findings.pdf
        </DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Size</DescriptionListTerm>
        <DescriptionListDescription>2.4 MB</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Modified</DescriptionListTerm>
        <DescriptionListDescription>
          <time dateTime="2026-09-24">24 September 2026</time>
        </DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

export const Configuration: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Region</DescriptionListTerm>
        <DescriptionListDescription>Mumbai</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Backups</DescriptionListTerm>
        <DescriptionListDescription>
          <Badge variant="secondary">Enabled</Badge>
        </DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Retention override</DescriptionListTerm>
        <DescriptionListDescription>Not configured</DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

export const ContainerLayouts: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-8">
      <div style={{ width: 280 }} data-testid="narrow">
        <ProfileDetails />
      </div>
      <div style={{ width: 640 }} data-testid="wide">
        <ProfileDetails />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const narrow = canvas.getByTestId('narrow');
    const wide = canvas.getByTestId('wide');
    const termNarrow = narrow.querySelector('dt')!;
    const valueNarrow = narrow.querySelector('dd')!;
    const termWide = wide.querySelector('dt')!;
    const valueWide = wide.querySelector('dd')!;
    await expect(narrow.getBoundingClientRect().width).toBeLessThan(448);
    await expect(wide.getBoundingClientRect().width).toBeGreaterThan(448);
    await expect(
      valueNarrow.getBoundingClientRect().top
    ).toBeGreaterThanOrEqual(termNarrow.getBoundingClientRect().bottom);
    await expect(valueWide.getBoundingClientRect().left).toBeGreaterThan(
      termWide.getBoundingClientRect().left
    );
    await expect(
      Math.abs(
        valueWide.getBoundingClientRect().top -
          termWide.getBoundingClientRect().top
      )
    ).toBeLessThan(2);
  },
};

export const LongContent: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      {[280, 640].map((width) => (
        <div key={width} style={{ width }}>
          <DescriptionList>
            <DescriptionListItem>
              <DescriptionListTerm>
                RegionalDisasterRecoveryBackupConfigurationIdentifier
              </DescriptionListTerm>
              <DescriptionListDescription>
                production-archive-2026-09-24-regional-backup-retention-configuration-7d841b239aca38ce
              </DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Delivery address</DescriptionListTerm>
              <DescriptionListDescription>
                24 Riverside Road
                <br />
                Mumbai
                <br />
                Maharashtra
              </DescriptionListDescription>
            </DescriptionListItem>
          </DescriptionList>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const list of canvasElement.querySelectorAll('dl')) {
      await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
      for (const cell of list.querySelectorAll('dt, dd')) {
        await expect(cell.scrollWidth).toBeLessThanOrEqual(
          cell.clientWidth + 1
        );
      }
    }
  },
};

function ActionExample({
  activation = 'pencil',
  initialValue = 'Priya Shah',
  readOnly = false,
}: {
  activation?: InlineEditProps['activation'];
  initialValue?: string;
  readOnly?: boolean;
}) {
  const [name, setName] = useState(initialValue);
  return (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Name</DescriptionListTerm>
        <DescriptionListDescription>
          {readOnly ? (
            <InlineEdit readOnly label="Name" value={name} />
          ) : (
            <InlineEdit
              label="Name"
              value={name}
              onCommit={setName}
              activation={activation}
              placeholder="Enter a name"
            />
          )}
        </DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  );
}

export const ClickToEdit: Story = {
  render: () => <ActionExample activation="click" />,
};
export const ClickToEditEmpty: Story = {
  render: () => <ActionExample activation="click" initialValue="" />,
};
export const PencilToEditEmpty: Story = {
  render: () => <ActionExample initialValue="" />,
};
export const ReadOnly: Story = { render: () => <ActionExample readOnly /> };
export const ReadOnlyEmpty: Story = {
  render: () => <ActionExample readOnly initialValue="" />,
};

export const ConsumerAction: Story = {
  render: () => <ActionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, 'Priya Sharma{Enter}');
    await expect(
      canvas.getByText('Priya Sharma', { exact: true })
    ).toHaveTextContent('Priya Sharma');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.getByText('Priya Sharma', { exact: true })
    ).toHaveTextContent('Priya Sharma');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Name' }),
      'Priya Shah'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Save Name' }));
    await expect(
      canvas.getByText('Priya Shah', { exact: true })
    ).toHaveTextContent('Priya Shah');
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Cancel editing Name' })
    );
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const WithDataAttributes: Story = {
  render: () => <ProfileDetails />,
  play: async ({ canvasElement }) => {
    for (const slot of [
      'description-list',
      'description-list-item',
      'description-list-term',
      'description-list-description',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).not.toBeNull();
    }
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-3xl nx:gap-8">
      <h3 className="nx:typography-heading-small">Pencil to edit</h3>
      <ActionExample />
      <ActionExample initialValue="" />
      <h3 className="nx:typography-heading-small">Click to edit</h3>
      <ActionExample activation="click" />
      <ActionExample activation="click" initialValue="" />
      <h3 className="nx:typography-heading-small">Read only</h3>
      <ActionExample readOnly />
      <ActionExample readOnly initialValue="" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('dl')!;
    const showcase = list.parentElement!;
    const availableWidth =
      showcase.parentElement!.getBoundingClientRect().width;
    const maximumWidth = Number.parseFloat(getComputedStyle(showcase).maxWidth);
    await expect(showcase.getBoundingClientRect().width).toBeCloseTo(
      Math.min(availableWidth, maximumWidth),
      0
    );
    for (const item of canvasElement.querySelectorAll(
      '[data-slot="description-list-item"]'
    )) {
      const term = item.querySelector('dt')!;
      const value = item.querySelector('[data-slot="inline-edit-value"]')!;
      const termRange = document.createRange();
      termRange.selectNodeContents(term);
      const valueRange = document.createRange();
      valueRange.selectNodeContents(value);
      await expect(
        Math.abs(
          termRange.getBoundingClientRect().top -
            valueRange.getBoundingClientRect().top
        )
      ).toBeLessThan(1);
    }
  },
};
