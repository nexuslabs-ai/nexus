import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentsDir = path.resolve(
  process.cwd(),
  'packages/react/src/components'
);

function componentSources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return componentSources(entryPath);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.(stories|test)\./.test(entry.name)) return [];
    return [entryPath];
  });
}

describe('rounded-base consumers', () => {
  it('only Button consumes --nx-radius-base, matching the documented override scope', () => {
    const consumers = componentSources(componentsDir)
      .filter((file) =>
        /rounded(?:-[a-z]{1,2})?-base\b|radius-base/.test(
          fs.readFileSync(file, 'utf8')
        )
      )
      .map((file) => path.relative(componentsDir, file));

    expect(consumers).toEqual(['button/button.tsx']);
  });
});
