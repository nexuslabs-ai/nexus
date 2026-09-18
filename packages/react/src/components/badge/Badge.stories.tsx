import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconLock,
  IconX,
} from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Spinner } from '../spinner';

import { Badge, type BadgeProps } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'error',
        'warning',
        'success',
        'information',
      ],
      description: 'The visual style variant',
    },
    fill: {
      control: 'select',
      options: ['solid', 'light', 'outline'],
      description: 'The fill style (solid, light/surface, or outline)',
    },
    isCaps: {
      control: 'boolean',
      description: 'Use uppercase text with wider letter-spacing',
    },
    isNumber: {
      control: 'boolean',
      description: 'Render as circular number badge (pass number as children)',
    },
    leftIcon: {
      control: false,
      description: 'Icon to display before the label',
    },
    rightIcon: {
      control: false,
      description: 'Icon to display after the label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

const HEIGHT_VARIANTS = [
  'default',
  'secondary',
  'error',
  'warning',
  'success',
  'information',
] as const;
const HEIGHT_FILLS = ['solid', 'light', 'outline'] as const;
const HEIGHT_SHAPES = [
  { name: 'caps', props: { children: 'Label' } },
  { name: 'sentence', props: { children: 'Label', isCaps: false } },
  {
    name: 'caps-icon',
    props: { children: 'Verified', leftIcon: <IconCheck /> },
  },
  {
    name: 'left-icon',
    props: { children: 'Verified', isCaps: false, leftIcon: <IconCheck /> },
  },
  {
    name: 'right-icon',
    props: { children: 'Dismiss', isCaps: false, rightIcon: <IconX /> },
  },
  {
    name: 'both-icons',
    props: {
      children: 'Status',
      isCaps: false,
      leftIcon: <IconCheck />,
      rightIcon: <IconX />,
    },
  },
  {
    name: 'loading',
    props: {
      children: 'Loading',
      isCaps: false,
      leftIcon: (
        <Spinner role="presentation" aria-hidden aria-label={undefined} />
      ),
    },
  },
  {
    name: 'icon-only',
    props: { leftIcon: <IconCheck />, 'aria-label': 'Approved' },
  },
  {
    name: 'right-icon-only',
    props: { rightIcon: <IconX />, 'aria-label': 'Dismissed' },
  },
  {
    name: 'zero',
    props: { children: 0, isNumber: true, 'aria-label': '0 unread' },
  },
  {
    name: 'count',
    props: { children: 8, isNumber: true, 'aria-label': '8 unread' },
  },
  {
    name: 'high-count',
    props: {
      children: '99+',
      isNumber: true,
      'aria-label': '99 or more unread',
    },
  },
  { name: 'empty', props: { children: '' } },
  {
    name: 'long',
    props: { children: 'This is a very long badge label', isCaps: false },
  },
] satisfies { name: string; props: BadgeProps }[];

const SQUARE_FLOOR_SHAPES = new Set([
  'icon-only',
  'right-icon-only',
  'zero',
  'count',
  'high-count',
]);

const BASE_LINE_HEIGHT_SM = 20;
const BASE_UI_FONT_SIZE = 14;
const ENLARGED_GLOBALS = {
  density: 'compact',
  stroke: 'strong',
  uiFontSize: 32,
} as const;

function badgeLabel(badge: HTMLElement) {
  return (
    [badge.dataset.variant, badge.dataset.fill, badge.dataset.shape]
      .filter(Boolean)
      .join(' / ') || 'badge'
  );
}

function assertBadgeGeometry(badge: HTMLElement) {
  try {
    assertGeometry(badge);
  } catch (error) {
    if (error instanceof Error)
      error.message = `${badgeLabel(badge)}: ${error.message}`;
    throw error;
  }
}

function assertGeometry(badge: HTMLElement) {
  const styles = getComputedStyle(badge);
  const rect = badge.getBoundingClientRect();
  const spacing = parseFloat(styles.getPropertyValue('--nx-spacing-6'));
  const lineHeight = parseFloat(
    styles.getPropertyValue('--nx-typography-line-height-sm')
  );
  const stroke = parseFloat(
    styles.getPropertyValue('--nx-borderwidth-default')
  );
  const minimum = Math.max(spacing, lineHeight + 2 * stroke);
  expect(styles.boxSizing).toBe('border-box');
  expect(parseFloat(styles.minHeight)).toBeCloseTo(minimum, 1);
  expect(rect.height).toBeCloseTo(minimum, 1);
  const shape = badge.dataset.shape;
  if (shape && SQUARE_FLOOR_SHAPES.has(shape)) {
    expect(parseFloat(styles.minWidth)).toBeCloseTo(minimum, 1);
    expect(rect.width).toBeGreaterThanOrEqual(minimum - 0.5);
  }
  const innerTop = rect.top + parseFloat(styles.borderTopWidth);
  const innerBottom = rect.bottom - parseFloat(styles.borderBottomWidth);
  for (const wrapper of badge.querySelectorAll(':scope > span')) {
    const wrapperRect = wrapper.getBoundingClientRect();
    expect((wrapperRect.top + wrapperRect.bottom) / 2).toBeCloseTo(
      (innerTop + innerBottom) / 2,
      1
    );
    for (const svg of wrapper.querySelectorAll('svg')) {
      const svgRect = svg.getBoundingClientRect();
      expect(svgRect.top).toBeGreaterThanOrEqual(innerTop - 0.5);
      expect(svgRect.bottom).toBeLessThanOrEqual(innerBottom + 0.5);
    }
  }
  for (const child of badge.childNodes) {
    if (child.nodeType !== Node.TEXT_NODE || !child.textContent) continue;
    const range = document.createRange();
    range.selectNodeContents(child);
    const textRect = range.getBoundingClientRect();
    expect(textRect.top).toBeGreaterThanOrEqual(innerTop - 0.5);
    expect(textRect.bottom).toBeLessThanOrEqual(innerBottom + 0.5);
  }
}

const STATUS_STATES = {
  loading: {
    children: 'Loading',
    leftIcon: (
      <Spinner role="presentation" aria-hidden aria-label={undefined} />
    ),
    variant: 'information',
  },
  ready: { children: 'Ready', variant: 'success' },
  locked: { children: 'Locked', leftIcon: <IconLock />, variant: 'secondary' },
} satisfies Record<string, BadgeProps>;

function StatusTransitionsScene() {
  const [status, setStatus] = useState<keyof typeof STATUS_STATES>('loading');
  return (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-2" aria-live="polite">
        <Badge
          data-testid="status-badge"
          fill="outline"
          isCaps={false}
          {...STATUS_STATES[status]}
        />
        <span
          data-testid="status-neighbor"
          className="nx:typography-body-small"
        >
          Paper status
        </span>
      </div>
      <div className="nx:flex nx:gap-2">
        <Button onClick={() => setStatus('loading')}>Show loading</Button>
        <Button onClick={() => setStatus('ready')}>Show ready</Button>
        <Button onClick={() => setStatus('locked')}>Show locked</Button>
      </div>
    </div>
  );
}

// ============================================
// VARIANT STORIES (Solid Fill)
// ============================================

export const Default: Story = {
  args: {
    children: 'Badge',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Badge');

    await expect(badge).toHaveAttribute('data-variant', 'default');
    await expect(badge).toHaveAttribute('data-fill', 'solid');
    await expect(badge).toHaveAttribute('data-caps', 'true');
  },
};

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const ErrorVariant: Story = {
  name: 'Error',
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Information: Story = {
  args: {
    variant: 'information',
    children: 'Info',
  },
};

// ============================================
// FILL STYLE STORIES
// ============================================

export const SolidFill: Story = {
  args: {
    variant: 'default',
    fill: 'solid',
    children: 'Solid',
  },
};

export const LightFill: Story = {
  args: {
    variant: 'default',
    fill: 'light',
    children: 'Light',
  },
};

export const OutlineFill: Story = {
  args: {
    variant: 'success',
    fill: 'outline',
    children: 'Outline',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Outline');
    const badgeStyles = getComputedStyle(badge);

    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'outline');
    // Assert the rendered result (opaque fill + visible border), not the
    // utility class names — class names are implementation detail and mergeable.
    expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(badgeStyles.borderTopWidth)).toBeGreaterThan(0);
  },
};

