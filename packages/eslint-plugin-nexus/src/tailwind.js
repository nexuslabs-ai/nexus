import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/defaults';
import path from 'node:path';

// `matchesName` requires a full match, hence the leading `.*`.
const tailwindClassSelectors = [
  ...getDefaultSelectors(),
  {
    kind: 'attribute',
    name: '.*ClassName',
    match: [{ type: 'strings' }],
  },
  {
    kind: 'variable',
    name: '.*(?:ClassName|Class|Classes)',
    match: [{ type: 'strings' }],
  },
  {
    kind: 'variable',
    name: '.*CLASSES',
    match: [{ type: 'objectValues' }],
  },
  {
    kind: 'variable',
    name: '.*',
    match: [{ type: 'objectValues', path: '(?:^|\\.)className$' }],
  },
];

export function nexusTailwindClassesConfig(options) {
  const { files, entryPoint } = options;
  if (!path.isAbsolute(entryPoint)) {
    throw new Error(
      `nexusTailwindClassesConfig: \`entryPoint\` must be an absolute path, got '${entryPoint}'.`
    );
  }

  return {
    ...(files ? { files } : {}),
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': { entryPoint, selectors: tailwindClassSelectors },
    },
    rules: {
      // `dark` is the hook for the `@custom-variant dark` in nexus.css.
      'better-tailwindcss/no-unknown-classes': [
        'error',
        { ignore: ['^dark$'] },
      ],
    },
  };
}
