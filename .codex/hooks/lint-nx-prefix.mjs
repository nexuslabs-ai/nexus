#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const file = input?.tool_input?.file_path;

if (!file || !file.endsWith('.tsx') || !existsSync(file)) {
  process.exit(0);
}

const lines = readFileSync(file, 'utf8').split('\n');

const checks = [
  {
    re: /[a-z][a-z0-9_-]*:nx:|\]:nx:/,
    label:
      'Wrong nx: prefix order — must come BEFORE all modifiers (e.g. `nx:hover:bg-*`, not `hover:nx:bg-*`)',
  },
  {
    re: /nx:(?:hover:|active:|focus:|focus-visible:)?(?:bg|text)-accent\b/,
    label:
      'Banned accent token — Nexus has no `accent`; use `background-hover` / `container-hover` / `popover-hover` (see shadcn-divergences.md)',
  },
  {
    re: /nx:(?:hover:|active:|focus:|focus-visible:)?(?:bg|text|border)-(?:primary|secondary|error|success|warning|information|destructive)(?![\w-])/,
    label:
      'Incomplete semantic token path — use `-background`, `-foreground`, or `-subtle` suffix (e.g. `nx:bg-primary-background`)',
  },
  {
    re: /nx:(?:hover:|active:|focus:|focus-visible:)?(?:bg|text|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}/,
    label:
      'Raw Tailwind primitive color — use a semantic token instead (e.g. `nx:bg-primary-background`, not `nx:bg-blue-500`)',
  },
];

const violations = [];
for (const { re, label } of checks) {
  lines.forEach((line, idx) => {
    if (re.test(line)) {
      violations.push(`  ${file}:${idx + 1}: ${line.trim()}\n    → ${label}`);
    }
  });
}

if (violations.length === 0) process.exit(0);

const msg = [
  `nx: prefix lint found ${violations.length} violation(s):`,
  '',
  ...violations,
  '',
  'Reference: .claude/rules/components.md, .claude/rules/shadcn-divergences.md',
].join('\n');

process.stdout.write(
  JSON.stringify({
    additionalContext: msg,
    systemMessage: `nx: prefix lint: ${violations.length} violation(s) in ${file}`,
  }),
);
process.exit(0);
