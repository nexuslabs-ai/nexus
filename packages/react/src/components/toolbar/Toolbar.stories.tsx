import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconArchive,
  IconArrowBackUp,
  IconBold,
  IconCopy,
  IconDownload,
  IconEraser,
  IconFolder,
  IconItalic,
  IconPencil,
  IconPointer,
  IconUnderline,
} from '@tabler/icons-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconX,
} from '../../lib/icons';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Label } from '../label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from './toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-3xl nx:p-4">
        <TooltipProvider>
          <Story />
        </TooltipProvider>
      </main>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A contained group of related controls with one Tab stop. The shared defaults provide a theme-aware surface, border, corners, shadow, 2px padding and gaps. Selected toggles use a subtle primary background and primary text, so selection never changes their width. Override className only for intentional compositions such as attached or flush action bars. Arrow keys move between controls; Home/End reach the first/last control. Use ToolbarButton, ToolbarLink, and ToolbarToggleGroup/Item so every control shares the toolbar focus sequence. Button and link expose Nexus button variant/size styles (ghost/sm by default); toggles use matching sizes. These are Radix controls, not the full Button loading/icon-slot API. Use asChild for menu triggers, preserving native interactive semantics. Controls wrap in DOM order in narrow containers; horizontal arrow navigation continues across wrapped rows. Keep labels concise and choose secondary menu actions explicitly. Provide aria-label or aria-labelledby; use ordinary layout and Buttons for simple action rows that should keep separate Tab stops. Keep text fields outside the toolbar to avoid arrow-key conflicts. Inline, Attached, and Selection demonstrate compositions using this same API. Applications own commands, selection, visibility, placement, and persistence.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

function EditorToolbar({ className }: { className?: string } = {}) {
  const previewId = React.useId();
  const [formatting, setFormatting] = React.useState<string[]>([]);
  return (
    <div className="nx:grid nx:gap-4">
      <Toolbar aria-label="Text formatting" className={className}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="nx:inline-flex">
              <ToolbarButton
                size="icon-sm"
                aria-label="Undo formatting"
                onClick={() => setFormatting([])}
                className="nx:text-muted-foreground"
              >
                <IconArrowBackUp aria-hidden="true" />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>Reset formatting</TooltipContent>
        </Tooltip>
        <ToolbarSeparator className="nx:data-[orientation=vertical]:h-4" />
        <ToolbarToggleGroup
          type="multiple"
          value={formatting}
          onValueChange={setFormatting}
          aria-label="Text style"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarToggleItem
                  value="bold"
                  aria-label="Bold"
                  size="icon-sm"
                >
                  <IconBold aria-hidden="true" />
                </ToolbarToggleItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarToggleItem
                  value="italic"
                  aria-label="Italic"
                  size="icon-sm"
                >
                  <IconItalic aria-hidden="true" />
                </ToolbarToggleItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarToggleItem
                  value="underline"
                  aria-label="Underline"
                  size="icon-sm"
                >
                  <IconUnderline aria-hidden="true" />
                </ToolbarToggleItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        </ToolbarToggleGroup>
        <ToolbarSeparator className="nx:data-[orientation=vertical]:h-4" />
        <ToolbarLink
          className="nx:text-muted-foreground"
          href={`#${previewId}`}
        >
          Preview
        </ToolbarLink>
      </Toolbar>
      <p
        id={previewId}
        className="nx:typography-body-default nx:text-muted-foreground"
        style={{
          fontWeight: formatting.includes('bold') ? 700 : undefined,
          fontStyle: formatting.includes('italic') ? 'italic' : undefined,
          textDecoration: formatting.includes('underline')
            ? 'underline'
            : undefined,
        }}
      >
        Select formatting to update this preview.
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <EditorToolbar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('group', { name: 'Text style' })
    ).toBeInTheDocument();
    const bold = canvas.getByRole('button', { name: 'Bold' });
    const italic = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('button', { name: 'Underline' })
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('link', { name: 'Preview' })).toHaveFocus();
  },
};