// ============================================
// TYPOGRAPHY STYLE STORIES
// ============================================

export const Caps: Story = {
  globals: { density: 'default' },
  args: {
    isCaps: true,
    children: 'Label',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Label');
    const rect = badge.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-caps', 'true');
    expect(Math.round(rect.height)).toBe(24);
  },
};

export const Sentence: Story = {
  args: {
    isCaps: false,
    children: 'Label',
  },
};

export const HeightConsistency: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4">
      {HEIGHT_VARIANTS.map((variant) =>
        HEIGHT_FILLS.map((fill) => (
          <div
            key={`${variant}-${fill}`}
            className="nx:flex nx:flex-wrap nx:items-center nx:gap-2"
          >
            {HEIGHT_SHAPES.map(({ name, props }) => (
              <Badge
                key={name}
                data-testid="height-badge"
                data-shape={name}
                variant={variant}
                fill={fill}
                {...props}
              />
            ))}
          </div>
        ))
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badges = within(canvasElement).getAllByTestId('height-badge');
    await expect(badges).toHaveLength(
      HEIGHT_VARIANTS.length * HEIGHT_FILLS.length * HEIGHT_SHAPES.length
    );
    for (const badge of badges) assertBadgeGeometry(badge);
  },
};

export const HeightSizingRow: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      {HEIGHT_SHAPES.map(({ name, props }) => (
        <Badge
          key={name}
          data-testid="sizing-badge"
          data-shape={name}
          fill="outline"
          {...props}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const badge of within(canvasElement).getAllByTestId('sizing-badge'))
      assertBadgeGeometry(badge);
  },
};

