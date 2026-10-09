// packages/react/.storybook/vitest.setup.ts
import { DENSITY_OPTIONS } from '@nexus_ds/core';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react';
import { beforeAll } from 'vitest';

import * as projectAnnotations from './preview';

const density = import.meta.env.VITE_NEXUS_TEST_DENSITY;
if (density && !DENSITY_OPTIONS.some((option) => option.value === density)) {
  throw new Error(`Unknown test density: ${density}`);
}

// Set up project annotations for Vitest
// setProjectAnnotations from @storybook/react already includes React renderer internally
const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
  ...(density ? [{ initialGlobals: { density } }] : []),
]);

beforeAll(annotations.beforeAll);