function FileToolbar() {
  return (
    <Toolbar aria-label="File actions">
      <ToolbarGroup aria-label="Selection actions">
        <ToolbarButton variant="outline">Download</ToolbarButton>
        <ToolbarButton>Move</ToolbarButton>
        <ToolbarButton disabled>Share</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton size="icon-sm" aria-label="More file actions">
            <IconDots />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Toolbar>
  );
}

export const FileActions: Story = {
  render: () => <FileToolbar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Move' }));
    await userEvent.keyboard('{ArrowRight}');
    const trigger = canvas.getByRole('button', { name: 'More file actions' });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByRole('menuitem', { name: 'Rename' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

function CalendarToolbar() {
  const [view, setView] = React.useState('week');
  function handleViewChange(value: string) {
    if (value) setView(value);
  }
  return (
    <Toolbar aria-label="Calendar controls">
      <ToolbarGroup aria-label="Date navigation">
        <ToolbarButton size="icon-sm" aria-label="Previous period">
          <IconChevronLeft />
        </ToolbarButton>
        <ToolbarButton>Today</ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Next period">
          <IconChevronRight />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarToggleGroup
        className="nx:ms-auto"
        type="single"
        value={view}
        onValueChange={handleViewChange}
        aria-label="Calendar view"
      >
        <ToolbarToggleItem value="day">Day</ToolbarToggleItem>
        <ToolbarToggleItem value="week">Week</ToolbarToggleItem>
        <ToolbarToggleItem value="month">Month</ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  );
}

export const Calendar: Story = {
  render: () => <CalendarToolbar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Calendar view' })
    ).toBeInTheDocument();
    const month = canvas.getByRole('radio', { name: 'Month' });
    const unselectedWidth = month.getBoundingClientRect().width;
    await userEvent.click(month);
    await expect(month).toHaveAttribute('aria-checked', 'true');
    await expect(month.getBoundingClientRect().width).toBe(unselectedWidth);
    await expect(canvas.getByRole('radio', { name: 'Week' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  },
};

const onSave = fn();
export const KeyboardAndDisabled: Story = {
  beforeEach: () => onSave.mockClear(),
  render: () => (
    <div className="nx:grid nx:gap-4">
      <Button variant="outline">Before toolbar</Button>
      <Toolbar aria-label="Document actions" data-testid="document-toolbar">
        <ToolbarButton>First</ToolbarButton>
        <ToolbarButton disabled onClick={onSave}>
          Unavailable
        </ToolbarButton>
        <ToolbarButton onClick={onSave}>Save</ToolbarButton>
      </Toolbar>
      <Button variant="outline">After toolbar</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'First' });
    const save = canvas.getByRole('button', { name: 'Save' });
    await expect(canvas.getByTestId('document-toolbar')).toHaveAttribute(
      'data-slot',
      'toolbar'
    );
    await expect(save).toHaveAttribute('data-size', 'sm');
    await expect(
      canvas.getByRole('button', { name: 'Unavailable' })
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Before toolbar' })
    );
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(save).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onSave).toHaveBeenCalledOnce();
    await userEvent.keyboard('{ArrowRight}');
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(save).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(first).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'After toolbar' })
    ).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(first).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      canvas.getByRole('button', { name: 'Before toolbar' })
    ).toHaveFocus();
  },
};

export const Vertical: Story = {
  render: () => (
    <Toolbar orientation="vertical" aria-label="Drawing actions">
      <ToolbarButton>Select</ToolbarButton>
      <ToolbarButton>Draw</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Erase</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Draw' })).toHaveFocus();
    const first = canvas
      .getByRole('button', { name: 'Select' })
      .getBoundingClientRect();
    const second = canvas
      .getByRole('button', { name: 'Draw' })
      .getBoundingClientRect();
    await expect(second.top).toBeGreaterThanOrEqual(first.bottom);
    await expect(
      canvasElement.querySelector('[data-slot="toolbar-separator"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
  },
};

export const RightToLeft: Story = {
  render: () => (
    <Toolbar dir="rtl" aria-label="RTL actions" loop={false}>
      <ToolbarButton>First</ToolbarButton>
      <ToolbarButton>Second</ToolbarButton>
      <ToolbarButton>Last</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'First' }));
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Second' })).toHaveFocus();
    await userEvent.keyboard('{End}{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Last' })).toHaveFocus();
  },
};

