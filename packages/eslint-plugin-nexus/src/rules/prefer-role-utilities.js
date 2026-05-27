const RAW_NUMERIC_RE =
  /\bnx:(?:[a-z][a-z0-9-]*:)*(p|px|py|gap)-(\d+(?:\.\d+)?)(?![\w.-])/g;

const ALTERNATIVES = {
  p: 'nx:p-container',
  px: 'nx:px-control-{sm,md,lg}',
  py: 'nx:py-control-{sm,md,lg}',
  gap: 'nx:gap-control-{sm,md,lg} / nx:gap-container / nx:gap-layout-{section,stack}',
};

const ALLOW_PREFIX = 'nexus-allow-numeric:';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer role-named spacing utilities (px-control-*, py-control-*, gap-control-*, p-container, gap-container, gap-layout-*) over raw numerics in UI components.',
    },
    schema: [],
    messages: {
      preferRole:
        '"{{raw}}" is a raw numeric utility. Prefer a role utility: {{alternative}}. Add "// nexus-allow-numeric: <reason>" on the prior line if the numeric is intentional.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    let allowedLines;

    function getAllowedLines() {
      if (allowedLines !== undefined) return allowedLines;
      allowedLines = new Set();
      for (const comment of sourceCode.getAllComments()) {
        if (comment.type !== 'Line') continue;
        const text = comment.value.trim();
        if (!text.startsWith(ALLOW_PREFIX)) continue;
        allowedLines.add(comment.loc.end.line + 1);
      }
      return allowedLines;
    }

    function check(node, raw) {
      if (getAllowedLines().has(node.loc.start.line)) return;
      RAW_NUMERIC_RE.lastIndex = 0;
      let match;
      while ((match = RAW_NUMERIC_RE.exec(raw)) !== null) {
        const [token, prefix, number] = match;
        if (number === '0') continue;
        context.report({
          node,
          messageId: 'preferRole',
          data: {
            raw: token,
            alternative: ALTERNATIVES[prefix],
          },
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        check(node, node.value);
      },
    };
  },
};
