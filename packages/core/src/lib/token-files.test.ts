import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

import { TOKEN_FILES } from '../catalogue/token-files';

const TOKENS_DIR = resolve(process.cwd(), 'packages/core/tokens');

function tokenFilesOnDisk(): string[] {
  return readdirSync(TOKENS_DIR, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.split(sep).join('/'))
    .sort();
}

describe('token file manifest', () => {
  it('statically imports every JSON file under tokens/', () => {
    expect(Object.keys(TOKEN_FILES).sort()).toEqual(tokenFilesOnDisk());
  });

  it('keys each document by the file it was imported from', () => {
    for (const [file, document] of Object.entries(TOKEN_FILES)) {
      expect(document, file).toEqual(
        JSON.parse(readFileSync(join(TOKENS_DIR, file), 'utf8'))
      );
    }
  });
});
