import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CHART_CATEGORICAL_SERIES } from './chart';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.resolve(TEST_DIR, '../../../core/tokens/semantic');

function readCategoricalKeys(theme: 'light' | 'dark'): string[] {
  const file = path.join(TOKENS_DIR, `chart-categorical-default-${theme}.json`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    chart: { categorical: Record<string, unknown> };
  };
  return Object.keys(json.chart.categorical);
}

describe('CHART_CATEGORICAL_SERIES', () => {
  it('matches chart.categorical keys in the light JSON', () => {
    expect([...CHART_CATEGORICAL_SERIES]).toEqual(readCategoricalKeys('light'));
  });

  it('matches chart.categorical keys in the dark JSON', () => {
    expect([...CHART_CATEGORICAL_SERIES]).toEqual(readCategoricalKeys('dark'));
  });
});
