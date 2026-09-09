import { describe, expect, it } from 'vitest';

import { auditTurboOutputs } from './audit-turbo-outputs.js';

function task(taskId, { command = 'build', outputs = [] } = {}) {
  return { taskId, command, resolvedTaskDefinition: { outputs } };
}

describe('auditTurboOutputs', () => {
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
