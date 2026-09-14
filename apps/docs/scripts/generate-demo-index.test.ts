import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  collectDemos,
  EXAMPLES_DIR,
  generateDemoIndex,
  OUTPUT_FILE,
  renderDemoIndex,
} from './generate-demo-index.mjs';

/** Quotes, a backslash, and a blank line — everything a naive emitter mangles. */
const NESTED_DEMO = `import { Button } from '@nexus_ds/react';

export default function WithFooter() {
  return <Button aria-label="say \\"hi\\"">Go</Button>;
}
`;

const SOURCE_PREFIX = '    source: ';

/** Reads back the emitted source literal for one demo id. */
function sourceLiteralFor(output: string, id: string) {
  const lines = output.split('\n');
  const start = lines.indexOf(`  ${JSON.stringify(id)}: {`);
  const line = lines.slice(start).find((l) => l.startsWith(SOURCE_PREFIX));
  return line?.slice(SOURCE_PREFIX.length, -1) ?? '';
}

describe('generate-demo-index', () => {
  let examplesDir: string;
  let outputFile: string;

  beforeEach(() => {
    const workspace = mkdtempSync(path.join(tmpdir(), 'nexus-demo-index-'));
    examplesDir = path.join(workspace, 'examples');
    outputFile = path.join(workspace, '__generated__', 'demo-index.ts');

    mkdirSync(path.join(examplesDir, 'card'), { recursive: true });
    writeFileSync(
      path.join(examplesDir, 'zebra-demo.tsx'),
      'export default function Zebra() {\n  return null;\n}\n'
    );
    writeFileSync(
      path.join(examplesDir, 'alpha-demo.tsx'),
      'export default function Alpha() {\n  return null;\n}\n'
    );
    writeFileSync(
      path.join(examplesDir, 'card', 'with-footer.tsx'),
      NESTED_DEMO
    );
    writeFileSync(path.join(examplesDir, 'notes.md'), 'not a demo\n');
  });

  afterEach(() => {
    rmSync(path.dirname(examplesDir), { recursive: true, force: true });
  });

  const run = () => generateDemoIndex({ examplesDir, outputFile });

  it('keys demos by their path under examples/, sorted, nested included', () => {
    expect(collectDemos(examplesDir).map((demo) => demo.id)).toEqual([
      'alpha-demo',
      'card/with-footer',
      'zebra-demo',
    ]);
  });

  it('skips files that are not demo modules', () => {
    const files = collectDemos(examplesDir).map((demo) => demo.file);

    expect(files).not.toContain('apps/docs/examples/notes.md');
  });

  it('carries each demo source in full, imports included', () => {
    const nested = collectDemos(examplesDir).find(
      (demo) => demo.id === 'card/with-footer'
    );

    expect(nested?.source).toBe(NESTED_DEMO);
  });

  it('emits a source literal that parses back to the file on disk', () => {
    const literal = sourceLiteralFor(run().output, 'card/with-footer');

    expect(JSON.parse(literal)).toBe(NESTED_DEMO);
  });

  it('points each entry at a lazy import of its module', () => {
    expect(run().output).toContain(
      'load: () => import("../examples/card/with-footer")'
    );
  });

  it('produces byte-identical output on repeat runs', () => {
    expect(run().output).toBe(run().output);
  });

  it('picks up a new demo file with no hand-editing', () => {
    const before = run().output;
    writeFileSync(
      path.join(examplesDir, 'badge-demo.tsx'),
      'export default function Badge() {\n  return null;\n}\n'
    );

    expect(before).not.toContain('badge-demo');
    expect(run().output).toContain(
      'load: () => import("../examples/badge-demo")'
    );
  });

  it('emits a valid index when there are no demos', () => {
    expect(renderDemoIndex([])).toContain(
      'export const demos = {} satisfies Record<string, Demo>;'
    );
  });

  it('keeps the committed index in sync with apps/docs/examples/', () => {
    const committed = readFileSync(OUTPUT_FILE, 'utf8').replace(/\r\n/g, '\n');

    expect(renderDemoIndex(collectDemos(EXAMPLES_DIR))).toBe(committed);
  });
});
