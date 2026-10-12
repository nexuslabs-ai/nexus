import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Nexus sits inside apps it does not own, so its generated CSS may only add
// nx: utilities and --nx-* variables. A rule outside @utility / @theme /
// @keyframes is global: it must select a variable scope and set variables.

const TAILWIND_DIR = resolve(process.cwd(), 'packages/tailwind');
const LOCAL_BLOCKS = /^@(utility|theme|keyframes|custom-variant)\b/;
const SCOPE = String.raw`(?::root|\.dark|\[data-[a-z]+='[a-z-]+'\])+`;
const VARIABLE_SCOPE = new RegExp(`^${SCOPE}(?: ${SCOPE})*$`);

interface GlobalRule {
  file: string;
  selector: string;
  declarations: string[];
}

function globalRules(file: string): GlobalRule[] {
  const css = readFileSync(resolve(TAILWIND_DIR, file), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    ''
  );
  const rules: GlobalRule[] = [];
  const headers: string[] = [];
  let text = '';
  for (const char of css) {
    if (char === '{') {
      headers.push(text.slice(text.lastIndexOf(';') + 1).trim());
      text = '';
    } else if (char === '}') {
      const selector = headers.pop() ?? '';
      const isLocal = [...headers, selector].some((header) =>
        LOCAL_BLOCKS.test(header)
      );
      if (!isLocal && !selector.startsWith('@')) {
        rules.push({
          file,
          selector,
          declarations: text
            .split(';')
            .map((declaration) => declaration.trim())
            .filter(Boolean),
        });
      }
      text = '';
    } else {
      text += char;
    }
  }
  return rules;
}

const files = readdirSync(TAILWIND_DIR).filter((file) => file.endsWith('.css'));
const rules = files.flatMap(globalRules);

describe('generated CSS scope', () => {
  it('selects only :root, .dark and data-attribute scopes', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const { file, selector } of rules) {
      for (const part of selector.split(',').map((s) => s.trim())) {
        expect(part, `${file}: ${selector}`).toMatch(VARIABLE_SCOPE);
      }
    }
  });

  it('declares only --nx-* variables, apart from the dark color-scheme', () => {
    for (const { file, selector, declarations } of rules) {
      for (const declaration of declarations) {
        if (selector === '.dark' && declaration === 'color-scheme: dark') {
          continue;
        }
        expect(declaration, `${file}: ${selector}`).toMatch(/^--nx-/);
      }
    }
  });

  it('imports Tailwind without Preflight', () => {
    const entry = readFileSync(resolve(TAILWIND_DIR, 'nexus.css'), 'utf8');
    expect(entry).not.toMatch(/@import\s+['"]tailwindcss['"]/);
    expect(entry).not.toContain('preflight');
  });
});
