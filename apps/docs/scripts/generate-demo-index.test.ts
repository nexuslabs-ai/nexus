import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type DemoId, getDemo } from '../__generated__/demo-index';

import {
  collectDemos,
  EXAMPLES_DIR,
  GENERATED_DIR,
  generateDemoIndex,
  renderDemoBoundary,
  renderDemoIndex,
  renderDemoModule,
} from './generate-demo-index.mjs';

/** Quotes, a backslash, and a blank line — everything a naive emitter mangles. */
const NESTED_DEMO = `import { Button } from '@nexus_ds/react';

export default function WithFooter() {
  return <Button aria-label="say \\"hi\\"">Go</Button>;
}
`;

const SOURCE_LITERAL = /^export const source = (.*);$/m;

const DIRECTIVE = /^(['"])([^'"]*)\1;$/;

/**
 * The module's directive prologue, if it opens with one. Reads the first line
 * that is neither blank nor a `//` comment, so a module that merely quotes
 * `'use client'` further down — a demo source string, say — reads as having no
 * directive at all.
 */
function leadingDirective(module: string) {
  const first = module
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('//'));

  return first?.match(DIRECTIVE)?.[2];
}

/** Reads back the `source` literal a per-demo module exports. */
function emittedSource(moduleFile: string) {
  const literal = readFileSync(moduleFile, 'utf8')
    .replace(/\r\n/g, '\n')
    .match(SOURCE_LITERAL)?.[1];

  if (literal === undefined) {
    throw new Error(`No source literal in ${moduleFile}`);
  }

  return JSON.parse(literal) as string;
}

describe('generate-demo-index', () => {
  let workspace: string;
  let examplesDir: string;
  let outputDir: string;

  beforeEach(() => {
    workspace = mkdtempSync(path.join(tmpdir(), 'nexus-demo-index-'));
    examplesDir = path.join(workspace, 'examples');
    outputDir = path.join(workspace, '__generated__');

    mkdirSync(path.join(examplesDir, 'card'), { recursive: true });
    mkdirSync(path.join(examplesDir, '_private'), { recursive: true });
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
    writeFileSync(
      path.join(examplesDir, '_helpers.tsx'),
      'export const pad = 4;\n'
    );
    writeFileSync(
      path.join(examplesDir, '_private', 'thing.tsx'),
      'export const secret = 1;\n'
    );
  });

  afterEach(() => {
    rmSync(workspace, { recursive: true, force: true });
  });

  const run = () => generateDemoIndex({ examplesDir, outputDir });
  const moduleFor = (id: string) => path.join(outputDir, 'demos', `${id}.ts`);
  const boundaryFor = (id: string) =>
    path.join(outputDir, 'demos', `${id}.client.ts`);

  it('keys demos by their path under examples/, sorted, nested included', () => {
    expect(collectDemos(examplesDir).map((demo) => demo.id)).toEqual([
      'alpha-demo',
      'card/with-footer',
      'zebra-demo',
    ]);
  });

  it('collects only ids that resolve to a real .tsx on disk', () => {
    for (const demo of collectDemos(examplesDir)) {
      expect(existsSync(path.join(examplesDir, `${demo.id}.tsx`))).toBe(true);
    }
  });

  it('skips underscore-prefixed files and directories', () => {
    const ids = collectDemos(examplesDir).map((demo) => demo.id);

    expect(ids).not.toContain('_helpers');
    expect(ids).not.toContain('_private/thing');
  });

  it('carries each demo source in full, imports included', () => {
    const nested = collectDemos(examplesDir).find(
      (demo) => demo.id === 'card/with-footer'
    );

    expect(nested?.source).toBe(NESTED_DEMO);
  });

  it('emits a per-demo source literal that parses back to the file on disk', () => {
    run();

    expect(emittedSource(moduleFor('card/with-footer'))).toBe(NESTED_DEMO);
  });

  it('points each demo boundary at its own example', () => {
    run();

    expect(readFileSync(boundaryFor('card/with-footer'), 'utf8')).toContain(
      'export { default as Component } from "../../../examples/card/with-footer";'
    );
    expect(readFileSync(boundaryFor('zebra-demo'), 'utf8')).toContain(
      'export { default as Component } from "../../examples/zebra-demo";'
    );
  });

  it('puts the client directive on the boundary, not on the source module', () => {
    run();

    expect(
      leadingDirective(readFileSync(boundaryFor('card/with-footer'), 'utf8'))
    ).toBe('use client');
    expect(
      leadingDirective(readFileSync(moduleFor('card/with-footer'), 'utf8'))
    ).toBeUndefined();
  });

  it('keeps the examples free of framework directives', () => {
    for (const demo of collectDemos(EXAMPLES_DIR)) {
      expect(leadingDirective(demo.source)).toBeUndefined();
    }
  });

  it('forwards the component through the boundary beside the source', () => {
    run();
    const module = readFileSync(moduleFor('card/with-footer'), 'utf8');

    expect(module).toContain(
      'export { Component } from "./with-footer.client"'
    );
    expect(module).toContain('export const source =');
  });

  it('keeps demo sources out of the index, behind a lazy import', () => {
    const { index } = run();

    expect(index).toContain('load: () => import("./demos/card/with-footer")');
    expect(index).not.toContain('export default function WithFooter');
    expect(index).not.toContain('source: "');
  });

  it('writes an index to disk that a repeat run reproduces byte for byte', () => {
    run();
    const onDisk = readFileSync(path.join(outputDir, 'demo-index.ts'), 'utf8');

    expect(onDisk).toBe(run().index);
  });

  it('writes per-demo modules that a repeat run reproduces byte for byte', () => {
    const before = run().demos.flatMap((demo) =>
      [moduleFor(demo.id), boundaryFor(demo.id)].map((file) => ({
        file,
        bytes: readFileSync(file, 'utf8'),
      }))
    );

    expect(before.length).toBeGreaterThan(0);

    run();

    for (const { file, bytes } of before) {
      expect(readFileSync(file, 'utf8')).toBe(bytes);
    }
  });

  it('leaves an unchanged demo module alone on a repeat run', () => {
    run();
    const untouched = statSync(moduleFor('zebra-demo')).mtimeMs;

    writeFileSync(
      path.join(examplesDir, 'alpha-demo.tsx'),
      'export default function Alpha() {\n  return true;\n}\n'
    );
    run();

    expect(statSync(moduleFor('zebra-demo')).mtimeMs).toBe(untouched);
  });

  it('leaves a CRLF checkout of a generated module alone', () => {
    run();
    const module = moduleFor('zebra-demo');
    writeFileSync(module, readFileSync(module, 'utf8').replace(/\n/g, '\r\n'));

    run();

    expect(readFileSync(module, 'utf8')).toContain('\r\n');
  });

  it('picks up a new demo file with no hand-editing', () => {
    expect(run().index).not.toContain('badge-demo');

    writeFileSync(
      path.join(examplesDir, 'badge-demo.tsx'),
      'export default function Badge() {\n  return null;\n}\n'
    );

    expect(run().index).toContain('load: () => import("./demos/badge-demo")');
    expect(existsSync(moduleFor('badge-demo'))).toBe(true);
  });

  it('drops the generated module and boundary for a deleted demo', () => {
    run();
    expect(existsSync(moduleFor('zebra-demo'))).toBe(true);
    expect(existsSync(boundaryFor('zebra-demo'))).toBe(true);

    rmSync(path.join(examplesDir, 'zebra-demo.tsx'));
    run();

    expect(existsSync(moduleFor('zebra-demo'))).toBe(false);
    expect(existsSync(boundaryFor('zebra-demo'))).toBe(false);
  });

  it('prunes the directory an emptied nested demo leaves behind', () => {
    run();
    expect(existsSync(path.join(outputDir, 'demos', 'card'))).toBe(true);

    rmSync(path.join(examplesDir, 'card', 'with-footer.tsx'));
    run();

    expect(existsSync(path.join(outputDir, 'demos', 'card'))).toBe(false);
  });

  it('rejects a dotted id rather than letting it claim another demo’s boundary', () => {
    writeFileSync(
      path.join(examplesDir, 'zebra-demo.client.tsx'),
      'export default function Impostor() {\n  return null;\n}\n'
    );

    expect(() => collectDemos(examplesDir)).toThrow(/cannot contain a dot/);
  });

  it('names the missing directory instead of throwing a raw ENOENT', () => {
    expect(() => collectDemos(path.join(workspace, 'absent'))).toThrow(
      /Missing demo directory/
    );
  });

  it('emits a valid index when there are no demos', () => {
    expect(renderDemoIndex([])).toContain(
      'export const demos = {} satisfies Record<string, Demo>;'
    );
  });

  it('keeps the committed output in sync with apps/docs/examples/', () => {
    const committed = (file: string) =>
      readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const demos = collectDemos(EXAMPLES_DIR);

    expect(renderDemoIndex(demos)).toBe(
      committed(path.join(GENERATED_DIR, 'demo-index.ts'))
    );

    for (const demo of demos) {
      expect(renderDemoModule(demo)).toBe(
        committed(path.join(GENERATED_DIR, 'demos', `${demo.id}.ts`))
      );
      expect(renderDemoBoundary(demo)).toBe(
        committed(path.join(GENERATED_DIR, 'demos', `${demo.id}.client.ts`))
      );
    }
  });

  it('looks a demo up by id and throws on a miss', () => {
    const id: DemoId = 'badge-demo';

    expect(getDemo(id).id).toBe('badge-demo');
    expect(() => getDemo('no-such-demo')).toThrow(/Unknown demo id/);
  });

  it('throws for an inherited prototype key rather than returning it', () => {
    for (const key of ['toString', 'constructor', 'valueOf', '__proto__']) {
      expect(() => getDemo(key)).toThrow(/Unknown demo id/);
    }
  });

  it('keeps DemoId a literal union rather than a widened string', () => {
    // @ts-expect-error - fails to compile once DemoId widens to string.
    const invalid: DemoId = 'no-such-demo';

    expect(() => getDemo(invalid)).toThrow(/Unknown demo id/);
  });
});
