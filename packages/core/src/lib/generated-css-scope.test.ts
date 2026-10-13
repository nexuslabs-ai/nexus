import { compile } from '@tailwindcss/node';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

// Nexus sits inside apps it does not own, so its compiled CSS may only style
// nx: classes and set --nx-* variables. A global rule must select a variable
// scope and set variables. Tailwind's own internals are allowed by name.

const TAILWIND_DIR = resolve(process.cwd(), 'packages/tailwind');
const REACT_SRC = resolve(process.cwd(), 'packages/react/src');
const SCOPE = String.raw`(?::root|:host|\.dark|\[data-[a-z]+=['"]?[a-z-]+['"]?\])+`;
const VARIABLE_SCOPE = new RegExp(`^${SCOPE}(?: ${SCOPE})*$`);
const NEXUS_CLASS = /^\.nx\\:/;
// Tailwind's registered-property fallbacks for older engines.
const TAILWIND_PROPERTIES_RULE = '*, ::before, ::after, ::backdrop';
const TAILWIND_KEYFRAMES = new Set(['spin', 'ping', 'pulse', 'bounce']);

interface Rule {
  selector: string;
  declarations: string[];
}

let css = '';
let rules: Rule[] = [];

function nexusCandidates(): string[] {
  const candidates = new Set<string>();
  for (const file of readdirSync(REACT_SRC, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(resolve(REACT_SRC, file), 'utf8');
    for (const [candidate] of source.matchAll(/nx:[^\s'"`{}]+/g)) {
      candidates.add(candidate);
    }
  }
  return [...candidates];
}

// Splits a selector list on commas that are neither escaped (`\,` inside a
// class name) nor inside brackets.
function selectorsIn(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let index = 0; index < list.length; index += 1) {
    const char = list[index];
    if (char === '\\') {
      current += char + (list[index + 1] ?? '');
      index += 1;
      continue;
    }
    if (char === '(' || char === '[') depth += 1;
    if (char === ')' || char === ']') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current.trim());
  return parts;
}

function declarationsIn(text: string): string[] {
  return text
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean);
}

// Every selector rule with its own declarations; at-rules and the frames
// inside @keyframes are skipped.
function rulesOf(stylesheet: string): Rule[] {
  const found: Rule[] = [];
  const stack: Rule[] = [];
  let text = '';
  for (const char of stylesheet.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (char === '{') {
      const split = text.lastIndexOf(';') + 1;
      stack[stack.length - 1]?.declarations.push(
        ...declarationsIn(text.slice(0, split))
      );
      stack.push({ selector: text.slice(split).trim(), declarations: [] });
      text = '';
    } else if (char === '}') {
      const rule = stack.pop();
      if (rule) {
        rule.declarations.push(...declarationsIn(text));
        // Frames inside @keyframes, and rules nested in an nx: class, belong
        // to that keyframe or utility.
        const nested = stack.some(
          ({ selector }) =>
            selector.startsWith('@keyframes') || NEXUS_CLASS.test(selector)
        );
        if (!rule.selector.startsWith('@') && !nested) found.push(rule);
      }
      text = '';
    } else {
      text += char;
    }
  }
  return found;
}

beforeAll(async () => {
  const input = readFileSync(resolve(TAILWIND_DIR, 'nexus.css'), 'utf8');
  const compiler = await compile(input, {
    base: TAILWIND_DIR,
    onDependency() {},
  });
  css = compiler.build(nexusCandidates());
  rules = rulesOf(css);
}, 60_000);

describe('generated CSS scope', () => {
  it('selects only nx: classes, variable scopes and Tailwind internals', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const { selector } of rules) {
      if (selector === TAILWIND_PROPERTIES_RULE) continue;
      for (const part of selectorsIn(selector)) {
        if (NEXUS_CLASS.test(part)) continue;
        expect(part, selector).toMatch(VARIABLE_SCOPE);
      }
    }
  });

  it('declares only --nx-* variables outside nx: classes', () => {
    for (const { selector, declarations } of rules) {
      if (NEXUS_CLASS.test(selector)) continue;
      for (const declaration of declarations) {
        if (selector === '.dark' && declaration === 'color-scheme: dark') {
          continue;
        }
        const allowed =
          selector === TAILWIND_PROPERTIES_RULE ? /^--tw-/ : /^--nx-/;
        expect(declaration, selector).toMatch(allowed);
      }
    }
  });

  it('prefixes every Nexus keyframe with nx-', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(
      ([, name]) => name ?? ''
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      if (TAILWIND_KEYFRAMES.has(name)) continue;
      expect(name).toMatch(/^nx-/);
    }
  });

  it('registers only Tailwind --tw-* properties', () => {
    for (const [, name] of css.matchAll(/@property\s+([\w-]+)/g)) {
      expect(name).toMatch(/^--tw-/);
    }
  });
});
