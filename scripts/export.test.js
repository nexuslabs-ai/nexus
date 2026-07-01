import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  buildManifest,
  deriveScope,
  discoverTokenChoices,
  parseExportArgs,
  rebrandContent,
  renderAppAppearanceExample,
  scanInternalDeps,
  transformReactPackageJson,
  transformTailwindPackageJson,
  validateTokenConfig,
} from './export.mjs';

const tempDirs = [];
afterEach(() => {
  while (tempDirs.length) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

const VALID_CHOICES = {
  base: ['gray', 'neutral', 'slate', 'stone', 'zinc'],
  brand: ['black', 'blue', 'orange', 'pink', 'purple', 'teal'],
  radius: ['extra-round', 'round', 'smooth', 'square', 'subtle'],
  borderwidth: ['fine', 'normal', 'strong'],
  shadow: ['flat', 'quiet', 'soft', 'standard', 'strong'],
  motion: ['snappy'],
  spacingDefault: [],
};

const DEFAULTS = {
  base: 'stone',
  brand: 'black',
  radius: 'square',
  borderwidth: 'normal',
  shadow: 'quiet',
  motion: 'snappy',
  spacingDefault: 'default',
};

describe('deriveScope', () => {
  it('derives scope from the first segment of the name', () => {
    expect(deriveScope('examlly-design-system')).toBe('@examlly');
    expect(deriveScope('acme_ui')).toBe('@acme');
  });

  it('honors an explicit scope', () => {
    expect(deriveScope('anything', '@custom')).toBe('@custom');
  });

  it('rejects an explicit scope without a leading @', () => {
    expect(() => deriveScope('x', 'custom')).toThrow('must start with "@"');
  });
});

describe('validateTokenConfig', () => {
  it('passes valid values', () => {
    expect(() =>
      validateTokenConfig(
        {
          base: 'slate',
          brand: 'blue',
          radius: 'square',
          borderwidth: 'normal',
          shadow: 'quiet',
          motion: 'snappy',
          spacingDefault: 'default',
        },
        VALID_CHOICES
      )
    ).not.toThrow();
  });

  it('rejects an unknown value and lists valid ones', () => {
    expect(() =>
      validateTokenConfig({ ...DEFAULTS, radius: 'octagon' }, VALID_CHOICES)
    ).toThrow(/Invalid --radius="octagon"\. Valid values: .*square/);
  });
});

describe('parseExportArgs', () => {
  it('parses name, derives scope, applies defaults and token overrides', () => {
    const config = parseExportArgs(
      ['--name=examlly-design-system', '--base=slate', '--radius=square'],
      { validChoices: VALID_CHOICES }
    );
    expect(config).toMatchObject({
      name: 'examlly-design-system',
      scope: '@examlly',
      policy: 'user',
      version: '0.1.0',
      out: path.join('..', 'examlly-design-system'),
      force: false,
    });
    expect(config.tokenConfig.base).toBe('slate');
    expect(config.tokenConfig.brand).toBe('black'); // default
  });

  it('requires --name', () => {
    expect(() => parseExportArgs(['--base=slate'])).toThrow(
      'Missing required --name'
    );
  });

  it('validates token values against the injected choices', () => {
    expect(() =>
      parseExportArgs(['--name=x', '--base=chartreuse'], {
        validChoices: VALID_CHOICES,
      })
    ).toThrow(/Invalid --base="chartreuse"/);
  });

  it('rejects an unknown policy', () => {
    expect(() =>
      parseExportArgs(['--name=x', '--policy=whatever'], {
        validChoices: VALID_CHOICES,
      })
    ).toThrow(/Invalid --policy="whatever"/);
  });

  it('honors --force and an explicit --scope/--out/--version', () => {
    const config = parseExportArgs(
      [
        '--name=x',
        '--scope=@acme',
        '--out=/tmp/out',
        '--version=2.0.0',
        '--force',
      ],
      { validChoices: VALID_CHOICES }
    );
    expect(config).toMatchObject({
      scope: '@acme',
      out: '/tmp/out',
      version: '2.0.0',
      force: true,
    });
  });
});

describe('rebrandContent', () => {
  it('renames only the two forked packages, across file types', () => {
    const source = [
      "import { Button } from '@nexus_ds/react';",
      "import { X } from '@nexus_ds/react/appearance';",
      "@reference '@nexus_ds/tailwind';",
      "@import '@nexus_ds/tailwind';",
    ].join('\n');
    const out = rebrandContent(source, '@examlly');
    expect(out).toContain("'@examlly/react'");
    expect(out).toContain("'@examlly/react/appearance'");
    expect(out).toContain("@reference '@examlly/tailwind'");
    expect(out).toContain("@import '@examlly/tailwind'");
    expect(out).not.toContain('@nexus_ds/react');
    expect(out).not.toContain('@nexus_ds/tailwind');
  });

  it('preserves upstream deps, the eslint-disable directive, and the nx prefix', () => {
    const source = [
      "import { DEFAULT } from '@nexus_ds/core';",
      "import { nexusComponentConfig } from '@nexus_ds/eslint-plugin/config';",
      '/* eslint-disable @nexus_ds/no-render-prop-types */',
      "const cls = 'nx:bg-primary-background';",
      'style: { "--nx-color-x": "red" }',
    ].join('\n');
    expect(rebrandContent(source, '@examlly')).toBe(source);
  });
});

describe('transformReactPackageJson', () => {
  const source = {
    name: '@nexus_ds/react',
    version: '0.0.2',
    private: true,
    '//': ['internal note'],
    dependencies: {
      '@nexus_ds/core': 'workspace:*',
      '@nexus_ds/tailwind': 'workspace:*',
      '@radix-ui/react-select': '^2.2.6',
    },
    files: ['dist'],
  };

  it('rebrands, pins core, repoints tailwind, and makes it publishable', () => {
    const out = transformReactPackageJson(source, {
      scope: '@examlly',
      coreVersion: '0.1.0',
      version: '0.1.0',
    });
    expect(out.name).toBe('@examlly/react');
    expect(out.version).toBe('0.1.0');
    expect(out.private).toBeUndefined();
    expect(out['//']).toBeUndefined();
    expect(out.publishConfig).toEqual({ access: 'public' });
    expect(out.dependencies['@nexus_ds/core']).toBe('^0.1.0');
    expect(out.dependencies['@nexus_ds/tailwind']).toBeUndefined();
    expect(out.dependencies['@examlly/tailwind']).toBe('workspace:*');
    expect(out.dependencies['@radix-ui/react-select']).toBe('^2.2.6');
    expect(out.files).toEqual(['dist']);
  });

  it('does not mutate the input', () => {
    transformReactPackageJson(source, {
      scope: '@x',
      coreVersion: '0.1.0',
      version: '0.1.0',
    });
    expect(source.name).toBe('@nexus_ds/react');
    expect(source.private).toBe(true);
  });
});

describe('transformTailwindPackageJson', () => {
  it('rebrands and makes it publishable while keeping exports', () => {
    const out = transformTailwindPackageJson(
      {
        name: '@nexus_ds/tailwind',
        version: '0.0.1',
        private: true,
        exports: { '.': './nexus.css' },
        files: ['*.css'],
      },
      { scope: '@examlly', version: '0.1.0' }
    );
    expect(out.name).toBe('@examlly/tailwind');
    expect(out.version).toBe('0.1.0');
    expect(out.private).toBeUndefined();
    expect(out.publishConfig).toEqual({ access: 'public' });
    expect(out.exports).toEqual({ '.': './nexus.css' });
    expect(out.files).toEqual(['*.css']);
  });
});

describe('scanInternalDeps', () => {
  it('buckets @/ imports and ignores commented lines', () => {
    const source = [
      "import { popoverSurfaceClassName } from '@/components/overlay-layout/overlay-layout';",
      "import { IconCheck } from '@/lib/icons';",
      "import { cn } from '@/lib/utils';",
      "// import { useIsNarrow } from '@/hooks/use-narrow';",
    ].join('\n');
    expect(scanInternalDeps(source)).toEqual({
      components: ['overlay-layout'],
      lib: ['icons', 'utils'],
      hooks: [],
    });
  });
});

describe('buildManifest', () => {
  it('sorts components and records files + deps', () => {
    const manifest = buildManifest(
      [
        {
          name: 'select',
          files: ['select.tsx'],
          deps: {
            components: ['overlay-layout'],
            lib: ['icons', 'utils'],
            hooks: [],
          },
        },
        {
          name: 'button',
          files: ['button.tsx'],
          deps: {
            components: ['button-group', 'spinner'],
            lib: ['utils'],
            hooks: [],
          },
        },
      ],
      { version: '0.1.0' }
    );
    expect(Object.keys(manifest.components)).toEqual(['button', 'select']);
    expect(manifest.version).toBe('0.1.0');
    expect(manifest.components.select.deps.lib).toEqual(['icons', 'utils']);
  });
});

describe('renderAppAppearanceExample', () => {
  it('emits the real knobs for each policy from the published subentry', () => {
    const locked = renderAppAppearanceExample('@examlly', 'locked');
    expect(locked).toContain("from '@examlly/react/appearance'");
    expect(locked).toContain('storageKey: false');
    expect(locked).toContain('cookieWriteKey: false');

    expect(renderAppAppearanceExample('@examlly', 'user')).toContain(
      'storageKey: "nexus-appearance"'
    );
    expect(renderAppAppearanceExample('@examlly', 'tenant')).toContain(
      'cookieWriteKey: "nexus-appearance"'
    );
  });
});

describe('discoverTokenChoices', () => {
  it('discovers base/brand from semantic files and modes from primitive dirs', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-export-'));
    tempDirs.push(root);
    const semantic = path.join(root, 'semantic');
    const radiusDir = path.join(root, 'primitives', 'radius');
    fs.mkdirSync(semantic, { recursive: true });
    fs.mkdirSync(radiusDir, { recursive: true });
    for (const f of [
      'base-slate-light.json',
      'base-slate-dark.json',
      'base-stone-light.json',
      'brands-blue-light.json',
    ]) {
      fs.writeFileSync(path.join(semantic, f), '{}');
    }
    for (const f of ['radius-square.json', 'radius-round.json']) {
      fs.writeFileSync(path.join(radiusDir, f), '{}');
    }

    const choices = discoverTokenChoices(root);
    expect(choices.base).toEqual(['slate', 'stone']);
    expect(choices.brand).toEqual(['blue']);
    expect(choices.radius).toEqual(['round', 'square']);
  });
});
