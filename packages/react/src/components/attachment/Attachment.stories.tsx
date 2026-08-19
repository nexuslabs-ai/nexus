import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconDownload,
  IconFile,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileTypeTxt,
  IconFileTypeZip,
  IconRefresh,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '../button';
import { ItemContent, ItemDescription } from '../item';
import { Spinner } from '../spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Attachment,
  AttachmentActions,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentProgress,
  type AttachmentProps,
  AttachmentTitle,
  AttachmentTrigger,
} from './attachment';

const meta: Meta<typeof Attachment> = {
  title: 'Components/Attachment',
  component: Attachment,
};

export default meta;
type Story = StoryObj<typeof Attachment>;

// A gray thumbnail rendered without a network request.
const THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23999'/%3E%3C/svg%3E";

// A settled attachment: icon media, name + size, and a remove action.
export const Default: Story = {
  render: () => (
    <Attachment className="nx:w-80">
      <AttachmentMedia variant="icon">
        <IconFileTypePdf />
      </AttachmentMedia>
      <ItemContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
        <ItemDescription>2.4 MB</ItemDescription>
      </ItemContent>
      <AttachmentActions>
        <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
          <IconX />
        </Button>
      </AttachmentActions>
    </Attachment>
  ),
};

// Every lifecycle state, top to bottom.
export const States: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <Attachment state="idle">
        <AttachmentMedia variant="icon">
          <IconUpload />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>Drop a file here</AttachmentTitle>
          <ItemDescription>PDF or PNG, up to 10 MB</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button variant="ghost" size="icon-sm" aria-label="Dismiss">
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia variant="icon">
          <IconFileTypePdf />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <ItemDescription>62% of 2.4 MB</ItemDescription>
          <AttachmentProgress value={62} aria-label="Uploading report.pdf" />
        </ItemContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel upload of report.pdf"
          >
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment state="processing">
        <AttachmentMedia variant="icon">
          <Spinner />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>scan.png</AttachmentTitle>
          <ItemDescription>Processing…</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel processing of scan.png"
          >
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia variant="icon">
          <IconAlertTriangle />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>archive.zip</AttachmentTitle>
          <ItemDescription>Upload failed — file too large</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Retry upload of archive.zip"
          >
            <IconRefresh />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss archive.zip"
          >
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment state="done">
        <AttachmentMedia variant="icon">
          <IconFileTypeTxt />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle
            trailing={
              <IconCircleCheckFilled className="nx:size-4 nx:text-success-subtle-foreground" />
            }
          >
            notes.txt
          </AttachmentTitle>
          <ItemDescription>8 KB · Uploaded just now</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Download notes.txt"
          >
            <IconDownload />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Remove notes.txt">
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
};

// The two densities, each showing its file type through the leading icon.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <Attachment size="default">
        <AttachmentMedia variant="icon">
          <IconFileTypePdf />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <ItemDescription>2.4 MB</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <IconFileTypeTxt />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>notes.txt</AttachmentTitle>
          <ItemDescription>8 KB</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button variant="ghost" size="icon-sm" aria-label="Remove notes.txt">
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
};

