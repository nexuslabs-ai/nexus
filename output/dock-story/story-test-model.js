export const storyModes = [
  {
    id: 'states',
    label: 'States',
    field: 'Starting state',
    description: 'A known starting point, ready to inspect.',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
      { value: 'disabled', label: 'Disabled' },
      { value: 'invalid', label: 'Invalid' },
    ],
  },
  {
    id: 'interactions',
    label: 'Interactions',
    field: 'Scenario',
    description: 'The same action. A repeatable expectation.',
    options: [
      { value: 'click', label: 'Click on, then off' },
      { value: 'disabled', label: 'Disabled click' },
      { value: 'keyboard', label: 'Try Space yourself' },
    ],
  },
  {
    id: 'callbacks',
    label: 'Callbacks',
    field: 'Implementation',
    description: 'Check what the app hears, too.',
    options: [
      { value: 'correct', label: 'Correct callback' },
      { value: 'wrong', label: 'Wrong value' },
      { value: 'missing', label: 'No callback' },
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    field: 'Accessible name',
    description: 'One automated rule. A clear testing scope.',
    options: [
      { value: 'present', label: 'Name present' },
      { value: 'missing', label: 'Name missing' },
    ],
  },
];

const clickSource = [
  'play: async ({ canvas, args }) => {',
  '  const el = canvas.getByRole("switch");',
  '  await expect(el).not.toBeChecked();',
  '  await userEvent.click(el);',
  '  await expect(el).toBeChecked();',
  '  await userEvent.click(el);',
  '  await expect(el).not.toBeChecked();',
  '};',
];

export function describeStory(mode, choice) {
  if (mode === 'states')
    return {
      name: choice[0].toUpperCase() + choice.slice(1),
      source: [
        'args: {',
        `  defaultChecked: ${choice === 'on'},`,
        `  disabled: ${choice === 'disabled'},`,
        `  "aria-invalid": ${choice === 'invalid'},`,
        '},',
        '',
        '// Each state is a living example.',
        '// Run the example to verify it.',
      ],
      lines: [1, 2, 3],
      labels: ['Visible state', 'Disabled behavior', 'Validation state'],
    };
  if (mode === 'callbacks')
    return {
      name: 'CallbackContract',
      source: [
        'args: { onCheckedChange: fn() },',
        '',
        'play: async ({ canvas, args }) => {',
        '  const el = canvas.getByRole("switch");',
        '  await userEvent.click(el);',
        '  await expect(el).toBeChecked();',
        '  await expect(args.onCheckedChange)',
        '    .toHaveBeenCalledTimes(1);',
        '  await expect(args.onCheckedChange)',
        '    .toHaveBeenCalledWith(true);',
        '};',
      ],
      lines: [5, 7, 9],
      labels: ['Switch is on', 'One callback', 'Callback is true'],
    };
  if (mode === 'accessibility')
    return {
      name: 'AccessibleName',
      source: [
        '// Storybook can also run axe checks.',
        'parameters: { a11y: { test: "error" } },',
        '',
        '// This demo checks the name only:',
        'play: async ({ canvas }) => {',
        '  const el = canvas.getByRole("switch");',
        '  await expect(el).toHaveAccessibleName(',
        '    "Email notifications"',
        '  );',
        '};',
        '// Manual accessibility review matters too.',
      ],
      lines: [6, -1, -1],
      labels: ['Accessible name', 'Keyboard review', 'Screen-reader review'],
    };
  if (choice === 'disabled')
    return {
      name: 'DisabledInteraction',
      source: [
        'args: { disabled: true, onCheckedChange: fn() },',
        '',
        'play: async ({ canvas, args }) => {',
        '  const el = canvas.getByRole("switch");',
        '  await expect(el).toBeDisabled();',
        '  await userEvent.click(el);',
        '  await expect(el).not.toBeChecked();',
        '  await expect(args.onCheckedChange)',
        '    .not.toHaveBeenCalled();',
        '};',
      ],
      lines: [4, 6, 8],
      labels: ['Is disabled', 'Stays off', 'No callback'],
    };
  if (choice === 'keyboard')
    return {
      name: 'KeyboardInteraction',
      source: [
        'play: async ({ canvas, args }) => {',
        '  const el = canvas.getByRole("switch");',
        '  await userEvent.tab();',
        '  await expect(el).toHaveFocus();',
        '  await userEvent.keyboard(" ");',
        '  await expect(el).toBeChecked();',
        '  await expect(args.onCheckedChange)',
        '    .toHaveBeenCalledWith(true);',
        '};',
      ],
      lines: [3, 5, 7],
      labels: ['Receives focus', 'Space turns it on', 'Reports new value'],
    };
  return {
    name: 'ClickInteraction',
    source: clickSource,
    lines: [2, 4, 6],
    labels: ['Starts off', 'Click turns on', 'Click turns off'],
  };
}

export function initialChecks(mode) {
  return [0, 1, 2].map((index) => ({
    status: mode === 'accessibility' && index > 0 ? 'manual' : 'pending',
    detail:
      mode === 'accessibility' && index > 0
        ? 'Separate review required'
        : 'Not run',
  }));
}

export function result(ok, detail) {
  return { status: ok ? 'pass' : 'fail', detail };
}

export function resultSummary(checks) {
  const failed = checks.filter((check) => check.status === 'fail').length;
  const passed = checks.filter((check) => check.status === 'pass').length;
  return failed
    ? `${failed} ${failed === 1 ? 'check' : 'checks'} failed`
    : `${passed} ${passed === 1 ? 'check' : 'checks'} passed`;
}
