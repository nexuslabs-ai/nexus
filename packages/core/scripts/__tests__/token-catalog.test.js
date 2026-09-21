// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import * as engine from '../../src/index';
import { generateTailwindArtifacts } from '../generate-tailwind-package.js';
import { generateTokenCatalog } from '../token-catalog.js';
import { collectTokenSources, resolveTokenSources } from '../token-sources.js';
import { DEFAULT_CONFIG } from '../utils.js';

const repo = fileURLToPath(new URL('../../../../', import.meta.url));
const tokensDir = path.join(repo, 'packages/core/tokens');
let result;
const tempDirs = [];
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-catalog-'));
  fs.cpSync(tokensDir, dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
function write(dir, file, data) {
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data));
}
function record(id) {
  return result.catalog.records.find((token) => token.id === id);
}
function emissions(token) {
  return result.catalog.emissions.filter((item) =>
    token.emissions.includes(item.id)
  );
}

beforeAll(async () => {
  result = await generateTokenCatalog({ engine });
});
afterAll(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
});

describe('complete production token catalog', () => {
  it('accounts for every source leaf independently of generator inventory and every runtime entry', () => {
    const leaves = [];
    function walk(value, file, segments = []) {
      if (!value || typeof value !== 'object') return;
      if (Object.hasOwn(value, '$value')) {
        leaves.push(`${file}:${segments.join('.')}`);
        return;
      }
      for (const [key, item] of Object.entries(value))
        if (!key.startsWith('$')) walk(item, file, [...segments, key]);
    }
    const files = fs
      .readdirSync(tokensDir, { recursive: true })
      .filter((file) => file.endsWith('.json'));
    for (const file of files)
      walk(
        JSON.parse(fs.readFileSync(path.join(tokensDir, file), 'utf8')),
        file
      );
    const authored = result.catalog.records.filter(
      (token) => token.namespace !== 'runtime'
    );
    expect(
      authored.map((token) => `${token.file}:${token.path.join('.')}`).sort()
    ).toEqual(leaves.sort());
    expect(new Set(authored.map((token) => token.id)).size).toBe(leaves.length);
    expect(result.catalog.counts).toMatchObject({
      authoredLeaves: leaves.length,
      authoredFiles: files.length,
    });
    for (const meta of engine.SEMANTIC_TOKEN_REGISTRY) {
      for (const mode of ['light', 'dark']) {
        expect(record(`runtime:color:${meta.name}@${mode}`)).toMatchObject({
          rawValue: null,
          resolvedValue:
            result.inspection.theme[mode][`--nx-color-${meta.name}`],
        });
      }
    }
  });

  it('preserves typed composites, reference paths, and production-only typography normalization', () => {
    const typography = record('styles:typography:code.inline@base:all');
    expect(typography.rawValue.lineHeight).toBe('auto');
    expect(typography.resolvedValue.lineHeight).toBe('auto');
    expect(typography.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'fontFamily',
          reference: 'family.font-mono',
        }),
      ])
    );
    expect(emissions(typography)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'line-height',
          value: 'normal',
          utility: 'nx:typography-code-inline',
        }),
      ])
    );
    const shadow = record('styles:shadows:sm@base:all');
    expect(shadow.resolvedValue).toHaveLength(2);
    expect(shadow.resolvedValue[0].offsetX).toEqual({ value: 0, unit: 'px' });
    expect(shadow.references).toHaveLength(10);
    expect(emissions(shadow)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: '--shadow-sm',
          kind: 'theme',
          value: expect.stringContaining('var(--nx-shadow-sm-layer-2-x)'),
        }),
      ])
    );
  });

  it('keeps mode values and selector provenance distinct even when values are equal', () => {
    for (const token of result.catalog.records.filter(
      (item) => item.family === 'radius'
    )) {
      const declarations = emissions(token);
      expect(
        declarations.some((item) =>
          item.context.includes(`data-radius='${token.mode}'`)
        )
      ).toBe(true);
      expect(
        declarations.every(
          (item) =>
            !item.context.includes('data-radius=') ||
            item.context.includes(`data-radius='${token.mode}'`)
        )
      ).toBe(true);
    }
    const darkShadow = result.catalog.records.find(
      (item) => item.family === 'shadow' && item.variant === 'dark'
    );
    expect(
      emissions(darkShadow).every((item) => item.context.includes('.dark'))
    ).toBe(true);
  });

  it('reports exact package declarations, aliases, and available utility definitions', async () => {
    const generated = await generateTailwindArtifacts(DEFAULT_CONFIG, {
      engine,
    });
    expect(result.css).toEqual(generated.files);
    for (const [file, css] of Object.entries(result.css)) {
      expect(css).toBe(
        fs.readFileSync(path.join(repo, 'packages/tailwind', file), 'utf8')
      );
    }
    const primary = record('runtime:color:primary-background@light');
    expect(emissions(primary).map((item) => item.context)).toEqual([
      '@theme inline',
      ':root',
    ]);
    expect(primary.themeExamples).toContain('nx:bg-primary-background');
    expect(
      record('primitives:borderwidth:default@normal:all').utilityDefinitions
    ).toContain('nx:border-l-default');
    expect(result.catalog.build.boundary).toContain('not proof');
  });

  it('compiles representative capabilities from the exact catalog artifacts', async () => {
    const tailwindEntry = fileURLToPath(
      import.meta.resolve('tailwindcss/index.css')
    );
    const candidates = [
      'nx:bg-primary-background',
      'nx:typography-code-inline',
      'nx:p-4',
      'nx:rounded-md',
      'nx:shadow-sm',
      'nx:border-l-default',
      'nx:duration-fast',
    ];
    const compiler = await compile(
      `@import './nexus.css';\n@source inline("${candidates.join(' ')}");`,
      {
        base: '/catalog',
        loadStylesheet: async (id) => ({
          content:
            id === 'tailwindcss'
              ? fs.readFileSync(tailwindEntry, 'utf8')
              : result.css[path.basename(id)],
          base: '/catalog',
          path: id,
        }),
      }
    );
    const compiled = compiler.build([]);
    for (const candidate of candidates)
      expect(compiled).toContain(`.${candidate.replaceAll(':', '\\:')}`);
    expect(compiled).toContain('line-height: normal');
  });

  it('keeps dirty source provenance honest and all source paths relative', () => {
    expect(
      result.catalog.sources.every((source) => !path.isAbsolute(source.path))
    ).toBe(true);
    for (const source of result.catalog.sources) {
      expect(source.hash).toMatch(/^[a-f0-9]{64}$/);
      if (source.url)
        expect(source.url).toContain(`/blob/${result.catalog.build.revision}/`);
      if (!source.committed) expect(source.url).toBeNull();
    }
  });

  it('includes unsupported authored leaves with an explicit non-emission reason', async () => {
    const dir = fixture();
    write(dir, 'semantic/annotation.json', {
      caption: { $type: 'string', $value: 'Build annotation' },
    });
    const catalog = (await generateTokenCatalog({ engine, tokensDir: dir }))
      .catalog;
    expect(
      catalog.records.find(
        (item) => item.logicalId === 'semantic:annotation:caption'
      )
    ).toMatchObject({
      rawValue: 'Build annotation',
      emissions: [],
      notEmittedReason: expect.stringContaining('no emission'),
    });
  });

  it('discovers added and renamed modes, removes deleted leaves, and changes content hashes on edits', async () => {
    const dir = fixture();
    const original = JSON.parse(
      fs.readFileSync(
        path.join(dir, 'primitives/radius/radius-smooth.json'),
        'utf8'
      )
    );
    write(dir, 'primitives/radius/radius-study.json', original);
    const added = await generateTokenCatalog({ engine, tokensDir: dir });
    expect(added.catalog.records.some((item) => item.mode === 'study')).toBe(
      true
    );
    fs.renameSync(
      path.join(dir, 'primitives/radius/radius-study.json'),
      path.join(dir, 'primitives/radius/radius-notebook.json')
    );
    const renamed = await generateTokenCatalog({ engine, tokensDir: dir });
    expect(renamed.catalog.records.some((item) => item.mode === 'study')).toBe(
      false
    );
    expect(
      renamed.catalog.records.some((item) => item.mode === 'notebook')
    ).toBe(true);
    expect(renamed.catalog.build.contentHash).not.toBe(
      added.catalog.build.contentHash
    );
    fs.rmSync(path.join(dir, 'primitives/radius/radius-notebook.json'));
    const removed = await generateTokenCatalog({ engine, tokensDir: dir });
    expect(
      removed.catalog.records.some((item) => item.mode === 'notebook')
    ).toBe(false);
  });

  it('resolves multi-hop aliases and inherited types, and rejects cycles or missing references in production too', async () => {
    const dir = fixture();
    write(dir, 'primitives/inset.json', {
      $type: 'dimension',
      small: { $value: { value: 4, unit: 'px' } },
      medium: { $value: '{inset.small}' },
      control: { $value: '{inset.medium}' },
    });
    let sources = resolveTokenSources(collectTokenSources(dir));
    const inset = sources.find(
      (item) => item.path[0] === 'control' && item.family === 'inset'
    );
    expect(inset.resolvedValue).toEqual({ value: 4, unit: 'px' });
    expect(inset.references.map((item) => item.reference)).toEqual([
      'inset.medium',
      'inset.small',
    ]);
    write(dir, 'primitives/inset.json', {
      $type: 'dimension',
      small: { $value: '{inset.medium}' },
      medium: { $value: '{inset.small}' },
    });
    await expect(
      generateTailwindArtifacts(DEFAULT_CONFIG, { engine, tokensDir: dir })
    ).rejects.toThrow('Reference cycle');
    write(dir, 'primitives/inset.json', {
      $type: 'dimension',
      small: { $value: '{inset.missing}' },
    });
    await expect(
      generateTailwindArtifacts(DEFAULT_CONFIG, { engine, tokensDir: dir })
    ).rejects.toThrow('Unresolved reference');
  });
});