export const NarrowContainer: Story = {
  render: () => (
    <div className="nx:w-full" style={{ maxWidth: 240 }}>
      <Toolbar aria-label="Narrow actions">
        <ToolbarButton variant="outline">Download files</ToolbarButton>
        <ToolbarButton>Move files</ToolbarButton>
        <ToolbarButton>Archive files</ToolbarButton>
        <ToolbarButton>Duplicate files</ToolbarButton>
      </Toolbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar');
    const first = canvas.getByRole('button', { name: 'Download files' });
    const last = canvas.getByRole('button', { name: 'Duplicate files' });
    await expect(toolbar.scrollWidth).toBeLessThanOrEqual(
      toolbar.clientWidth + 1
    );
    await expect(last.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().top
    );
    await userEvent.click(first);
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await expect(last).toHaveFocus();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="nx:grid nx:gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Toolbar key={size} aria-label={size + ' controls'}>
          <ToolbarButton size={size}>Action</ToolbarButton>
          <ToolbarToggleGroup type="multiple" aria-label="Formatting">
            <ToolbarToggleItem value="bold" size={size}>
              Bold
            </ToolbarToggleItem>
          </ToolbarToggleGroup>
        </Toolbar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const toolbar of within(canvasElement).getAllByRole('toolbar', {
      name: /controls$/,
    })) {
      const button = within(toolbar).getByRole('button', { name: 'Action' });
      const toggle = within(toolbar).getByRole('button', { name: 'Bold' });
      await expect(toggle.getBoundingClientRect().height).toBe(
        button.getBoundingClientRect().height
      );
      await expect(getComputedStyle(toggle).fontSize).toBe(
        getComputedStyle(button).fontSize
      );
    }
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:gap-10">
      <InlineExample />
      <AttachedExample />
      <SelectionExample />
    </div>
  ),
};

export const NarrowCompositions: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:gap-8" style={{ maxWidth: 280 }}>
      <InlineExample />
      <AttachedExample />
      <SelectionExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const toolbar of within(canvasElement).getAllByRole('toolbar')) {
      await expect(toolbar.scrollWidth).toBeLessThanOrEqual(
        toolbar.clientWidth + 1
      );
    }
  },
};

export const DisabledToggles: Story = {
  render: () => (
    <Toolbar aria-label="Formatting availability">
      <ToolbarButton>Undo</ToolbarButton>
      <ToolbarToggleGroup
        type="multiple"
        disabled
        aria-label="Unavailable formatting"
      >
        <ToolbarToggleItem value="bold">Bold</ToolbarToggleItem>
        <ToolbarToggleItem value="italic">Italic</ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarButton>Preview</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Bold' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Preview' })).toHaveFocus();
  },
};

function InlineExample() {
  const [view, setView] = React.useState('all');
  return (
    <section className="nx:grid nx:gap-4">
      <div>
        <h2 className="nx:typography-heading-small">Documents</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Keep your working files close at hand.
        </p>
      </div>
      <Toolbar
        aria-label="Document view"
        className="nx:w-full nx:rounded-none nx:border-0 nx:border-b-default nx:shadow-none nx:bg-transparent nx:p-0 nx:pb-3"
      >
        <ToolbarToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value);
          }}
          aria-label="Show documents"
        >
          <ToolbarToggleItem value="all">All documents</ToolbarToggleItem>
          <ToolbarToggleItem value="recent">Recent</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton className="nx:ms-auto">
              Show <IconChevronDown aria-hidden="true" />
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setView('all')}>
              All documents
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setView('recent')}>
              Recent documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>
      <ul className="nx:grid nx:gap-3 nx:typography-body-default">
        <li>
          Project brief{' '}
          <span className="nx:text-muted-foreground">· Today</span>
        </li>
        {view === 'all' && (
          <li>
            Research notes{' '}
            <span className="nx:text-muted-foreground">· Last week</span>
          </li>
        )}
      </ul>
    </section>
  );
}

