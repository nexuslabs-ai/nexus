// @ts-check

/** `printWidth` in the repo's `.prettierrc`. */
const PRINT_WIDTH = 80;

/**
 * `import { … } from '…';` laid out the way prettier would print it.
 * @param {readonly string[]} names
 * @param {string} module
 */
export function importStatement(names, module) {
  const oneLine = `import { ${names.join(', ')} } from '${module}';`;
  if (oneLine.length <= PRINT_WIDTH) return oneLine;
  return `import {\n${names.map((name) => `  ${name},`).join('\n')}\n} from '${module}';`;
}
