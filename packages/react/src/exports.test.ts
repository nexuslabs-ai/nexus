import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '..', 'dist');

describe('@nexus/react package exports', () => {
  it.skipIf(!existsSync(distDir))(
    'resolves "./styles.css" via the package exports map to an existing file',
    () => {
      const require = createRequire(import.meta.url);
      const resolved = require.resolve('@nexus/react/styles.css');
      expect(existsSync(resolved)).toBe(true);
    }
  );
});
