import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  auditComponent,
  detectAsChild,
  detectAsChildUsage,
  detectFnSpy,
  detectInteractiveFromComponent,
  extractCvaEnums,
  findCallExpressionArgs,
  findComponentFile,
  findObjectKey,
  findStoriesFile,
  findStoryExports,
  findUnknownFlags,
  listAllComponents,
  matchBracket,
  parseArgs,
  parseObjectKeys,
  showcaseNameFor,
  storyExercises,
} from './audit-storybook-coverage.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_ROOT = path.resolve(__dirname, '..', 'src', 'components');

describe('parseArgs', () => {
  it('parses --component <name>', () => {
    expect(parseArgs(['--component', 'button'])).toMatchObject({
      component: 'button',
      all: false,
      json: false,
    });
  });

  it('parses --component=<name>', () => {
    expect(parseArgs(['--component=button'])).toMatchObject({
      component: 'button',
    });
  });

  it('parses --all and --json as booleans', () => {
    expect(parseArgs(['--all', '--json'])).toMatchObject({
      all: true,
      json: true,
    });
  });

  it('detects unknown flags', () => {
    expect(findUnknownFlags(parseArgs(['--bogus', 'x']))).toEqual(['bogus']);
  });
});

describe('matchBracket', () => {
  it('matches a balanced pair', () => {
    expect(matchBracket('{a}', 0, '{', '}')).toBe(2);
  });

  it('skips strings containing the close bracket', () => {
    expect(matchBracket('{"}"}', 0, '{', '}')).toBe(4);
  });

  it('skips line comments', () => {
    expect(matchBracket('{a // }\n}', 0, '{', '}')).toBe(8);
  });

  it('skips block comments', () => {
    expect(matchBracket('{/* } */ }', 0, '{', '}')).toBe(9);
  });

  it('skips template literals with ${...}', () => {
    expect(matchBracket('{`${x}`}', 0, '{', '}')).toBe(7);
  });

  it('returns -1 when unmatched', () => {
    expect(matchBracket('{a', 0, '{', '}')).toBe(-1);
  });
});

describe('findCallExpressionArgs', () => {
  it('finds a single cva call', () => {
    const src = 'const v = cva("base", { variants: {} });';
    const calls = findCallExpressionArgs(src, 'cva');
    expect(calls).toHaveLength(1);
    expect(src[calls[0].start]).toBe('(');
    expect(src[calls[0].end]).toBe(')');
  });

  it('finds multiple cva calls in one file', () => {
    const src = 'cva("a", {}); cva("b", {});';
    expect(findCallExpressionArgs(src, 'cva')).toHaveLength(2);
  });
});

describe('parseObjectKeys', () => {
  it('parses simple keys', () => {
    expect(parseObjectKeys('a: 1, b: 2')).toEqual(['a', 'b']);
  });

  it('parses quoted keys', () => {
    expect(parseObjectKeys('"2xs": 1, sm: 2')).toEqual(['2xs', 'sm']);
  });

  it('skips comments', () => {
    expect(parseObjectKeys('// noise\na: 1, /* x */ b: 2')).toEqual(['a', 'b']);
  });

  it('walks past nested objects', () => {
    expect(parseObjectKeys('a: { nested: { x: 1 } }, b: 2')).toEqual([
      'a',
      'b',
    ]);
  });
});

describe('findObjectKey', () => {
  it('finds a key at the top level', () => {
    const src = '{ a: 1, b: 2 }';
    const range = findObjectKey(src, 0, 'b');
    expect(range).not.toBeNull();
    expect(src.slice(range.start, range.end).trim()).toBe('2');
  });

  it('returns null when the key is absent', () => {
    expect(findObjectKey('{ a: 1 }', 0, 'b')).toBeNull();
  });

  it('does not descend into nested objects', () => {
    const src = '{ a: { b: 99 }, c: 2 }';
    expect(findObjectKey(src, 0, 'b')).toBeNull();
  });
});

