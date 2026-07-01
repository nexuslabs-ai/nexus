// Enforces the nx: Tailwind class conventions from
// `.claude/rules/components.md` and `.claude/rules/shadcn-divergences.md` on
// class strings (string literals and template literals). Ported from the
// former `.claude/hooks/lint-nx-prefix.mjs` Claude hook so the checks run in
// `pnpm lint` and the pre-commit hook for every contributor — not only on
// in-session Claude edits.

// The 12 live typography composites emitted as `@utility typography-*` by
// packages/tailwind/typography-utilities.css; any other `nx:…typography-*` is
// dead — it renders nothing (e.g. the `label-large` / `body-xsmall` tiers dropped
// by the #459 trim). A drift guard in the rule's test fails if this list and the
// emitted set diverge, so it can't silently rot.
export const LIVE_TYPOGRAPHY = [
  'body-default',
  'body-small',
  'code-block',
  'code-inline',
  'heading-large',
  'heading-medium',
  'heading-small',
  'heading-xsmall',
  'label-caps',
  'label-default',
  'label-small',
  'shortcut',
];

export const RAW_FONT_WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
];

export const RAW_LINE_HEIGHTS = [
  'none',
  'tight',
  'snug',
  'normal',
  'relaxed',
  'loose',
];

export const RAW_LETTER_SPACINGS = [
  'tighter',
  'tight',
  'normal',
  'wide',
  'wider',
  'widest',
];

const NAMED_VARIANT = String.raw`@?[\w-]+(?:\[[^\s]+?\])?(?:\/[\w-]+)?:`;
const ARBITRARY_VARIANT = String.raw`\[[^\s]+?\]:`;
const CHILD_VARIANT = String.raw`\*{1,2}:`;
const NX_MODIFIER_CHAIN = String.raw`(?:${NAMED_VARIANT}|${ARBITRARY_VARIANT}|${CHILD_VARIANT})*`;

const CHECKS = [
  {
    messageId: 'prefixOrder',
    re: /[a-z][a-z0-9_-]*:nx:|\]:nx:/,
  },
  {
    messageId: 'bannedAccent',
    re: new RegExp(`nx:${NX_MODIFIER_CHAIN}(?:bg|text)-accent\\b`),
  },
  {
    messageId: 'incompletePath',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}(?:bg|text|border)-(?:primary|secondary|error|success|warning|information|destructive)(?![\\w-])`
    ),
  },
  {
    messageId: 'rawPrimitive',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}(?:bg|text|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}`
    ),
  },
  {
    messageId: 'rawFontSize',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}text-(?:xs|sm|base|lg|xl|[2-9]xl)\\b`
    ),
  },
  {
    messageId: 'rawFontWeight',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}font-(?:${RAW_FONT_WEIGHTS.join('|')})\\b`
    ),
    runtimeOnly: true,
  },
  {
    messageId: 'rawLineHeight',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}leading-(?:${RAW_LINE_HEIGHTS.join('|')}|\\d+|\\[)`
    ),
    runtimeOnly: true,
  },
  {
    messageId: 'rawLetterSpacing',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}tracking-(?:${RAW_LETTER_SPACINGS.join('|')}|\\[)`
    ),
    runtimeOnly: true,
  },
  {
    messageId: 'deadTypography',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}typography-(?!(?:${LIVE_TYPOGRAPHY.join('|')})\\b)[\\w-]+`
    ),
  },
];

function isStoryFile(filename) {
  return /\.stories\.[jt]sx?$/.test(filename);
}

function isDocsFile(filename) {
  return /(?:^|[/\\])apps[/\\]docs[/\\]/.test(filename);
}

const RAW_TYPOGRAPHY_EXCEPTIONS = [
  {
    filename:
      /(?:^|[/\\])packages[/\\]react[/\\]src[/\\]components[/\\]avatar[/\\]avatar\.tsx$/,
    className:
      'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none',
    messageIds: new Set(['rawFontWeight', 'rawLineHeight']),
  },
  {
    filename:
      /(?:^|[/\\])packages[/\\]react[/\\]src[/\\]components[/\\]chart[/\\]chart\.tsx$/,
    className: 'nx:text-foreground nx:font-mono nx:font-medium nx:tabular-nums',
    messageIds: new Set(['rawFontWeight']),
  },
];

function normalizeClassName(raw) {
  return raw.trim().replace(/\s+/g, ' ');
}

function isRawTypographyException(check, filename, raw) {
  const normalized = normalizeClassName(raw);
  return RAW_TYPOGRAPHY_EXCEPTIONS.some(
    (exception) =>
      exception.filename.test(filename) &&
      exception.className === normalized &&
      exception.messageIds.has(check.messageId)
  );
}

function shouldRunCheck(check, filename, raw) {
  if (!check.runtimeOnly) {
    return true;
  }
  if (isStoryFile(filename) || isDocsFile(filename)) {
    return false;
  }
  return !isRawTypographyException(check, filename, raw);
}

function matchedMessageIds(raw, filename) {
  const matched = new Set();
  for (const check of CHECKS) {
    const { messageId, re } = check;
    if (!shouldRunCheck(check, filename, raw)) {
      continue;
    }
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
        'Enforce nx: Tailwind class conventions — correct prefix order, no banned `accent` token, complete semantic token paths, no raw primitive colors, and no raw named font-size utilities.',
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
      rawFontSize:
        'Raw Tailwind font-size utility — use a typography composite instead (e.g. `nx:typography-body-default`, not `nx:text-sm`).',
      rawFontWeight:
        'Raw Tailwind font-weight utility — use a typography composite instead (e.g. `nx:typography-label-default`, not `nx:font-medium`).',
      rawLineHeight:
        'Raw Tailwind line-height utility — let a typography composite own line-height instead of `nx:leading-*`.',
      rawLetterSpacing:
        'Raw Tailwind letter-spacing utility — use a typography composite such as `nx:typography-label-caps` instead of `nx:tracking-*`.',
      deadTypography:
        'Unknown typography composite — this `nx:typography-*` utility is not emitted by typography-utilities.css and renders nothing. Use a live tier (e.g. `nx:typography-body-default`, `nx:typography-label-default`).',
    },
  },
  create(context) {
    function report(node, raw) {
      for (const messageId of matchedMessageIds(raw, context.filename ?? '')) {
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
          for (const id of matchedMessageIds(raw, context.filename ?? '')) {
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
