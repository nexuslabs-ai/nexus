import { describe, expect, it } from 'vitest';

import {
  auditSource,
  classifyClassName,
  isAllowed,
  parseArgs,
  shouldScanFile,
  utilityForClassName,
  validateAllowlist,
} from './audit-appearance-reactivity.mjs';

describe('appearance reactivity audit classifier', () => {
  it('flags raw border-width utilities', () => {
    expect(classifyClassName('nx:border')).toMatchObject({
      ruleId: 'raw-border-width',
    });
    expect(classifyClassName('nx:border-b')).toMatchObject({
      ruleId: 'raw-border-width',
    });
    expect(classifyClassName('nx:border-2')).toMatchObject({
      ruleId: 'raw-border-width',
    });
    expect(classifyClassName('nx:border-b-2')).toMatchObject({
      ruleId: 'raw-border-width',
    });
  });

  it('allows runtime stroke, border color, style, transparent, and table utilities', () => {
    expect(classifyClassName('nx:border-default')).toBeNull();
    expect(classifyClassName('nx:border-thick')).toBeNull();
    expect(classifyClassName('nx:border-b-default')).toBeNull();
    expect(classifyClassName('nx:border-border-default')).toBeNull();
    expect(classifyClassName('nx:border-nav-border')).toBeNull();
    expect(classifyClassName('nx:border-dashed')).toBeNull();
    expect(classifyClassName('nx:border-transparent')).toBeNull();
    expect(classifyClassName('nx:border-collapse')).toBeNull();
  });

  it('allows runtime border aliases that preserve Appearance reactivity', () => {
    expect(classifyClassName('nx:border-width-default')).toBeNull();
    expect(classifyClassName('nx:border-color-default')).toBeNull();
    expect(classifyClassName('nx:aria-invalid:border-color-error')).toBeNull();
  });

  it('flags dimension-like arbitrary literals without flagging system colors', () => {
    expect(classifyClassName('nx:border-[1.5px]')).toMatchObject({
      ruleId: 'arbitrary-border-width',
    });
    expect(classifyClassName('nx:text-[13px]')).toMatchObject({
      ruleId: 'arbitrary-text-size',
    });
    expect(classifyClassName('nx:text-[1.25rem]')).toMatchObject({
      ruleId: 'arbitrary-text-size',
    });
    expect(classifyClassName('nx:text-[clamp(1rem,2vw,2rem)]')).toMatchObject({
      ruleId: 'arbitrary-text-size',
    });
    expect(
      classifyClassName('nx:text-[length:clamp(1rem,2vw,2rem)]')
    ).toMatchObject({
      ruleId: 'arbitrary-text-size',
    });
    expect(classifyClassName('nx:text-[CanvasText]')).toBeNull();
    expect(classifyClassName('nx:bg-[Canvas]')).toBeNull();
  });

  it('flags arbitrary token-axis escapes while allowing runtime utilities', () => {
    expect(classifyClassName('nx:p-[13px]')).toMatchObject({
      ruleId: 'arbitrary-spacing',
    });
    expect(classifyClassName('nx:gap-[7px]')).toMatchObject({
      ruleId: 'arbitrary-spacing',
    });
    expect(classifyClassName('nx:p-[calc(1rem+2px)]')).toMatchObject({
      ruleId: 'arbitrary-spacing',
    });
    expect(classifyClassName('nx:rounded-md')).toBeNull();
    expect(classifyClassName('nx:rounded-[2px]')).toMatchObject({
      ruleId: 'arbitrary-radius',
    });
    expect(classifyClassName('nx:rounded-[inherit]')).toBeNull();
    expect(classifyClassName('nx:shadow-lg')).toBeNull();
    expect(classifyClassName('nx:shadow-[0_1px_2px_black]')).toMatchObject({
      ruleId: 'arbitrary-shadow',
    });
  });

  it('flags CSS function arbitrary border widths', () => {
    expect(classifyClassName('nx:border-[calc(1px+0.5px)]')).toMatchObject({
      ruleId: 'arbitrary-border-width',
    });
  });

  it('classifies the final utility after Nexus variants', () => {
    expect(
      utilityForClassName('nx:data-[variant=default]:border-default')
    ).toBe('border-default');
    expect(
      classifyClassName('nx:data-[state=active]:border-b-2')
    ).toMatchObject({
      ruleId: 'raw-border-width',
    });
  });
});