describe('extractCvaEnums', () => {
  it('extracts variant and size enums', () => {
    const src = `
      const v = cva('base', {
        variants: {
          variant: { default: '', secondary: '' },
          size: { sm: '', lg: '' },
        },
      });
    `;
    const { enums, extraEnums, cvaCount } = extractCvaEnums(src);
    expect(enums).toEqual({
      variant: ['default', 'secondary'],
      size: ['sm', 'lg'],
    });
    expect(extraEnums).toEqual([]);
    expect(cvaCount).toBe(1);
  });

  it('surfaces extra enums beyond variant/size', () => {
    const src = `
      const v = cva('base', {
        variants: {
          variant: { default: '' },
          fill: { solid: '', light: '' },
        },
      });
    `;
    const { enums, extraEnums } = extractCvaEnums(src);
    expect(enums).toEqual({ variant: ['default'] });
    expect(extraEnums).toEqual(['fill']);
  });

  it('unions enums across multiple cva blocks in one file', () => {
    const src = `
      const a = cva('x', { variants: { variant: { foo: '' } } });
      const b = cva('y', { variants: { variant: { bar: '' }, size: { sm: '' } } });
    `;
    const { enums, cvaCount } = extractCvaEnums(src);
    expect(enums.variant).toEqual(['foo', 'bar']);
    expect(enums.size).toEqual(['sm']);
    expect(cvaCount).toBe(2);
  });

  it('returns empty enums when the file has no cva calls', () => {
    const { enums, cvaCount } = extractCvaEnums('export const X = 1;');
    expect(enums).toEqual({});
    expect(cvaCount).toBe(0);
  });
});

describe('detectAsChild', () => {
  it('detects asChild?: in a props interface', () => {
    expect(detectAsChild('interface P { asChild?: boolean; }')).toBe(true);
  });

  it('does not match plain `asChild` references', () => {
    expect(detectAsChild('// asChild support is implemented elsewhere')).toBe(
      false
    );
  });
});

describe('detectInteractiveFromComponent', () => {
  it('flags `disabled` as interactive', () => {
    expect(detectInteractiveFromComponent('disabled = false')).toBe(true);
  });

  it('flags `onClick` prop signatures as interactive', () => {
    expect(detectInteractiveFromComponent('onClick?: () => void')).toBe(true);
  });

  it('treats display-only source as non-interactive', () => {
    expect(detectInteractiveFromComponent('export const X = "hello"')).toBe(
      false
    );
  });
});

describe('findStoryExports', () => {
  it('finds typed Story exports', () => {
    const src = `
      export const Default: Story = { args: {} };
      export const Primary: Story = { args: { variant: 'primary' } };
    `;
    const stories = findStoryExports(src);
    expect(stories.map((s) => s.name)).toEqual(['Default', 'Primary']);
  });

  it('finds StoryObj exports', () => {
    const src = `export const A: StoryObj<typeof Foo> = {};`;
    expect(findStoryExports(src).map((s) => s.name)).toEqual(['A']);
  });

  it('finds satisfies-Story exports', () => {
    const src = `export const A = { args: {} } satisfies Story;`;
    expect(findStoryExports(src).map((s) => s.name)).toEqual(['A']);
  });

  it('skips non-story exports', () => {
    const src = `export const helper = (x: string) => x;`;
    expect(findStoryExports(src)).toEqual([]);
  });
});

describe('detectFnSpy', () => {
  it('detects fn() in meta.args', () => {
    const src = `
      const meta: Meta<typeof X> = {
        args: { onClick: fn() },
      };
    `;
    expect(detectFnSpy(src)).toBe(true);
  });

  it('returns false when meta has no args block', () => {
    const src = `const meta: Meta<typeof X> = { title: 'X' };`;
    expect(detectFnSpy(src)).toBe(false);
  });

  it('returns false when args has no fn() call', () => {
    const src = `const meta: Meta<typeof X> = { args: { value: 'static' } };`;
    expect(detectFnSpy(src)).toBe(false);
  });
});

describe('detectAsChildUsage', () => {
  it('detects asChild anywhere in stories', () => {
    expect(detectAsChildUsage('render: () => <X asChild><a/></X>')).toBe(true);
  });

  it('returns false when asChild is absent', () => {
    expect(detectAsChildUsage('export const A = {};')).toBe(false);
  });
});

