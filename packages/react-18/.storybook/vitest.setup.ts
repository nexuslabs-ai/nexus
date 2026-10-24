// packages/react/.storybook/vitest.setup.ts
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react';
import { afterEach, beforeAll, beforeEach } from 'vitest';

import * as projectAnnotations from './preview';

// Set up project annotations for Vitest
// setProjectAnnotations from @storybook/react already includes React renderer internally
const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

beforeAll(annotations.beforeAll);

// React reports misuse, such as a ref it had to drop, with console.error and
// carries on rendering. Fail the story instead. Messages about the `act` scope
// describe how Storybook drives React in a test, not the component.
const consoleError = console.error;
const ACT_SCOPE = /inside an `act` scope|not wrapped in act\(/;
let logged: string[] = [];

function format([message, ...args]: unknown[]) {
  if (typeof message !== 'string')
    return [message, ...args].map(String).join(' ');
  return message.replace(/%[sdo]/g, () => String(args.shift()));
}

beforeEach(() => {
  logged = [];
  console.error = (...args: unknown[]) => {
    const message = format(args);
    if (!ACT_SCOPE.test(message)) logged.push(message);
    consoleError(...args);
  };
});

afterEach(() => {
  console.error = consoleError;
  if (logged.length === 0) return;
  throw new Error(`The story logged errors:\n${logged.join('\n\n')}`);
});