export const EnlargedTypography: Story = {
  ...HeightSizingRow,
  tags: ['!autodocs', '!dev'],
  globals: ENLARGED_GLOBALS,
  play: async ({ canvasElement }) => {
    const badges = within(canvasElement).getAllByTestId('sizing-badge');
    await waitFor(() =>
      expect(
        parseFloat(
          getComputedStyle(badges[0]!).getPropertyValue(
            '--nx-typography-line-height-sm'
          )
        )
      ).toBeCloseTo(
        (BASE_LINE_HEIGHT_SM * ENLARGED_GLOBALS.uiFontSize) / BASE_UI_FONT_SIZE,
        3
      )
    );
    for (const badge of badges) assertBadgeGeometry(badge);
  },
};

export const StatusTransitions: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => <StatusTransitionsScene />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByTestId('status-badge');
    const initial = badge.getBoundingClientRect();
    const neighbor = canvas.getByTestId('status-neighbor');
    const neighborTop = neighbor.getBoundingClientRect().top;
    for (const status of ['ready', 'locked', 'loading']) {
      await userEvent.click(
        canvas.getByRole('button', { name: `Show ${status}` })
      );
      await expect(canvas.getByTestId('status-badge')).toBe(badge);
      await expect(badge).toHaveTextContent(new RegExp(status, 'i'));
      expect(badge.getBoundingClientRect().height).toBeCloseTo(
        initial.height,
        1
      );
      expect(badge.getBoundingClientRect().top).toBeCloseTo(initial.top, 1);
      expect(neighbor.getBoundingClientRect().top).toBeCloseTo(neighborTop, 1);
      assertBadgeGeometry(badge);
    }
  },
};

export const BoundaryChildren: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-2">
      {[undefined, null, false, '', <></>, 0].map((children, index) => (
        <Badge
          key={index}
          data-testid="boundary-badge"
          leftIcon={<IconCheck />}
          title="Approved"
        >
          {children}
        </Badge>
      ))}
      <Badge
        data-testid="boundary-badge"
        isNumber
        leftIcon={<IconCheck />}
        rightIcon={<IconX />}
        aria-label="0 unread"
      >
        0
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badges = within(canvasElement).getAllByTestId('boundary-badge');
    await expect(badges).toHaveLength(7);
    for (const badge of badges) assertBadgeGeometry(badge);
    for (const badge of badges.slice(0, 4)) {
      await expect(badge).toHaveAttribute('data-icon-only', 'true');
      await expect(badge).toHaveAttribute('role', 'img');
    }
    for (const badge of badges.slice(4))
      await expect(badge).not.toHaveAttribute('data-icon-only');
    await expect(badges[6]).toHaveAttribute('data-number', 'true');
    await expect(badges[6]!.querySelectorAll('svg')).toHaveLength(0);
  },
};

export const TallCustomContent: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <Badge fill="outline" isCaps={false} data-testid="tall-badge">
      <span className="nx:h-12 nx:inline-flex nx:items-center">
        Tall custom content
      </span>
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByTestId('tall-badge');
    const styles = getComputedStyle(badge);
    const child = badge.firstElementChild!;
    expect(badge.getBoundingClientRect().height).toBeGreaterThan(
      parseFloat(styles.minHeight)
    );
    expect(child.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      badge.getBoundingClientRect().top
    );
    expect(child.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      badge.getBoundingClientRect().bottom
    );
  },
};