describe('storyExercises', () => {
  it('matches via args.variant', () => {
    const src = `
      export const Primary: Story = {
        args: { variant: 'primary' },
      };
    `;
    const [story] = findStoryExports(src);
    expect(storyExercises(src, story, 'variant', 'primary')).toBe(true);
  });

  it('matches via render-JSX prop', () => {
    const src = `
      export const Underline: Story = {
        render: () => <Tabs variant="underline" />,
      };
    `;
    const [story] = findStoryExports(src);
    expect(storyExercises(src, story, 'variant', 'underline')).toBe(true);
  });

  it('matches via case-folded suffix-stripped name', () => {
    const src = `export const UnderlineVariant: Story = { render: () => null };`;
    const [story] = findStoryExports(src);
    expect(storyExercises(src, story, 'variant', 'underline')).toBe(true);
  });

  it('returns false when the value is unexercised', () => {
    const src = `export const Default: Story = { args: { variant: 'default' } };`;
    const [story] = findStoryExports(src);
    expect(storyExercises(src, story, 'variant', 'secondary')).toBe(false);
  });
});

describe('file discovery', () => {
  it('resolves a kebab name to a single file under ui/', () => {
    const file = findComponentFile('button');
    expect(file.endsWith('/ui/button.tsx')).toBe(true);
  });

  it('resolves the stories file alongside the component', () => {
    const file = findComponentFile('button');
    const stories = findStoriesFile(file);
    expect(stories.endsWith('Button.stories.tsx')).toBe(true);
  });

  it('throws ConfigError for missing components', () => {
    expect(() => findComponentFile('nonexistent-component')).toThrow(
      /not found/
    );
  });

  it('lists every component file under ui/ and primitives/', () => {
    const files = listAllComponents();
    expect(files.length).toBeGreaterThan(10);
    expect(files.every((f) => f.endsWith('.tsx'))).toBe(true);
    expect(files.every((f) => !f.includes('__generated__'))).toBe(true);
    expect(files.every((f) => !f.endsWith('.stories.tsx'))).toBe(true);
  });
});

describe('showcaseNameFor', () => {
  it('returns AllVariants by default', () => {
    expect(showcaseNameFor('Button')).toBe('AllVariants');
  });

  it('returns AllSizes for Avatar', () => {
    expect(showcaseNameFor('Avatar')).toBe('AllSizes');
  });

  it('defaults to AllVariants when not in config', () => {
    expect(showcaseNameFor('NewComponentNotInConfig')).toBe('AllVariants');
  });
});

describe('auditComponent — real fixtures', () => {
  it('Button passes with no findings', () => {
    const file = path.join(COMPONENTS_ROOT, 'ui', 'button.tsx');
    const result = auditComponent(file);
    expect(result.findings).toEqual([]);
    expect(result.summary.total).toBe(0);
  });

  it('Avatar passes via display-gate + AllSizes showcase', () => {
    const file = path.join(COMPONENTS_ROOT, 'ui', 'avatar.tsx');
    const result = auditComponent(file);
    expect(result.findings).toEqual([]);
    // Display-gate downgrades Disabled/Click/Keyboard to info entries
    expect(result.info.some((i) => i.name === 'Disabled')).toBe(true);
    // Extra `shape` enum surfaces as info
    expect(result.info.some((i) => i.rule === 'extra-cva-enum')).toBe(true);
  });

  it('Badge passes via display-gate + surfaces `fill` as extra enum', () => {
    const file = path.join(COMPONENTS_ROOT, 'ui', 'badge.tsx');
    const result = auditComponent(file);
    expect(result.findings).toEqual([]);
    const extraEnum = result.info.find((i) => i.rule === 'extra-cva-enum');
    expect(extraEnum?.name).toContain('fill');
  });

  it('Input reports DataAttributesTest as drift', () => {
    const file = path.join(COMPONENTS_ROOT, 'ui', 'input.tsx');
    const result = auditComponent(file);
    const drift = result.findings.find(
      (f) => f.kind === 'drift' && f.name === 'WithDataAttributes'
    );
    expect(drift).toMatchObject({
      kind: 'drift',
      found: 'DataAttributesTest',
      expected: 'WithDataAttributes',
    });
  });

  it('Tabs reports both drift and missing on a compound component', () => {
    const file = path.join(COMPONENTS_ROOT, 'ui', 'tabs.tsx');
    const result = auditComponent(file);
    // Drift: KeyboardNavigation should be KeyboardInteraction
    const keyboardDrift = result.findings.find(
      (f) => f.kind === 'drift' && f.name === 'KeyboardInteraction'
    );
    expect(keyboardDrift?.found).toBe('KeyboardNavigation');
    // Drift: DataAttributesTest should be WithDataAttributes
    const dataDrift = result.findings.find(
      (f) => f.kind === 'drift' && f.name === 'WithDataAttributes'
    );
    expect(dataDrift?.found).toBe('DataAttributesTest');
  });
});