function AttachedExample() {
  const [formatting, setFormatting] = React.useState<string[]>([]);
  const [text, setText] = React.useState(
    'Good tools stay close to the work. Draft your next idea here.'
  );
  return (
    <section className="nx:grid nx:gap-3">
      <h2 className="nx:typography-heading-small">Draft a note</h2>
      <div className="nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container">
        <Toolbar
          aria-label="Note formatting"
          className="nx:w-full nx:rounded-none nx:rounded-t-lg nx:border-0 nx:border-b-default nx:border-border-default nx:shadow-none nx:bg-background nx:p-2"
        >
          <ToolbarToggleGroup
            type="multiple"
            value={formatting}
            onValueChange={setFormatting}
            aria-label="Note style"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="bold"
                    size="icon-sm"
                    aria-label="Bold note"
                  >
                    <span className="nx:font-bold">B</span>
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="italic"
                    size="icon-sm"
                    aria-label="Italic note"
                  >
                    <span className="nx:italic">I</span>
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="underline"
                    size="icon-sm"
                    aria-label="Underline note"
                  >
                    <span className="nx:underline">U</span>
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarButton>
                More <IconChevronDown aria-hidden="true" />
              </ToolbarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setFormatting([])}>
                Clear formatting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
        <textarea
          aria-label="Note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="nx:block nx:min-h-32 nx:w-full nx:resize-y nx:rounded-b-lg nx:bg-transparent nx:p-4 nx:typography-body-default nx:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
          style={{
            fontWeight: formatting.includes('bold') ? 700 : undefined,
            fontStyle: formatting.includes('italic') ? 'italic' : undefined,
            textDecoration: formatting.includes('underline')
              ? 'underline'
              : undefined,
          }}
        />
      </div>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Formatting applies to the whole note in this example.
      </p>
    </section>
  );
}

const selectionFiles = ['Project brief', 'Research notes', 'Launch checklist'];

function SelectionExample() {
  const selectionId = React.useId();
  const [selected, setSelected] = React.useState<string[]>([
    'Project brief',
    'Research notes',
  ]);
  const [message, setMessage] = React.useState('');
  const [archived, setArchived] = React.useState<string[]>([]);
  const firstCheckbox = React.useRef<HTMLButtonElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  function clearSelection() {
    setSelected([]);
    firstCheckbox.current?.focus();
  }
  function archiveSelection() {
    setMessage(
      `${selected.length} document${selected.length === 1 ? '' : 's'} archived in this demo.`
    );
    setArchived((current) => [...current, ...selected]);
    setSelected([]);
    headingRef.current?.focus();
  }
  function toggleSelection(name: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, name] : current.filter((item) => item !== name)
    );
    setMessage('');
  }
  return (
    <section className="nx:grid nx:gap-4">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="nx:typography-heading-small nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
        >
          Select documents
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Actions appear when documents are selected.
        </p>
      </div>
      <div className="nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-3">
        {selectionFiles
          .filter((name) => !archived.includes(name))
          .map((name, index) => (
            <Label
              htmlFor={selectionId + name}
              key={name}
              className="nx:flex nx:min-h-10 nx:cursor-pointer nx:items-center nx:gap-3 nx:px-2 nx:typography-body-default"
            >
              <Checkbox
                id={selectionId + name}
                ref={index === 0 ? firstCheckbox : undefined}
                checked={selected.includes(name)}
                onCheckedChange={(checked) =>
                  toggleSelection(name, checked === true)
                }
              />
              {name}
            </Label>
          ))}
        {archived.length === selectionFiles.length && (
          <p className="nx:p-2 nx:typography-body-default nx:text-muted-foreground">
            No documents remaining.
          </p>
        )}
      </div>
      <div className="nx:flex nx:min-h-16 nx:justify-center">
        {selected.length > 0 && (
          <Toolbar
            aria-label="Selected document actions"
            className="nx:h-fit nx:justify-center nx:gap-0 nx:bg-popover nx:p-0"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToolbarButton
                  size="icon-sm"
                  aria-label="Clear selection"
                  className="nx:text-muted-foreground"
                  onClick={clearSelection}
                >
                  <IconX aria-hidden="true" />
                </ToolbarButton>
              </TooltipTrigger>
              <TooltipContent>Clear selection</TooltipContent>
            </Tooltip>
            <span
              className="nx:px-2 nx:typography-label-default nx:whitespace-nowrap"
              aria-live="polite"
            >
              {selected.length} selected
            </span>
            <ToolbarSeparator className="nx:self-stretch nx:data-[orientation=vertical]:h-auto" />
            <ToolbarButton onClick={archiveSelection}>
              <IconArchive aria-hidden="true" />
              Archive
            </ToolbarButton>
          </Toolbar>
        )}
      </div>
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {message}
      </p>
    </section>
  );
}

