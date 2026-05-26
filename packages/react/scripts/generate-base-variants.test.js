import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REACT_ROOT = path.resolve(__dirname, '..');
const GENERATED_DIR = path.join(REACT_ROOT, 'src', 'components', '__generated__');

describe('generate-base-variants', () => {
  it('resolves primitive entries via sourceDir', () => {
    execFileSync(process.execPath, ['scripts/generate-base-variants.mjs'], {
      cwd: REACT_ROOT,
      stdio: 'pipe',
    });

    const showStory = fs.readFileSync(
      path.join(GENERATED_DIR, 'Show.base-variants.stories.tsx'),
      'utf8'
    );
    const hideStory = fs.readFileSync(
      path.join(GENERATED_DIR, 'Hide.base-variants.stories.tsx'),
      'utf8'
    );

    expect(showStory).toContain("from '../primitives/Show.stories'");
    expect(hideStory).toContain("from '../primitives/Hide.stories'");
  });
});