export const MinimumHeightOverride: Story = {
  tags: ['!autodocs', '!dev'],
  args: { children: 'Custom height', className: 'nx:min-h-8' },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Custom height');
    const height = parseFloat(
      getComputedStyle(badge).getPropertyValue('--nx-spacing-8')
    );
    expect(badge.getBoundingClientRect().height).toBeCloseTo(height, 1);
    expect(parseFloat(getComputedStyle(badge).minHeight)).toBeCloseTo(
      height,
      1
    );
  },
};

// ============================================
// DATA ATTRIBUTE TESTS
// ============================================

export const WithDataAttributes: Story = {
  args: {
    children: 'Status',
    variant: 'success',
    fill: 'light',
    isCaps: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');

    await expect(badge).toHaveAttribute('data-slot', 'badge');
    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'light');
    await expect(badge).toHaveAttribute('data-caps', 'false');
  },
};

export const WithCustomClassName: Story = {
  args: {
    children: 'Custom',
    className: 'custom-test-class',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Custom');

    await expect(badge).toHaveClass('custom-test-class');
  },
};

// ============================================
// WITH ICONS
// ============================================

export const WithLeftIcon: Story = {
  args: {
    children: 'Verified',
    variant: 'success',
    isCaps: false,
    leftIcon: <IconCheck />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Dismiss',
    variant: 'secondary',
    isCaps: false,
    rightIcon: <IconX />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Status',
    variant: 'default',
    isCaps: false,
    leftIcon: <IconCheck />,
    rightIcon: <IconX />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');
    const svgs = badge.querySelectorAll('svg');

    await expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      const rect = svg.getBoundingClientRect();

      expect(Math.round(rect.width)).toBe(14);
      expect(Math.round(rect.height)).toBe(14);
    }
  },
};

export const IconOnly: Story = {
  globals: { density: 'default' },
  args: {
    variant: 'success',
    fill: 'light',
    leftIcon: <IconCheck />,
    'aria-label': 'Approved',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('img', { name: 'Approved' });
    const svg = badge.querySelector('svg');
    const rect = badge.getBoundingClientRect();

    if (!(svg instanceof SVGElement)) {
      throw new Error('Expected icon-only badge to render an SVG icon.');
    }

    const svgRect = svg.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-icon-only', 'true');
    expect(badge.textContent).toBe('');
    expect(Math.round(rect.height)).toBe(24);
    expect(Math.round(rect.width)).toBeGreaterThanOrEqual(24);
    expect(Math.round(svgRect.width)).toBe(14);
    expect(Math.round(svgRect.height)).toBe(14);
  },
};

export const WithSvgLoader: Story = {
  args: {
    children: 'Loading',
    variant: 'information',
    fill: 'outline',
    isCaps: false,
    leftIcon: (
      <Spinner role="presentation" aria-hidden="true" aria-label={undefined} />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Loading');
    const spinner = badge.querySelector('[data-slot="spinner"]');

    if (!(spinner instanceof SVGElement)) {
      throw new Error('Expected loader badge to render a Spinner SVG.');
    }

    const rect = spinner.getBoundingClientRect();

    await expect(spinner).toHaveAttribute('role', 'presentation');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await expect(spinner).not.toHaveAttribute('aria-label');
    expect(Math.round(rect.width)).toBe(14);
    expect(Math.round(rect.height)).toBe(14);
  },
};

export const StatusWithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Recommended (not enforced): don't rely on color alone for status — pair a status `variant` with clear text and/or a leading icon. The icons here are a suggested set.",
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Badge
        variant="success"
        fill="light"
        isCaps={false}
        leftIcon={<IconCircleCheck />}
      >
        Success
      </Badge>
      <Badge
        variant="warning"
        fill="light"
        isCaps={false}
        leftIcon={<IconAlertTriangle />}
      >
        Warning
      </Badge>
      <Badge
        variant="error"
        fill="light"
        isCaps={false}
        leftIcon={<IconAlertCircle />}
      >
        Error
      </Badge>
      <Badge
        variant="information"
        fill="light"
        isCaps={false}
        leftIcon={<IconInfoCircle />}
      >
        Info
      </Badge>
    </div>
  ),
};

// ============================================
// NUMBER BADGES
// ============================================

export const NumberBadge: Story = {
  args: {
    isNumber: true,
    children: 8,
  },
};

export const NumberBadgeHighValue: Story = {
  globals: { density: 'default' },
  args: {
    isNumber: true,
    children: '99+',
    variant: 'error',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('99+');
    const rect = badge.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-number', 'true');
    expect(Math.round(rect.height)).toBe(24);
    expect(Math.round(rect.width)).toBeGreaterThan(24);
  },
};

