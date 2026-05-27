export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow px values in spacing mode files outside the canonical step set',
    },
    schema: [],
    messages: {
      offGrid:
        '{{value}}px is not in the canonical spacing step set. Allowed: {{allowed}}. See .claude/rules/spacing-tokens.md.',
    },
  },
  create() {
    return {};
  },
};
