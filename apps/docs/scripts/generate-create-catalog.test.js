// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';

import { generateCreateCatalog } from './generate-create-catalog.mjs';

it('regenerates additions, edits, removals and variants, replacing invalid sources with an error', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nexus-docs-catalog-'));
  const tokensDir = path.join(root, 'tokens');
  const output = path.join(root, 'generated');
  const fixture = path.join(tokensDir, 'semantic/catalog-study.json');
  const options = { tokensDir, output, gallery: false, development: true };
  async function generate() {
    await generateCreateCatalog(options);
    return JSON.parse(
      await fs.readFile(path.join(output, 'catalog.json'), 'utf8')
    );
  }
  try {
    await fs.cp('packages/core/tokens', tokensDir, { recursive: true });
    await fs.writeFile(
      fixture,
      JSON.stringify({ caption: { $type: 'string', $value: 'First' } })
    );
    expect(JSON.stringify(await generate())).toContain('First');
    await fs.writeFile(
      fixture,
      JSON.stringify({ caption: { $type: 'string', $value: 'Updated' } })
    );
    expect(JSON.stringify(await generate())).toContain('Updated');
    await fs.writeFile(fixture, '{ invalid');
    expect(await generate()).toMatchObject({ status: 'error' });
    await expect(
      generateCreateCatalog({ ...options, development: false })
    ).rejects.toThrow();
    await fs.rm(fixture);
    const restored = await generate();
    expect(restored.status).toBe('ready');
    expect(JSON.stringify(restored)).not.toContain('catalog-study.caption');
    const radius = path.join(tokensDir, 'primitives/radius');
    await fs.copyFile(
      path.join(radius, 'radius-smooth.json'),
      path.join(radius, 'radius-study.json')
    );
    expect(JSON.stringify(await generate())).toContain('radius-study.json');
    await fs.rename(
      path.join(radius, 'radius-study.json'),
      path.join(radius, 'radius-renamed.json')
    );
    const renamed = JSON.stringify(await generate());
    expect(renamed).toContain('radius-renamed.json');
    expect(renamed).not.toContain('radius-study.json');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}, 45000);