// The file-type glyphs a consumer maps their own MIME types onto.
export const FileTypes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      {[
        { name: 'report.pdf', size: '2.4 MB', icon: <IconFileTypePdf /> },
        { name: 'notes.txt', size: '8 KB', icon: <IconFileTypeTxt /> },
        { name: 'archive.zip', size: '18 MB', icon: <IconFileTypeZip /> },
        { name: 'cover.png', size: '412 KB', icon: <IconFileTypePng /> },
        { name: 'brief.docx', size: '96 KB', icon: <IconFileTypeDocx /> },
        { name: 'data.bin', size: '1.1 MB', icon: <IconFile /> },
      ].map((file) => (
        <Attachment key={file.name}>
          <AttachmentMedia variant="icon">{file.icon}</AttachmentMedia>
          <ItemContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <ItemDescription>{file.size}</ItemDescription>
          </ItemContent>
          <AttachmentActions>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${file.name}`}
            >
              <IconX />
            </Button>
          </AttachmentActions>
        </Attachment>
      ))}
    </div>
  ),
};

// The vertical tile: media fills the card width, name sits beneath.
export const VerticalOrientation: Story = {
  render: () => (
    <Attachment orientation="vertical">
      <AttachmentMedia variant="image">
        <img src={THUMB} alt="" />
      </AttachmentMedia>
      <ItemContent>
        <AttachmentTitle>cover.png</AttachmentTitle>
        <ItemDescription>412 KB</ItemDescription>
      </ItemContent>
    </Attachment>
  ),
};

// A composer strip — mixed file types scrolling horizontally.
export const Grouped: Story = {
  render: () => (
    <AttachmentGroup aria-label="Attached files" className="nx:w-80">
      {[
        {
          name: 'cover.png',
          size: '412 KB',
          media: <img src={THUMB} alt="" />,
        },
        { name: 'report.pdf', size: '2.4 MB', media: <IconFileTypePdf /> },
        { name: 'notes.txt', size: '8 KB', media: <IconFileTypeTxt /> },
        { name: 'archive.zip', size: '18 MB', media: <IconFileTypeZip /> },
        { name: 'brief.docx', size: '96 KB', media: <IconFileTypeDocx /> },
      ].map((file) => (
        <Attachment key={file.name} orientation="vertical">
          <AttachmentMedia
            variant={file.name.endsWith('.png') ? 'image' : 'icon'}
          >
            {file.media}
          </AttachmentMedia>
          <ItemContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <ItemDescription>{file.size}</ItemDescription>
          </ItemContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
};

// The strip is its own tab stop, so it can be scrolled by keyboard even when
// no card inside it is focusable.
export const GroupKeyboardInteraction: Story = {
  render: () => (
    <AttachmentGroup aria-label="Attached files" className="nx:w-80">
      {['cover.png', 'report.pdf', 'notes.txt', 'archive.zip'].map((name) => (
        <Attachment key={name} orientation="vertical">
          <AttachmentMedia variant="icon">
            <IconFile />
          </AttachmentMedia>
          <ItemContent>
            <AttachmentTitle>{name}</AttachmentTitle>
          </ItemContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Attached files' });

    await userEvent.tab();
    await expect(group).toHaveFocus();
    await expect(group).toHaveAttribute('data-slot', 'attachment-group');

    // A tab stop that cannot scroll would make the focus pointless.
    await expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
  },
};

const LONG_NAME = 'quarterly-financial-report-with-appendices-final-v12.pdf';

// Long names truncate rather than widening the card, with a tooltip on the
// card trigger revealing the full name.
export const LongFileName: Story = {
  render: () => (
    <TooltipProvider>
      <Attachment className="nx:w-80">
        <Tooltip>
          <TooltipTrigger asChild>
            <AttachmentTrigger>
              <span className="nx:sr-only">Open {LONG_NAME}</span>
            </AttachmentTrigger>
          </TooltipTrigger>
          <TooltipContent>{LONG_NAME}</TooltipContent>
        </Tooltip>
        <AttachmentMedia variant="icon">
          <IconFileTypePdf />
        </AttachmentMedia>
        <ItemContent>
          <AttachmentTitle>{LONG_NAME}</AttachmentTitle>
          <ItemDescription>2.4 MB</ItemDescription>
        </ItemContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${LONG_NAME}`}
          >
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText(LONG_NAME);

    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  },
};

// The remove action fires, and is not blocked by the full-card trigger overlay.
export const ClickInteraction: StoryObj<
  AttachmentProps & { onOpen: () => void; onRemove: () => void }
