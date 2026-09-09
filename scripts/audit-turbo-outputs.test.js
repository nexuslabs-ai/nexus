import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  auditEmittedOutputs,
  auditTurboOutputs,
} from './audit-turbo-outputs.js';

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

function task(taskId, { command = 'build', outputs = [], directory } = {}) {
  return {
    taskId,
    command,
    directory: directory ?? taskId.split('#')[0],
    resolvedTaskDefinition: { outputs },
  };
}

function makeRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-turbo-outputs-'));
  tempDirs.push(dir);

  for (const [file, content] of Object.entries(files)) {
    const fullPath = path.join(dir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  return dir;
}

describe('auditTurboOutputs', () => {
  it('passes for the current repository', { timeout: 120_000 }, () => {
    expect(auditTurboOutputs()).toEqual({ ok: true, problems: [] });
  });

  it('throws when turbo reports no build tasks', () => {
    expect(() => auditTurboOutputs({ tasks: [] })).toThrow(
      /turbo reported no `build` tasks/
    );
  });

  it('accepts an empty task list when a filter selected nothing', () => {
    const result = auditTurboOutputs({
      tasks: [],
      turboArgs: ['--filter=...[origin/main]'],
    });

    expect(result).toEqual({ ok: true, problems: [] });
  });

  it('passes when every build-scripted package declares outputs', () => {
    const result = auditTurboOutputs({
      tasks: [
        task('@nexus_ds/core#build', { outputs: ['dist/runtime/**'] }),
        task('@nexus_ds/docs#build', {
          outputs: ['.next/**', '!.next/cache/**', 'next-env.d.ts'],
        }),
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.problems).toEqual([]);
  });

  it('flags a package that has a build script but no outputs', () => {
    const result = auditTurboOutputs({
      tasks: [task('@nexus_ds/future#build')],
    });

    expect(result.ok).toBe(false);
    expect(result.problems).toMatchObject([
      { code: 'missing-outputs', task: '@nexus_ds/future#build' },
    ]);
  });

  it('exempts packages with no build script', () => {
    const result = auditTurboOutputs({
      tasks: [task('@nexus_ds/tailwind#build', { command: '<NONEXISTENT>' })],
    });

    expect(result.ok).toBe(true);
  });

  it('reports every offending package, not just the first', () => {
    const result = auditTurboOutputs({
      tasks: [
        task('@nexus_ds/a#build'),
        task('@nexus_ds/b#build', { outputs: ['dist/**'] }),
        task('@nexus_ds/c#build'),
      ],
    });

    expect(result.problems.map((p) => p.task)).toEqual([
      '@nexus_ds/a#build',
      '@nexus_ds/c#build',
    ]);
  });
});

describe('auditEmittedOutputs', () => {
  it('passes when each declared glob has matching files on disk', () => {
    const repoRoot = makeRepo({
      'packages/core/dist/runtime/index.js': 'export {};\n',
      'apps/docs/.next/BUILD_ID': 'abc\n',
      'apps/docs/next-env.d.ts': '/// <reference types="next" />\n',
    });

    const result = auditEmittedOutputs({
      repoRoot,
      tasks: [
        task('@nexus_ds/core#build', {
          directory: 'packages/core',
          outputs: ['dist/runtime/**'],
        }),
        task('@nexus_ds/docs#build', {
          directory: 'apps/docs',
          outputs: ['.next/**', '!.next/cache/**', 'next-env.d.ts'],
        }),
      ],
    });

    expect(result).toEqual({ ok: true, problems: [] });
  });

  it('flags a glob that is deeper than what the build emitted', () => {
    const repoRoot = makeRepo({
      'packages/test-utils/dist/index.js': 'export {};\n',
    });

    const result = auditEmittedOutputs({
      repoRoot,
      tasks: [
        task('@nexus_ds/test-utils#build', {
          directory: 'packages/test-utils',
          outputs: ['dist/runtime/**'],
        }),
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.problems).toMatchObject([
      { code: 'unmatched-outputs', task: '@nexus_ds/test-utils#build' },
    ]);
  });

  it('flags an output directory that exists but is empty', () => {
    const repoRoot = makeRepo({ 'apps/console/README.md': '# console\n' });
    fs.mkdirSync(path.join(repoRoot, 'apps/console/dist'));

    const result = auditEmittedOutputs({
      repoRoot,
      tasks: [
        task('@nexus_ds/console#build', {
          directory: 'apps/console',
          outputs: ['dist/**'],
        }),
      ],
    });

    expect(result.ok).toBe(false);
  });

  it('ignores negated globs', () => {
    const repoRoot = makeRepo({ 'apps/docs/.next/BUILD_ID': 'abc\n' });

    const result = auditEmittedOutputs({
      repoRoot,
      tasks: [
        task('@nexus_ds/docs#build', {
          directory: 'apps/docs',
          outputs: ['.next/**', '!.next/cache/**'],
        }),
      ],
    });

    expect(result.ok).toBe(true);
  });

  it('exempts packages with no build script', () => {
    const repoRoot = makeRepo({ 'packages/tailwind/nexus.css': ':root {}\n' });

    const result = auditEmittedOutputs({
      repoRoot,
      tasks: [
        task('@nexus_ds/tailwind#build', {
          command: '<NONEXISTENT>',
          directory: 'packages/tailwind',
          outputs: ['dist/**'],
        }),
      ],
    });

    expect(result.ok).toBe(true);
  });

  it('throws when turbo reports no build tasks', () => {
    expect(() => auditEmittedOutputs({ tasks: [], repoRoot: '.' })).toThrow(
      /turbo reported no `build` tasks/
    );
  });
});