export const Inline: Story = {
  render: () => <InlineExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Recent' }));
    await expect(
      canvas.queryByText('Research notes', { exact: false })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('radio', { name: 'All documents' }));
    await expect(
      canvas.getByText('Research notes', { exact: false })
    ).toBeVisible();
  },
};
export const Attached: Story = {
  render: () => <AttachedExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Bold note' }));
    await expect(
      canvas.getByRole('button', { name: 'Bold note' })
    ).toHaveAttribute('data-state', 'on');
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toHaveStyle({
      fontWeight: '700',
    });
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole('menuitem', {
        name: 'Clear formatting',
      })
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Bold note' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Note' }),
      ' Ready.'
    );
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toHaveValue(
      'Good tools stay close to the work. Draft your next idea here. Ready.'
    );
  },
};
export const Selection: Story = {
  render: () => <SelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await expect(canvas.queryByRole('toolbar')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('checkbox', { name: 'Project brief' })
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Archive' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '1 document archived in this demo.'
    );
    await expect(canvas.queryByRole('toolbar')).not.toBeInTheDocument();
  },
};

export const VisualDirections: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two visual compositions of the same Toolbar. Quiet strip uses subtle separators and one surface; distinct tools uses individual button surfaces and spacing-only grouping. Corners continue to follow the global theme.',
      },
    },
  },
  render: () => (
    <div className="nx:@container nx:w-full">
      <div className="nx:grid nx:gap-8 nx:@2xl:grid-cols-2">
        <section className="nx:grid nx:content-start nx:gap-4">
          <div>
            <h2 className="nx:typography-heading-small">Quiet strip</h2>
            <p className="nx:typography-body-small nx:text-muted-foreground">
              One surface, subtle separators.
            </p>
          </div>
          <EditorToolbar />
        </section>
        <section className="nx:grid nx:content-start nx:gap-4">
          <div>
            <h2 className="nx:typography-heading-small">Distinct tools</h2>
            <p className="nx:typography-body-small nx:text-muted-foreground">
              Individual surfaces, spacing-only groups.
            </p>
          </div>
          <EditorToolbar className="nx:gap-2 nx:border-transparent nx:bg-background nx:shadow-none nx:[&_[data-slot=toolbar-separator]]:hidden nx:[&_[data-slot=toolbar-button]]:bg-container nx:[&_[data-slot=toolbar-button]]:border-border-default nx:[&_[data-slot=toolbar-toggle-item]]:bg-container nx:[&_[data-slot=toolbar-toggle-item]]:border-border-default" />
        </section>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const toolbar of canvas.getAllByRole('toolbar')) {
      const controls = within(toolbar);
      const bold = controls.getByRole('button', { name: 'Bold' });
      await userEvent.click(bold);
      await expect(bold).toHaveAttribute('data-state', 'on');
      await userEvent.click(
        controls.getByRole('button', { name: 'Undo formatting' })
      );
      await expect(bold).toHaveAttribute('aria-pressed', 'false');
    }
  },
};

function CompactFileActions() {
  const [action, setAction] = React.useState('');
  return (
    <section className="nx:grid nx:content-start nx:gap-4">
      <div>
        <h2 className="nx:typography-heading-small">Compact file actions</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          One frequent action. Everything else in the menu.
        </p>
      </div>
      <div className="nx:w-full" style={{ maxWidth: 240 }}>
        <Toolbar
          aria-label="Compact file actions"
          className="nx:flex-nowrap nx:gap-0 nx:p-0"
        >
          <ToolbarButton onClick={() => setAction('Download')}>
            <IconDownload aria-hidden="true" /> Download
          </ToolbarButton>
          <ToolbarSeparator className="nx:self-stretch nx:data-[orientation=vertical]:h-auto" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarButton size="icon-sm" aria-label="More file actions">
                <IconDots aria-hidden="true" />
              </ToolbarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setAction('Move')}>
                <IconFolder aria-hidden="true" /> Move
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAction('Archive')}>
                <IconArchive aria-hidden="true" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAction('Duplicate')}>
                <IconCopy aria-hidden="true" /> Duplicate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
      </div>
      <p
        role="status"
        className="nx:min-h-5 nx:typography-body-small nx:text-muted-foreground"
      >
        {action
          ? `${action} requested in this demo.`
          : 'Actions demonstrate command selection only.'}
      </p>
    </section>
  );
}

