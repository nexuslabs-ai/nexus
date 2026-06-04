// Enforces `.claude/rules/extract-inline-handlers.md`: inline JSX handler
// props with 3+ statements, or containing a callback-object argument (e.g.,
// `mutation.mutate(input, { onSuccess, onError })`), must be extracted to a
// named function above `return`. One- and two-statement handlers stay inline.

const HANDLER_NAME = /^on[A-Z]/;

function countStatements(body) {
  if (body.type !== 'BlockStatement') {
    return 1;
  }
  return body.body.length;
}

function hasCallbackObjectArgument(body) {
  if (body.type !== 'BlockStatement') {
    return false;
  }
  for (const stmt of body.body) {
    const expr =
      stmt.type === 'ExpressionStatement'
        ? stmt.expression
        : stmt.type === 'ReturnStatement'
          ? stmt.argument
          : null;
    if (!expr || expr.type !== 'CallExpression') {
      continue;
    }
    for (const arg of expr.arguments) {
      if (arg.type !== 'ObjectExpression') {
        continue;
      }
      for (const prop of arg.properties) {
        if (
          prop.type === 'Property' &&
          prop.key.type === 'Identifier' &&
          HANDLER_NAME.test(prop.key.name)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow multi-statement or callback-nesting inline arrow functions in JSX handler props; extract to a named function above `return`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxStatements: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStatements:
        'Inline JSX handler "{{name}}" has {{count}} statements — extract a named function above `return`.',
      nestedCallback:
        'Inline JSX handler "{{name}}" contains nested callback object(s) — extract a named function above `return`.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const maxStatements = options.maxStatements ?? 2;

    return {
      JSXAttribute(node) {
        if (!node.name || node.name.type !== 'JSXIdentifier') {
          return;
        }
        const name = node.name.name;
        if (!HANDLER_NAME.test(name)) {
          return;
        }
        const value = node.value;
        if (!value || value.type !== 'JSXExpressionContainer') {
          return;
        }
        const expr = value.expression;
        if (
          expr.type !== 'ArrowFunctionExpression' &&
          expr.type !== 'FunctionExpression'
        ) {
          return;
        }
        const count = countStatements(expr.body);
        if (count > maxStatements) {
          context.report({
            node,
            messageId: 'tooManyStatements',
            data: { name, count },
          });
          return;
        }
        if (hasCallbackObjectArgument(expr.body)) {
          context.report({
            node,
            messageId: 'nestedCallback',
            data: { name },
          });
        }
      },
    };
  },
};
