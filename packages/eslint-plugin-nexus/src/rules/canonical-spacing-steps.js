import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const canonical = JSON.parse(
  readFileSync(join(__dirname, '..', 'canonical-step-set.json'), 'utf8')
);
const allowed = new Set(canonical.values);

function summarizeAllowed(set) {
  const arr = [...set].sort((a, b) => a - b);
  if (arr.length <= 10) return arr.join(', ');
  return `${arr.slice(0, 6).join(', ')}, … ${arr[arr.length - 1]} (${arr.length} total)`;
}

function readNumericLiteral(node) {
  if (!node) return null;
  if (node.type === 'JSONLiteral' && typeof node.value === 'number') {
    return node.value;
  }
  if (
    node.type === 'JSONUnaryExpression' &&
    node.operator === '-' &&
    node.argument?.type === 'JSONLiteral' &&
    typeof node.argument.value === 'number'
  ) {
    return -node.argument.value;
  }
  return null;
}

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
        '{{value}}px is not in the canonical spacing step set. Allowed: {{allowed}}. Refresh src/canonical-step-set.json via `pnpm --filter @nexus_ds/eslint-plugin refresh:canonical-set` if a mode file legitimately introduces a new value.',
    },
  },
  create(context) {
    return {
      'JSONProperty[key.value="$value"] > JSONObjectExpression'(node) {
        let valueProp, unitProp;
        for (const prop of node.properties) {
          if (prop.type !== 'JSONProperty') continue;
          const key = prop.key?.value;
          if (key === 'value') valueProp = prop.value;
          else if (key === 'unit') unitProp = prop.value;
        }
        if (!unitProp || unitProp.type !== 'JSONLiteral') return;
        if (unitProp.value !== 'px') return;

        const n = readNumericLiteral(valueProp);
        if (n === null) return;
        if (allowed.has(n)) return;

        context.report({
          node: valueProp,
          messageId: 'offGrid',
          data: {
            value: String(n),
            allowed: summarizeAllowed(allowed),
          },
        });
      },
    };
  },
};
