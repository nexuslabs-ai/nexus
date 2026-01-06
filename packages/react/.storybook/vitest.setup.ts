// packages/react/.storybook/vitest.setup.ts
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react';
import { beforeAll } from 'vitest';

import * as projectAnnotations from './preview';

// Set up project annotations for Vitest
// setProjectAnnotations from @storybook/react already includes React renderer internally
const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

beforeAll(annotations.beforeAll);
