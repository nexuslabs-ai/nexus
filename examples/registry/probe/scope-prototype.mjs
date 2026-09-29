// Applies the #795 scoped-root prototype to an installed components/nexus/nexus.css:
// drops the unprefixed --color-* aliases and scopes color-scheme and the base
// rules to [data-nexus-root].
// usage: node scope-prototype.mjs <fixture>/src/components/nexus/nexus.css
import { readFileSync, writeFileSync } from 'node:fs';

const [file] = process.argv.slice(2);
if (!file) throw new Error('usage: node scope-prototype.mjs <nexus.css>');

let css = readFileSync(file, 'utf8');

function replaceExact(from, to) {
  if (!css.includes(from)) throw new Error(`${file}: block not found:\n${from}`);
  css = css.replace(from, to);
}

const aliasStart = css.indexOf('/* ===== RUNTIME COLOR ALIASES ===== */');
const aliasEnd = css.indexOf('/* ===== DARK MODE ===== */');
if (aliasStart < 0 || aliasEnd < aliasStart) {
  throw new Error(`${file}: runtime colour alias block not found`);
}
const aliases = css.slice(aliasStart, aliasEnd);
css = css.slice(0, aliasStart) + css.slice(aliasEnd);

function aliasValue(name) {
  const match = aliases.match(new RegExp(`${name}:\\s*(var\\([^;]+\\));`));
  if (!match) throw new Error(`${file}: alias ${name} not found`);
  return match[1].replace(/\s+/g, ' ').replace('( ', '(');
}

replaceExact(
  `  :root {
    color-scheme: light dark;
  }

  :root:not(.dark) {
    color-scheme: light;
  }

  .dark {
    color-scheme: dark;
  }`,
  `  [data-nexus-root] {
    color-scheme: light;
  }

  .dark [data-nexus-root],
  [data-nexus-root].dark {
    color-scheme: dark;
  }`
);

replaceExact(
  `  *,
  ::before,
  ::after {
    border-color: var(--color-border-default);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
  }`,
  `  :where([data-nexus-root], [data-nexus-root] *, [data-nexus-root] ::before, [data-nexus-root] ::after) {
    border-color: ${aliasValue('--color-border-default')};
  }

  [data-nexus-root] {
    color: ${aliasValue('--color-foreground')};
  }`
);

writeFileSync(file, css);
console.log(`scoped ${file}`);
