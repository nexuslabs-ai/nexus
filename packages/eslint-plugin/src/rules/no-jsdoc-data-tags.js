// Enforces `.claude/rules/code-comments.md`: comments are prose, never data.
// The docs read prop defaults from code and usage examples from `docs`
// stories, so a `@default` or `@example` tag is a second copy that can drift.

// TypeScript reads a tag at the start of a line, after its `*`, or after
// whitespace mid-line.
const TAG = /(^\s*\*?\s*|\s)@(default|example)\b/;

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `@default` and `@example` JSDoc tags; defaults come from code and examples from docs stories.',
    },
    schema: [],
    messages: {
      default:
        '`@default` duplicates a default the code sets. Delete it, and say so in the description if a dependency sets the default.',
      example:
        '`@example` is an untested copy of usage. Delete it and show the usage in a `docs` story.',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type !== 'Block' || !comment.value.startsWith('*')) {
            continue;
          }

          comment.value.split('\n').forEach((text, index) => {
            const match = TAG.exec(text);
            if (!match) return;

            const line = comment.loc.start.line + index;
            // The first line starts after the comment's own `/*`.
            const column =
              (index === 0 ? comment.loc.start.column + 2 : 0) +
              match.index +
              match[1].length;
            context.report({
              loc: {
                start: { line, column },
                end: { line, column: column + match[2].length + 1 },
              },
              messageId: match[2],
            });
          });
        }
      },
    };
  },
};
