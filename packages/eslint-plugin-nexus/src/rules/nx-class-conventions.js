// Enforces the nx: Tailwind class conventions from
// `.claude/rules/shadcn-divergences.md` on
// class strings (string literals and template literals). Ported from the
// former `.claude/hooks/lint-nx-prefix.mjs` Claude hook so the checks run in
// `pnpm lint` and the pre-commit hook for every contributor — not only on
// in-session Claude edits.

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
];

// Only a width or a colour paints a ring. `outline-none` / `outline-hidden`
// suppress one, `outline-0` is a zero width, `outline-offset-*` shifts a ring
// it does not paint, and the style keywords set `outline-style` alone.
const RING_PAINTING_OUTLINE =
  /focus-visible:outline-(?!none\b|hidden\b|0\b|offset-|solid\b|dashed\b|dotted\b|double\b)/;

// `nx:transition-colors` expands to a property list that includes
// `outline-color`, so a surface that also paints a focus ring fades the ring in
// over the duration instead of landing it with the keypress.
function fadesItsFocusRing(scope) {
  return (
    /\bnx:transition-colors\b/.test(scope) && RING_PAINTING_OUTLINE.test(scope)
  );
}

function isStoryFile(filename) {
  return /\.stories\.[jt]sx?$/.test(filename);
}

function isDocsFile(filename) {
  return /(?:^|[/\\])apps[/\\]docs[/\\]/.test(filename);
}

// What the runtime-only checks skip: stories and the docs app quote utilities
// as specimens and prose, and the docs app styles its own chrome off-system.
function isExampleFile(filename) {
  return isStoryFile(filename) || isDocsFile(filename);
}

// The ring check skips less: only the docs pages, which render a pairing as
// the subject of the prose around it. The rest of the docs app is its own
// shipped chrome, and a story's class strings are the component's real ones.
function isDocsSpecimenPage(filename) {
  return /(?:^|[/\\])apps[/\\]docs[/\\]app[/\\]_pages[/\\]/.test(filename);
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
  if (isExampleFile(filename)) {
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

// A class composer joins every string it is handed — base, array element,
// `variants` value — so the whole call is one scope. The name has to be
// written plainly; an aliased or member-expression composer is invisible.
const CLASS_COMPOSING_CALLEES = new Set(['cva', 'cn', 'clsx', 'cx']);

// `[…].join(' ')` collapses the array literal into one class attribute.
function isJoinedArrayLiteral(node) {
  const { callee } = node;
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'ArrayExpression' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'join'
  );
}

function isClassComposingCall(node) {
  if (node.type !== 'CallExpression') {
    return false;
  }
  if (node.callee.type === 'Identifier') {
    return CLASS_COMPOSING_CALLEES.has(node.callee.name);
  }
  return isJoinedArrayLiteral(node);
}

// A string handed to some other function reaches the class attribute only
// through that call's return value, so it leaves the scope.
function breaksClassScope(node) {
  return node.type === 'CallExpression' && !isClassComposingCall(node);
}

function isInsideClassCall(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isClassComposingCall(current)) {
      return true;
    }
    if (breaksClassScope(current)) {
      return false;
    }
  }
  return false;
}

// Every class string a node can contribute: its own value, a template
// literal's quasis, and the same for anything nested inside it that still
// reaches the same class attribute.
function collectClassStrings(node, visitorKeys, collected) {
  if (node.type === 'Literal') {
    if (typeof node.value === 'string') {
      collected.push(node.value);
    }
    return;
  }
  if (node.type === 'TemplateLiteral') {
    for (const quasi of node.quasis) {
      collected.push(quasi.value.cooked ?? quasi.value.raw);
    }
  }
  for (const key of visitorKeys[node.type] ?? []) {
    const child = node[key];
    for (const value of Array.isArray(child) ? child : [child]) {
      if (value?.type && !breaksClassScope(value)) {
        collectClassStrings(value, visitorKeys, collected);
      }
    }
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce nx: Tailwind class conventions — correct prefix order, no banned `accent` token, complete semantic token paths, no raw primitive colors, no raw named font-size utilities, and no ring-fading `transition-colors` on a focus-ring surface.',
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
      ringFadingTransition:
        'Ring-fading transition — `nx:transition-colors` includes `outline-color`, so this focus ring fades in instead of landing with the keypress. Use `nx:transition-control` (or `nx:transition-field` on a field surface).',
    },
  },
  create(context) {
    const filename = context.filename ?? '';
    const { visitorKeys } = context.sourceCode;

    function report(node, raw) {
      for (const messageId of matchedMessageIds(raw, filename)) {
        context.report({ node, messageId });
      }
    }

    function reportScope(node) {
      if (isDocsSpecimenPage(filename) || isInsideClassCall(node)) {
        return;
      }
      const collected = [];
      collectClassStrings(node, visitorKeys, collected);
      if (fadesItsFocusRing(collected.join(' '))) {
        context.report({ node, messageId: 'ringFadingTransition' });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') {
          return;
        }
        report(node, node.value);
        reportScope(node);
      },
      TemplateLiteral(node) {
        const matched = new Set();
        for (const quasi of node.quasis) {
          const raw = quasi.value.cooked ?? quasi.value.raw;
          for (const id of matchedMessageIds(raw, filename)) {
            matched.add(id);
          }
        }
        for (const messageId of matched) {
          context.report({ node, messageId });
        }
        reportScope(node);
      },
      CallExpression(node) {
        if (!isClassComposingCall(node)) {
          return;
        }
        reportScope(node);
      },
    };
  },
};