export const NumberBadgeIgnoresIcons: Story = {
  args: {
    isNumber: true,
    children: 5,
    leftIcon: <IconCheck />, // Should be ignored
    rightIcon: <IconX />, // Should be ignored
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('5');

    // Number mode wins over icons.
    await expect(badge).toHaveAttribute('data-number', 'true');
    await expect(badge.querySelectorAll('svg')).toHaveLength(0);
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongContent: Story = {
  args: {
    children: 'This is a very long badge text',
    isCaps: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('This is a very long badge text');

    await expect(badge).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {/* Solid Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Solid Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default">Label</Badge>
          <Badge variant="secondary">Label</Badge>
          <Badge variant="error">Label</Badge>
          <Badge variant="warning">Label</Badge>
          <Badge variant="success">Label</Badge>
          <Badge variant="information">Label</Badge>
        </div>
      </div>

      {/* Solid Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Solid Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" isCaps={false}>
            Label
          </Badge>
          <Badge variant="error" isCaps={false}>
            Label
          </Badge>
          <Badge variant="warning" isCaps={false}>
            Label
          </Badge>
          <Badge variant="success" isCaps={false}>
            Label
          </Badge>
          <Badge variant="information" isCaps={false}>
            Label
          </Badge>
        </div>
      </div>

      {/* Light Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Light Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light">
            Label
          </Badge>
          <Badge variant="secondary" fill="light">
            Label
          </Badge>
          <Badge variant="error" fill="light">
            Label
          </Badge>
          <Badge variant="warning" fill="light">
            Label
          </Badge>
          <Badge variant="success" fill="light">
            Label
          </Badge>
          <Badge variant="information" fill="light">
            Label
          </Badge>
        </div>
      </div>

      {/* Light Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Light Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="error" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="warning" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="success" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="information" fill="light" isCaps={false}>
            Label
          </Badge>
        </div>
      </div>

      {/* Outline Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Outline Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="outline">
            Default
          </Badge>
          <Badge variant="secondary" fill="outline">
            Secondary
          </Badge>
          <Badge variant="error" fill="outline">
            Error
          </Badge>
          <Badge variant="warning" fill="outline">
            Warning
          </Badge>
          <Badge variant="success" fill="outline">
            Success
          </Badge>
          <Badge variant="information" fill="outline">
            Info
          </Badge>
        </div>
      </div>

      {/* Outline Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Outline Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="outline" isCaps={false}>
            Default
          </Badge>
          <Badge variant="secondary" fill="outline" isCaps={false}>
            Secondary
          </Badge>
          <Badge variant="error" fill="outline" isCaps={false}>
            Error
          </Badge>
          <Badge variant="warning" fill="outline" isCaps={false}>
            Warning
          </Badge>
          <Badge variant="success" fill="outline" isCaps={false}>
            Success
          </Badge>
          <Badge variant="information" fill="outline" isCaps={false}>
            Info
          </Badge>
        </div>
      </div>

      {/* Number Badges */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Number Badges
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isNumber>
            8
          </Badge>
          <Badge variant="secondary" isNumber>
            8
          </Badge>
          <Badge variant="error" isNumber>
            8
          </Badge>
          <Badge variant="warning" isNumber>
            8
          </Badge>
          <Badge variant="success" isNumber>
            8
          </Badge>
          <Badge variant="information" isNumber>
            8
          </Badge>
        </div>
      </div>

      {/* Icon Only */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Icon Only
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge
            variant="success"
            fill="light"
            leftIcon={<IconCheck />}
            aria-label="Approved"
          />
          <Badge
            variant="default"
            fill="solid"
            leftIcon={<IconCheck />}
            aria-label="Verified"
          />
          <Badge
            variant="error"
            fill="outline"
            rightIcon={<IconX />}
            aria-label="Error"
          />
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          With Icons
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false} leftIcon={<IconCheck />}>
            Label
          </Badge>
          <Badge variant="success" isCaps={false} leftIcon={<IconCheck />}>
            Label
          </Badge>
          <Badge variant="error" isCaps={false} rightIcon={<IconX />}>
            Label
          </Badge>
        </div>
      </div>

      {/* With SVG Loader */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          With SVG Loader
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge
            variant="information"
            fill="outline"
            isCaps={false}
            leftIcon={
              <Spinner
                role="presentation"
                aria-hidden="true"
                aria-label={undefined}
              />
            }
          >
            Loading
          </Badge>
          <Badge
            variant="information"
            fill="light"
            isCaps={false}
            leftIcon={
              <Spinner
                role="presentation"
                aria-hidden="true"
                aria-label={undefined}
              />
            }
          >
            Syncing
          </Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
