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
import {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../item';
import { Spinner } from '../spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Attachment,
  AttachmentGroup,
  AttachmentProgress,
  type AttachmentProps,
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
      <ItemMedia variant="icon">
        <IconFileTypePdf />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>report.pdf</ItemTitle>
        <ItemDescription>2.4 MB</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
          <IconX />
        </Button>
      </ItemActions>
    </Attachment>
  ),
};

// Every lifecycle state, top to bottom. Each carries leading media — a state
// glyph for idle/processing/error, the file-type icon otherwise — and a
// trailing dismiss cross whose label says what dismissing means in that state.
export const States: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <Attachment state="idle">
        <ItemMedia variant="icon">
          <IconUpload />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Drop a file here</ItemTitle>
          <ItemDescription>PDF or PNG, up to 10 MB</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon-sm" aria-label="Dismiss">
            <IconX />
          </Button>
        </ItemActions>
      </Attachment>
      <Attachment state="uploading">
        <ItemMedia variant="icon">
          <IconFileTypePdf />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>report.pdf</ItemTitle>
          <ItemDescription>62% of 2.4 MB</ItemDescription>
          <AttachmentProgress value={62} aria-label="Uploading report.pdf" />
        </ItemContent>
        <ItemActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel upload of report.pdf"
          >
            <IconX />
          </Button>
        </ItemActions>
      </Attachment>
      <Attachment state="processing">
        <ItemMedia variant="icon">
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>scan.png</ItemTitle>
          <ItemDescription>Processing…</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel processing of scan.png"
          >
            <IconX />
          </Button>
        </ItemActions>
      </Attachment>
      <Attachment state="error">
        <ItemMedia variant="icon">
          <IconAlertTriangle />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>archive.zip</ItemTitle>
          <ItemDescription>Upload failed — file too large</ItemDescription>
        </ItemContent>
        <ItemActions>
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
        </ItemActions>
      </Attachment>
      <Attachment state="done">
        <ItemMedia variant="icon">
          <IconFileTypeTxt />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            notes.txt
            <IconCircleCheckFilled className="nx:ml-1 nx:inline nx:size-4 nx:align-text-bottom nx:text-success-subtle-foreground" />
          </ItemTitle>
          <ItemDescription>8 KB · Uploaded just now</ItemDescription>
        </ItemContent>
        <ItemActions>
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
        </ItemActions>
      </Attachment>
    </div>
  ),
};

// The two densities, each showing its file type through the leading icon.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <Attachment size="default">
        <ItemMedia variant="icon">
          <IconFileTypePdf />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>report.pdf</ItemTitle>
          <ItemDescription>2.4 MB</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
            <IconX />
          </Button>
        </ItemActions>
      </Attachment>
      <Attachment size="sm">
        <ItemMedia variant="icon">
          <IconFileTypeTxt />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>notes.txt</ItemTitle>
          <ItemDescription>8 KB</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon-sm" aria-label="Remove notes.txt">
            <IconX />
          </Button>
        </ItemActions>
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
          <ItemMedia variant="icon">{file.icon}</ItemMedia>
          <ItemContent>
            <ItemTitle>{file.name}</ItemTitle>
            <ItemDescription>{file.size}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${file.name}`}
            >
              <IconX />
            </Button>
          </ItemActions>
        </Attachment>
      ))}
    </div>
  ),
};

// The vertical tile: media fills the card width, name sits beneath.
export const VerticalOrientation: Story = {
  render: () => (
    <Attachment orientation="vertical">
      <ItemMedia variant="image">
        <img src={THUMB} alt="" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>cover.png</ItemTitle>
        <ItemDescription>412 KB</ItemDescription>
      </ItemContent>
    </Attachment>
  ),
};

// A composer strip — mixed file types scrolling horizontally. Images preview
// their own thumbnail; everything else falls back to its file-type glyph.
export const Grouped: Story = {
  render: () => (
    <AttachmentGroup className="nx:w-80">
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
          <ItemMedia variant={file.name.endsWith('.png') ? 'image' : 'icon'}>
            {file.media}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{file.name}</ItemTitle>
            <ItemDescription>{file.size}</ItemDescription>
          </ItemContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
};

const LONG_NAME = 'quarterly-financial-report-with-appendices-final-v12.pdf';

// Long names truncate rather than widening the card — but the name stays
// recoverable. The complete string is in the DOM, so assistive tech reads it in
// full, and a tooltip on the card trigger reveals it to sighted users on hover
// and on keyboard focus.
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
        <ItemMedia variant="icon">
          <IconFileTypePdf />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{LONG_NAME}</ItemTitle>
          <ItemDescription>2.4 MB</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${LONG_NAME}`}
          >
            <IconX />
          </Button>
        </ItemActions>
      </Attachment>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText(LONG_NAME);

    // Clipped on screen, complete in the accessibility tree.
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
      <ItemMedia variant="icon">
        <IconFileTypePdf />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>report.pdf</ItemTitle>
        <ItemDescription>2.4 MB</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Remove report.pdf"
          onClick={args.onRemove}
        >
          <IconX />
        </Button>
      </ItemActions>
    </Attachment>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open report.pdf' });
    await userEvent.click(trigger);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);

    // The remove button sits above the overlay, so it takes its own click
    // rather than the trigger swallowing it.
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
        <ItemTitle>report.pdf</ItemTitle>
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
        <ItemTitle>report.pdf</ItemTitle>
        <ItemDescription>Uploading…</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Remove report.pdf"
          disabled
          onClick={args.onRemove}
        >
          <IconX />
        </Button>
      </ItemActions>
    </Attachment>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove report.pdf' });

    // A disabled Button carries pointer-events: none, so a click cannot be
    // dispatched at it — the disabled state and the unfired spy are the proof.
    await expect(remove).toBeDisabled();
    await expect(remove).toHaveAttribute('disabled');
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
        <ItemTitle>report.pdf</ItemTitle>
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
        <ItemTitle>report.pdf</ItemTitle>
      </ItemContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-slot="attachment"]');

    await expect(root).toHaveAttribute('data-state', 'uploading');
    await expect(root).toHaveAttribute('data-orientation', 'vertical');

    // Progress must not be conveyed by the visual treatment alone.
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
              <ItemMedia variant="icon">
                <IconFile />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{state}</ItemTitle>
                <ItemDescription>2.4 MB</ItemDescription>
              </ItemContent>
            </Attachment>
          )
        )}
      </div>
      <AttachmentGroup className="nx:w-80">
        {['one.png', 'two.png', 'three.png'].map((name) => (
          <Attachment key={name} orientation="vertical">
            <ItemMedia variant="image">
              <img src={THUMB} alt="" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
            </ItemContent>
          </Attachment>
        ))}
      </AttachmentGroup>
    </div>
  ),
};
