import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  buildManifest,
  deriveScope,
  discoverTokenChoices,
  parseExportArgs,
  prepareOutDir,
  rebrandContent,
  renderAppAppearanceExample,
  renderReadme,
  renderRootPackageJson,
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
  brandColor: [],
  radius: ['extra-round', 'round', 'smooth', 'square', 'subtle'],
  borderwidth: ['fine', 'normal', 'strong'],
  shadow: ['flat', 'quiet', 'soft', 'standard', 'strong'],
  motion: ['snappy'],
  spacingDefault: [
    'comfortable',
    'compact',
    'default',
    'relaxed',
    'spacious',
    'tight',
  ],
};

const DEFAULTS = {
  base: 'stone',
  brandColor: '#0a0a0a',
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
          brandColor: '#2563eb',
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

  it('rejects an unknown spacingDefault against discovered modes', () => {
    expect(() =>
      validateTokenConfig(
        { ...DEFAULTS, spacingDefault: 'roomy' },
        VALID_CHOICES
      )
    ).toThrow(/Invalid --spacingDefault="roomy"\. Valid values: .*default/);
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
    expect(config.tokenConfig.brandColor).toBe('#0a0a0a'); // default
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

  it('throws on an un-forked @nexus_ds/* dep in the produced manifest', () => {
    const withStray = {
      ...source,
      dependencies: {
        ...source.dependencies,
        '@nexus_ds/icons': 'workspace:*',
      },
    };
    expect(() =>
      transformReactPackageJson(withStray, {
        scope: '@examlly',
        coreVersion: '0.1.0',
        version: '0.1.0',
      })
    ).toThrow(/Unhandled @nexus_ds\/\* dependency.*@nexus_ds\/icons/);
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
    expect(scanInternalDeps(source, 'components/sidebar')).toEqual({
      components: ['overlay-layout'],
      lib: ['icons', 'utils'],
      hooks: [],
    });
  });

  it('strips block comments and does not treat :// URLs as line comments', () => {
    const source = [
      "import { cn } from '@/lib/utils';",
      '/*',
      " * import { Tooltip } from '@/components/tooltip';",
      ' */',
      "const docs = 'https://example.com/guide'; // see @/components/should-not-leak",
      "const cdn = 'https://x.io'; export { Button } from '@/components/button';",
      "import { useToast } from '@/hooks/use-toast';",
    ].join('\n');
    expect(scanInternalDeps(source, 'components/sidebar')).toEqual({
      components: ['button'],
      lib: ['utils'],
      hooks: ['use-toast'],
    });
  });

  it('buckets relative imports (the shape after the @/->relative migration)', () => {
    const source = [
      "import { cn } from '../../lib/utils';",
      "import { IconCheck } from '../../lib/icons';",
      "import { useIsNarrow } from '../../hooks/use-narrow';",
      "import { Button } from '../button';",
      "export { ButtonGroup } from '../button-group/button-group';",
      "import { part } from './internal-sibling';",
      "// import { Dead } from '../tooltip';",
    ].join('\n');
    expect(scanInternalDeps(source, 'components/sidebar')).toEqual({
      components: ['button', 'button-group'],
      lib: ['icons', 'utils'],
      hooks: ['use-narrow'],
    });
  });

  it('resolves against the file dir so intra-component (nested) imports do not leak', () => {
    // A file nested inside `appearance/` (a component with internal subdirs).
    const source = [
      "import { ColorField } from '../color-field';",
      "import { ConfigPreview } from '../config-preview';",
      "import { part } from './appearance-settings';",
      "import { Button } from '../../button';",
      "import { cn } from '../../../lib/utils';",
    ].join('\n');
    expect(
      scanInternalDeps(source, 'components/appearance/appearance-settings')
    ).toEqual({
      components: ['button'],
      lib: ['utils'],
      hooks: [],
    });
  });

  it('ignores bare bucket-root imports without minting a phantom component', () => {
    const source = [
      "import '../../lib';",
      "import { x } from '@/lib';",
      "export * from '@/hooks';",
      "import { Button } from '@/components';",
    ].join('\n');
    expect(scanInternalDeps(source, 'components/sidebar')).toEqual({
      components: [],
      lib: [],
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
  it('discovers base from appearance options and modes from primitive dirs', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-export-'));
    tempDirs.push(root);
    const tokensDir = path.join(root, 'packages', 'core', 'tokens');
    const semantic = path.join(tokensDir, 'semantic');
    const radiusDir = path.join(tokensDir, 'primitives', 'radius');
    const srcDir = path.join(root, 'packages', 'core', 'src', 'lib');
    fs.mkdirSync(semantic, { recursive: true });
    fs.mkdirSync(radiusDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'appearance-model.ts'),
      `export const BASE_TONE_OPTIONS = [
        { value: 'stone', label: 'Stone', color: '#78716c' },
        { value: 'slate', label: 'Slate', color: '#64748b' },
      ] as const;
`
    );
    for (const f of ['radius-square.json', 'radius-round.json']) {
      fs.writeFileSync(path.join(radiusDir, f), '{}');
    }
    for (const f of ['spacing-default.json', 'spacing-compact.json']) {
      fs.writeFileSync(path.join(semantic, f), '{}');
    }

    const choices = discoverTokenChoices(tokensDir);
    expect(choices.base).toEqual(['slate', 'stone']);
    expect(choices.brandColor).toEqual([]);
    expect(choices.radius).toEqual(['round', 'square']);
    expect(choices.spacingDefault).toEqual(['compact', 'default']);
  });
});

describe('renderRootPackageJson', () => {
  it('wires scripts, toolchain, eslint-plugin range, and overrides', () => {
    const pkg = renderRootPackageJson({
      name: 'acme-ds',
      scope: '@acme',
      eslintPluginVersion: '0.2.0',
      toolchain: { eslint: '^9.0.0', typescript: '^5.5.0' },
      overrides: { 'some-dep': '1.2.3' },
    });
    expect(pkg.name).toBe('acme-ds');
    expect(pkg.private).toBe(true);
    expect(pkg.devDependencies['@nexus_ds/eslint-plugin']).toBe('^0.2.0');
    expect(pkg.devDependencies.eslint).toBe('^9.0.0');
    expect(pkg.scripts.storybook).toBe('pnpm --filter @acme/react storybook');
    expect(pkg.scripts['build-storybook']).toBe(
      'pnpm --filter @acme/react build-storybook'
    );
    expect(pkg.pnpm.overrides).toEqual({ 'some-dep': '1.2.3' });
  });
});

describe('renderReadme', () => {
  it('documents both packages, the token table, and tailwind-before-react publish order', () => {
    const readme = renderReadme({
      name: 'acme-ds',
      scope: '@acme',
      tokenConfig: { ...DEFAULTS, base: 'slate' },
    });
    expect(readme).toContain('# acme-ds');
    expect(readme).toContain('`@acme/react`');
    expect(readme).toContain('`@acme/tailwind`');
    expect(readme).toContain('| `base` | `slate` |');
    expect(readme.indexOf('@acme/tailwind publish')).toBeLessThan(
      readme.indexOf('@acme/react publish')
    );
  });
});

describe('prepareOutDir', () => {
  // A real temp git repo: the guard is git behavior (check-ignore / ls-files).
  function initRepo() {
    const repoRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'nexus-export-repo-')
    );
    tempDirs.push(repoRoot);
    execFileSync('git', ['init', '-q'], { cwd: repoRoot });
    fs.writeFileSync(path.join(repoRoot, '.gitignore'), '.generated/\n');
    return repoRoot;
  }

  function tmpOutside() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-export-out-'));
    tempDirs.push(dir);
    return dir;
  }

  it('allows a git-ignored, untracked dir inside the repo and creates it', () => {
    const repoRoot = initRepo();
    const out = path.join(repoRoot, '.generated', 'acme');
    expect(prepareOutDir(out, false, { repoRoot, cwd: repoRoot })).toBe(out);
    expect(fs.existsSync(out)).toBe(true);
  });

  it('refuses a tracked path inside the repo', () => {
    const repoRoot = initRepo();
    fs.mkdirSync(path.join(repoRoot, 'packages'));
    fs.writeFileSync(path.join(repoRoot, 'packages', 'x.txt'), 'x');
    execFileSync('git', ['add', 'packages/x.txt'], { cwd: repoRoot });
    expect(() =>
      prepareOutDir(path.join(repoRoot, 'packages'), true, {
        repoRoot,
        cwd: repoRoot,
      })
    ).toThrow(/holds git-tracked files/);
  });

  it('refuses an ignored dir that still holds a force-added tracked file', () => {
    const repoRoot = initRepo();
    const out = path.join(repoRoot, '.generated', 'acme');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'keep.txt'), 'x');
    execFileSync('git', ['add', '-f', '.generated/acme/keep.txt'], {
      cwd: repoRoot,
    });
    expect(() => prepareOutDir(out, true, { repoRoot, cwd: repoRoot })).toThrow(
      /holds git-tracked files/
    );
  });

  it('refuses an untracked but non-ignored dir inside the repo', () => {
    const repoRoot = initRepo();
    expect(() =>
      prepareOutDir(path.join(repoRoot, 'packages', 'oops'), true, {
        repoRoot,
        cwd: repoRoot,
      })
    ).toThrow(/inside this repo but not git-ignored/);
  });

  it('refuses a path that contains the repo', () => {
    const repoRoot = initRepo();
    expect(() =>
      prepareOutDir(path.resolve(repoRoot, '..'), true, {
        repoRoot,
        cwd: repoRoot,
      })
    ).toThrow(/contains this repo/);
  });

  it('refuses to overwrite a non-empty dir that contains a nested .git', () => {
    const repoRoot = initRepo();
    const out = path.join(tmpOutside(), 'target');
    fs.mkdirSync(path.join(out, '.git'), { recursive: true });
    expect(() => prepareOutDir(out, true, { repoRoot, cwd: repoRoot })).toThrow(
      /contains a git repository/
    );
  });

  it('requires --force to overwrite a non-empty target', () => {
    const repoRoot = initRepo();
    const out = path.join(tmpOutside(), 'target');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'stale.txt'), 'x');
    expect(() =>
      prepareOutDir(out, false, { repoRoot, cwd: repoRoot })
    ).toThrow(/Pass --force to overwrite/);
    expect(prepareOutDir(out, true, { repoRoot, cwd: repoRoot })).toBe(out);
    expect(fs.readdirSync(out)).toHaveLength(0);
  });
});