function DrawingTools() {
  const [tool, setTool] = React.useState('select');
  function changeTool(value: string) {
    if (value) setTool(value);
  }
  return (
    <section className="nx:grid nx:content-start nx:gap-4">
      <div>
        <h2 className="nx:typography-heading-small">Drawing tools</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          A quiet rail with one active tool.
        </p>
      </div>
      <div className="nx:flex nx:min-h-40 nx:items-start nx:gap-6">
        <Toolbar
          orientation="vertical"
          aria-label="Canvas tools"
          className="nx:shrink-0"
        >
          <ToolbarToggleGroup
            type="single"
            value={tool}
            onValueChange={changeTool}
            aria-label="Active drawing tool"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="select"
                    size="icon-sm"
                    aria-label="Select"
                  >
                    <IconPointer aria-hidden="true" />
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Select</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="draw"
                    size="icon-sm"
                    aria-label="Draw"
                  >
                    <IconPencil aria-hidden="true" />
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Draw</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="erase"
                    size="icon-sm"
                    aria-label="Erase"
                  >
                    <IconEraser aria-hidden="true" />
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Erase</TooltipContent>
            </Tooltip>
          </ToolbarToggleGroup>
        </Toolbar>
        <p
          role="status"
          className="nx:py-2 nx:typography-body-small nx:text-muted-foreground"
        >
          {tool === 'select'
            ? 'Select objects'
            : tool === 'draw'
              ? 'Draw a stroke'
              : 'Erase a stroke'}
        </p>
      </div>
    </section>
  );
}

export const ActionDirections: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three compositions using the existing Toolbar API: a compact selection bar, explicit overflow for file actions, and a single-select vertical tool rail. Commands are local demos; canvas drawing and file operations belong to the application. The drawing rail uses 2px padding and tool gaps; the action bars have no outer padding. Corners and surfaces follow the theme.',
      },
    },
  },
  render: () => (
    <div className="nx:@container nx:w-full">
      <div className="nx:grid nx:gap-10">
        <SelectionExample />
        <div className="nx:grid nx:gap-8 nx:@2xl:grid-cols-2">
          <CompactFileActions />
          <DrawingTools />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const files = within(
      canvas.getByRole('toolbar', { name: 'Compact file actions' })
    );
    await userEvent.click(files.getByRole('button', { name: 'Download' }));
    await expect(
      canvas.getByText('Download requested in this demo.')
    ).toBeVisible();
    await userEvent.keyboard('{ArrowRight}');
    const more = files.getByRole('button', { name: 'More file actions' });
    await expect(more).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole('menuitem', {
        name: 'Move',
      })
    );
    await waitFor(() => expect(more).toHaveFocus());
    await expect(
      canvas.getByText('Move requested in this demo.')
    ).toBeVisible();
    const select = canvas.getByRole('radio', { name: 'Select' });
    await userEvent.click(select);
    await userEvent.keyboard('{ArrowDown}');
    const draw = canvas.getByRole('radio', { name: 'Draw' });
    await expect(draw).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(draw).toHaveAttribute('aria-checked', 'true');
    await expect(select).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(draw);
    await expect(draw).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(select);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await expect(
      canvas.queryByRole('toolbar', { name: 'Selected document actions' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Project brief' })
    );
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Research notes' })
    );
    await expect(canvas.getByText('2 selected')).toBeVisible();
    for (const toolbar of canvas.getAllByRole('toolbar')) {
      await expect(toolbar.scrollWidth).toBeLessThanOrEqual(
        toolbar.clientWidth + 1
      );
    }
  },
};
