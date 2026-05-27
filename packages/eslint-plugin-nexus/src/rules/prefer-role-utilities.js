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
  create() {
    return {};
  },
};