> = {
  args: { onOpen: fn(), onRemove: fn() },
  render: (args) => (
    <Attachment className="nx:w-80">
      <AttachmentTrigger onClick={args.onOpen}>
        <span className="nx:sr-only">Open report.pdf</span>
      </AttachmentTrigger>
      <AttachmentMedia variant="icon">
        <IconFileTypePdf />
      </AttachmentMedia>
      <ItemContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
        <ItemDescription>2.4 MB</ItemDescription>
      </ItemContent>
      <AttachmentActions>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Remove report.pdf"
          onClick={args.onRemove}
        >
          <IconX />
        </Button>
      </AttachmentActions>
    </Attachment>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open report.pdf' });
    await userEvent.click(trigger);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);

    const remove = canvas.getByRole('button', { name: 'Remove report.pdf' });
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

// The card trigger is reachable and activates from the keyboard.
export const KeyboardInteraction: StoryObj<
  AttachmentProps & { onOpen: () => void }
> = {
  args: { onOpen: fn() },
  render: (args) => (
    <Attachment className="nx:w-80">
      <AttachmentTrigger onClick={args.onOpen}>
        <span className="nx:sr-only">Open report.pdf</span>
      </AttachmentTrigger>
      <ItemContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
      </ItemContent>
    </Attachment>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open report.pdf' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

// A disabled remove action does not fire.
export const Disabled: StoryObj<AttachmentProps & { onRemove: () => void }> = {
  args: { onRemove: fn() },
  render: (args) => (
    <Attachment state="uploading" className="nx:w-80">
      <ItemContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
        <ItemDescription>Uploading…</ItemDescription>
      </ItemContent>
      <AttachmentActions>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Remove report.pdf"
          disabled
          onClick={args.onRemove}
        >
          <IconX />
        </Button>
      </AttachmentActions>
    </Attachment>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove report.pdf' });

    await expect(remove).toBeDisabled();

    // pointerEventsCheck: 0 dispatches the click at a disabled control that
    // would otherwise be unclickable, so the assertion can actually fail.
    await userEvent.click(remove, { pointerEventsCheck: 0 });
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};

// The trigger composes as a link via asChild.
export const AsChild: Story = {
  render: () => (
    <Attachment className="nx:w-80">
      <AttachmentTrigger asChild>
        <a href="#report">
          <span className="nx:sr-only">Open report.pdf</span>
        </a>
      </AttachmentTrigger>
      <ItemContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
      </ItemContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Open report.pdf' });

    await expect(link).toHaveAttribute('href', '#report');
    await expect(link).toHaveAttribute('data-slot', 'attachment-trigger');
  },
};

// State reaches the DOM as data attributes, and is announced via role=status.
export const WithDataAttributes: Story = {
  render: () => (
    <Attachment state="uploading" orientation="vertical">
      <ItemContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
      </ItemContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-slot="attachment"]');

    await expect(root).toHaveAttribute('data-state', 'uploading');
    await expect(root).toHaveAttribute('data-orientation', 'vertical');

    await expect(canvas.getByRole('status')).toHaveTextContent('Uploading');
  },
};

// Visual grid reference.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        {(['idle', 'uploading', 'processing', 'error', 'done'] as const).map(
          (state) => (
            <Attachment key={state} state={state}>
              <AttachmentMedia variant="icon">
                <IconFile />
              </AttachmentMedia>
              <ItemContent>
                <AttachmentTitle>{state}</AttachmentTitle>
                <ItemDescription>2.4 MB</ItemDescription>
              </ItemContent>
            </Attachment>
          )
        )}
      </div>
      <AttachmentGroup aria-label="Attached files" className="nx:w-80">
        {['one.png', 'two.png', 'three.png'].map((name) => (
          <Attachment key={name} orientation="vertical">
            <AttachmentMedia variant="image">
              <img src={THUMB} alt="" />
            </AttachmentMedia>
            <ItemContent>
              <AttachmentTitle>{name}</AttachmentTitle>
            </ItemContent>
          </Attachment>
        ))}
      </AttachmentGroup>
    </div>
  ),
};