describe('appearance reactivity audit source scanning', () => {
  it('reports unallowlisted violations with line numbers', () => {
    const violations = auditSource(
      'packages/react/src/components/ui/example/example.tsx',
      [
        '<div className="nx:border-default" />',
        '<div className="nx:border nx:text-[13px]" />',
      ].join('\n'),
      []
    );

    expect(violations).toEqual([
      expect.objectContaining({
        line: 2,
        className: 'nx:border',
        ruleId: 'raw-border-width',
      }),
      expect.objectContaining({
        line: 2,
        className: 'nx:text-[13px]',
        ruleId: 'arbitrary-text-size',
      }),
    ]);
  });

  it('scans arbitrary CSS function classes without truncating the class name', () => {
    const violations = auditSource(
      'packages/react/src/components/ui/example/example.tsx',
      '<div className="nx:text-[clamp(1rem,2vw,2rem)]" />',
      []
    );

    expect(violations).toEqual([
      expect.objectContaining({
        className: 'nx:text-[clamp(1rem,2vw,2rem)]',
        ruleId: 'arbitrary-text-size',
      }),
    ]);
  });

  it('honors narrow allowlist entries', () => {
    const violation = {
      file: 'packages/react/src/components/ui/chart/chart.tsx',
      line: 12,
      className: 'nx:border-[1.5px]',
      ruleId: 'arbitrary-border-width',
    };

    expect(
      isAllowed(violation, [
        {
          file: 'packages/react/src/components/ui/chart/chart.tsx',
          className: 'nx:border-[1.5px]',
          reason: 'Chart glyph stroke.',
        },
      ])
    ).toBe(true);
    expect(
      isAllowed(violation, [
        {
          file: 'packages/react/src/components/ui/chart/chart.tsx',
          className: 'nx:rounded-[2px]',
          reason: 'Different exact class.',
        },
      ])
    ).toBe(false);
  });

  it('rejects broad or unexplained allowlist entries', () => {
    expect(
      validateAllowlist([
        {
          file: 'packages/react/src/components/**',
          className: 'nx:border',
          reason: 'too broad',
        },
        {
          file: 'packages/react/src/components/ui/button/button.tsx',
          reason: 'missing class',
        },
        {
          file: 'packages/react/src/components/ui/button/button.tsx',
          ruleId: 'raw-border-width',
          reason: 'rule-only wildcard',
        },
        {
          file: 'packages/react/src/components/ui/button/button.tsx',
          className: 'nx:border',
        },
      ])
    ).toEqual([
      'allowlist[0] must include a concrete file path.',
      'allowlist[1] must include an exact className.',
      'allowlist[2] must include an exact className.',
      'allowlist[3] must include a reason.',
    ]);
  });

  it('skips story and test files', () => {
    expect(shouldScanFile('/repo/button.tsx')).toBe(true);
    expect(shouldScanFile('/repo/button.stories.ts')).toBe(false);
    expect(shouldScanFile('/repo/button.stories.tsx')).toBe(false);
    expect(shouldScanFile('/repo/button.stories.js')).toBe(false);
    expect(shouldScanFile('/repo/button.stories.jsx')).toBe(false);
    expect(shouldScanFile('/repo/button.test.ts')).toBe(false);
    expect(shouldScanFile('/repo/button.test.mjs')).toBe(false);
  });

  it('parses --json', () => {
    expect(parseArgs(['--json'])).toEqual({ json: true });
    expect(parseArgs([])).toEqual({ json: false });
  });
});
