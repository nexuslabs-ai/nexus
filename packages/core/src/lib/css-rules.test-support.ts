export interface CssRule {
  selector: string;
  /** Enclosing at-rule preludes, outermost first, such as `@layer base`. */
  within: string[];
}

/** Every style rule in `css`, with the at-rules it sits inside. */
export function cssRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  const stack: string[] = [];
  let buffer = '';

  for (const char of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (char === '{') {
      const prelude = buffer.trim();
      if (!prelude.startsWith('@')) {
        rules.push({
          selector: prelude,
          within: stack.filter((p) => p.startsWith('@')),
        });
      }
      stack.push(prelude);
      buffer = '';
      continue;
    }
    if (char === '}') stack.pop();
    if (char === '}' || char === ';') {
      buffer = '';
      continue;
    }
    buffer += char;
  }

  return rules;
}

/** Split a selector list on its top-level commas. */
export function selectorListItems(selector: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of selector) {
    if (char === '(' || char === '[') depth += 1;
    if (char === ')' || char === ']') depth -= 1;
    if (char === ',' && depth === 0) {
      items.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  items.push(current.trim());
  return items;
}
