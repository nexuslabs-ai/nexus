import { describe, expect, it } from 'vitest';

import {
  applyColorDraft,
  buildDraftCss,
  buildExportJson,
  COLOR_DRAFT_STYLE_ATTRIBUTE,
  primitiveValue,
  removeColorDraft,
  sanitizeOverrides,
  shadesForFamily,
  validateCustomColor,
} from './color-draft';

describe('validateCustomColor', () => {
  const supportsColor = (value: string) =>
    ['#f3f0ea', 'oklch(0.9 0.01 70)'].includes(value);

  it('accepts trimmed CSS colors accepted by the injected predicate', () => {
    expect(validateCustomColor('  #f3f0ea  ', supportsColor)).toBe('#f3f0ea');
    expect(validateCustomColor('oklch(0.9 0.01 70)', supportsColor)).toBe(
      'oklch(0.9 0.01 70)'
    );
  });

  it('rejects empty, var(), url(), block, and unsupported values', () => {
    expect(validateCustomColor('', supportsColor)).toBeNull();
    expect(
      validateCustomColor('var(--nx-color-red-500)', supportsColor)
    ).toBeNull();
    expect(
      validateCustomColor('url(https://example.test)', supportsColor)
    ).toBeNull();
    expect(validateCustomColor('#fff; color: red', supportsColor)).toBeNull();
    expect(validateCustomColor('/* nope */ #fff', supportsColor)).toBeNull();
    expect(
      validateCustomColor('definitely-not-a-color', supportsColor)
    ).toBeNull();
  });
});

describe('primitive helpers', () => {
  it('includes surface-only 75 and 150 shade stops for neutral ramps', () => {
    expect(shadesForFamily('stone')).toContain('75');
    expect(shadesForFamily('stone')).toContain('150');
    expect(shadesForFamily('red')).not.toContain('75');
    expect(shadesForFamily('red')).not.toContain('150');
  });

  it('builds primitive CSS variable references', () => {
    expect(primitiveValue('stone', '100')).toBe('var(--nx-color-stone-100)');
  });
});

describe('draft serialization', () => {
  it('builds no CSS for an empty draft', () => {
    expect(buildDraftCss({})).toBe('');
  });

  it('builds light-mode draft CSS from sorted semantic overrides', () => {
    expect(
      buildDraftCss({
        'nav-item-active': {
          source: 'custom',
          mode: 'light',
          value: 'oklch(0.9 0.01 70)',
        },
        'background-hover': {
          source: 'primitive',
          mode: 'light',
          value: 'var(--nx-color-stone-100)',
          label: 'stone.100',
        },
      })
    ).toBe(
      [
        'html:root {',
        '  --nx-color-background-hover: var(--nx-color-stone-100);',
        '  --nx-color-nav-item-active: oklch(0.9 0.01 70);',
        '}',
      ].join('\n')
    );
  });

  it('builds dark and shared draft CSS from sorted semantic overrides', () => {
    expect(
      buildDraftCss({
        'nav-item-active': {
          source: 'custom',
          mode: 'dark',
          value: 'oklch(0.9 0.01 70)',
        },
        'background-hover': {
          source: 'primitive',
          mode: 'both',
          value: 'var(--nx-color-stone-100)',
          label: 'stone.100',
        },
      })
    ).toBe(
      [
        'html:root {',
        '  --nx-color-background-hover: var(--nx-color-stone-100);',
        '}',
        '',
        'html:root.dark {',
        '  --nx-color-background-hover: var(--nx-color-stone-100);',
        '  --nx-color-nav-item-active: oklch(0.9 0.01 70);',
        '}',
      ].join('\n')
    );
  });

  it('exports JSON with full CSS variable names grouped by target mode', () => {
    expect(
      buildExportJson({
        'background-hover': {
          source: 'primitive',
          mode: 'both',
          value: 'var(--nx-color-stone-100)',
          label: 'stone.100',
        },
        'nav-item-active': {
          source: 'custom',
          mode: 'dark',
          value: 'oklch(0.9 0.01 70)',
        },
      })
    ).toBe(
      JSON.stringify(
        {
          light: {
            '--nx-color-background-hover': 'var(--nx-color-stone-100)',
          },
          dark: {
            '--nx-color-background-hover': 'var(--nx-color-stone-100)',
            '--nx-color-nav-item-active': 'oklch(0.9 0.01 70)',
          },
        },
        null,
        2
      )
    );
  });
});

describe('sanitizeOverrides', () => {
  const supportsColor = (value: string) => value === '#f3f0ea';

  it('drops unknown tokens and malformed values', () => {
    expect(
      sanitizeOverrides(
        {
          'background-hover': {
            source: 'primitive',
            value: 'var(--nx-color-stone-100)',
            label: 'stone.100',
          },
          'not-a-token': {
            source: 'primitive',
            value: 'var(--nx-color-stone-100)',
          },
          container: { source: 'custom', value: 'not-a-color' },
          popover: { source: 'primitive', value: 'red' },
        },
        supportsColor
      )
    ).toEqual({
      'background-hover': {
        source: 'primitive',
        mode: 'light',
        value: 'var(--nx-color-stone-100)',
        label: 'stone.100',
      },
    });
  });

  it('keeps supported custom colors', () => {
    expect(
      sanitizeOverrides(
        {
          'container-hover': { source: 'custom', value: '#f3f0ea' },
        },
        supportsColor
      )
    ).toEqual({
      'container-hover': { source: 'custom', mode: 'light', value: '#f3f0ea' },
    });
  });

  it('keeps explicit dark-mode targets', () => {
    expect(
      sanitizeOverrides(
        {
          'container-hover': {
            source: 'custom',
            mode: 'dark',
            value: '#f3f0ea',
          },
        },
        supportsColor
      )
    ).toEqual({
      'container-hover': { source: 'custom', mode: 'dark', value: '#f3f0ea' },
    });
  });
});

describe('applyColorDraft', () => {
  it('upserts exactly one style element and updates it in place', () => {
    applyColorDraft({
      'background-hover': {
        source: 'primitive',
        mode: 'light',
        value: 'var(--nx-color-stone-100)',
        label: 'stone.100',
      },
    });
    applyColorDraft({
      'container-hover': { source: 'custom', mode: 'dark', value: '#f3f0ea' },
    });

    const styles = document.head.querySelectorAll(
      `style[${COLOR_DRAFT_STYLE_ATTRIBUTE}]`
    );
    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain('--nx-color-container-hover');
    expect(styles[0]?.textContent).toContain('html:root.dark');
    expect(styles[0]?.textContent).not.toContain('--nx-color-background-hover');
  });

  it('removes the style element when the draft is empty', () => {
    applyColorDraft({
      'background-hover': {
        source: 'primitive',
        mode: 'light',
        value: 'var(--nx-color-stone-100)',
      },
    });

    applyColorDraft({});
    expect(
      document.head.querySelector(`style[${COLOR_DRAFT_STYLE_ATTRIBUTE}]`)
    ).toBeNull();
  });

  it('removes the style element explicitly', () => {
    applyColorDraft({
      'background-hover': {
        source: 'primitive',
        mode: 'light',
        value: 'var(--nx-color-stone-100)',
      },
    });

    removeColorDraft();
    expect(
      document.head.querySelector(`style[${COLOR_DRAFT_STYLE_ATTRIBUTE}]`)
    ).toBeNull();
  });
});
