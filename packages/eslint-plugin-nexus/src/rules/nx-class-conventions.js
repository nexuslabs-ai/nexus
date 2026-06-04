// Enforces the nx: Tailwind class conventions from
// `.claude/rules/components.md` and `.claude/rules/shadcn-divergences.md` on
// class strings (string literals and template literals). Ported from the
// former `.claude/hooks/lint-nx-prefix.mjs` Claude hook so the checks run in
// `pnpm lint` and the pre-commit hook for every contributor — not only on
// in-session Claude edits.

const CHECKS = [
  {
    messageId: 'prefixOrder',
    re: /[a-z][a-z0-9_-]*:nx:|\]:nx:/,
  },
  {
    messageId: 'bannedAccent',
    re: /nx:(?:hover:|active:|focus:|focus-visible:)?(?:bg|text)-accent\b/,
  },
  {
    messageId: 'incompletePath',
    re: /nx:(?:hover:|active:|focus:|focus-visible:)?(?:bg|text|border)-(?:primary|secondary|error|success|warning|information|destructive)(?![\w-])/,
  },
  {
    messageId: 'rawPrimitive',
    re: /nx:(?:hover:|active:|focus:|focus-visible:)?(?:bg|text|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}/,
  },
];

function matchedMessageIds(raw) {
  const matched = new Set();
  for (const { messageId, re } of CHECKS) {
    if (re.test(raw)) {
      matched.add(messageId);
    }
  }
  return matched;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce nx: Tailwind class conventions — correct prefix order, no banned `accent` token, complete semantic token paths, and no raw primitive colors.',
    },
    schema: [],
    messages: {
      prefixOrder:
        'Wrong nx: prefix order — `nx:` must come BEFORE all modifiers (e.g. `nx:hover:bg-*`, not `hover:nx:bg-*`).',
      bannedAccent:
        'Banned `accent` token — Nexus has no `accent`; use `background-hover` / `container-hover` / `popover-hover` (see shadcn-divergences.md).',
      incompletePath:
        'Incomplete semantic token path — add a `-background`, `-foreground`, or `-subtle` suffix (e.g. `nx:bg-primary-background`).',
      rawPrimitive:
        'Raw Tailwind primitive color — use a semantic token instead (e.g. `nx:bg-primary-background`, not `nx:bg-blue-500`).',
    },
  },
  create(context) {
    function report(node, raw) {
      for (const messageId of matchedMessageIds(raw)) {
        context.report({ node, messageId });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') {
          return;
        }
        report(node, node.value);
      },
      TemplateLiteral(node) {
        const matched = new Set();
        for (const quasi of node.quasis) {
          const raw = quasi.value.cooked ?? quasi.value.raw;
          for (const id of matchedMessageIds(raw)) {
            matched.add(id);
          }
        }
        for (const messageId of matched) {
          context.report({ node, messageId });
        }
      },
    };
  },
};
