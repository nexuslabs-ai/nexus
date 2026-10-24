// `packages/react-18` is generated from `packages/react` by wrapping each
// component in `forwardRef`, and nothing else changes. So `packages/react`
// must not use anything React 18 lacks: the generated copy would compile and
// then break at runtime. This rule reports the React 19-only APIs and
// behaviours an nxds component could reach for.

const REACT_ONLY_19 = new Set([
  'use',
  'useActionState',
  'useOptimistic',
  'useEffectEvent',
  'Activity',
  'captureOwnerStack',
]);

const REACT_DOM_ONLY_19 = new Set([
  'useFormStatus',
  'requestFormReset',
  'preload',
  'preloadModule',
  'preinit',
  'preinitModule',
  'preconnect',
  'prefetchDNS',
]);

const ONLY_19_BY_SOURCE = {
  react: REACT_ONLY_19,
  'react-dom': REACT_DOM_ONLY_19,
};

const FUNCTION_TYPES = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
]);

function isFunction(node) {
  return node != null && FUNCTION_TYPES.has(node.type);
}

/** Whether `fn` returns a function from its own body, not a nested one. */
function returnsFunction(fn) {
  if (
    fn.type === 'ArrowFunctionExpression' &&
    fn.body.type !== 'BlockStatement'
  ) {
    return isFunction(fn.body);
  }
  let found = false;
  const visit = (node) => {
    if (found || node == null || typeof node.type !== 'string') return;
    if (node.type === 'ReturnStatement') {
      if (isFunction(node.argument)) found = true;
      return;
    }
    if (isFunction(node)) return;
    for (const [key, value] of Object.entries(node)) {
      if (key === 'parent') continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  };
  visit(fn.body);
  return found;
}

/** The name a call's callee ends in: `useCallback` for `React.useCallback`. */
function calleeName(call) {
  const { callee } = call;
  if (callee.type === 'Identifier') return callee.name;
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier'
  ) {
    return callee.property.name;
  }
  return null;
}

/** The function an identifier names, when it is declared in reach. */
function functionNamed(context, identifier) {
  const scope = context.sourceCode.getScope(identifier);
  let variable = null;
  for (let current = scope; current && !variable; current = current.upper) {
    variable = current.set.get(identifier.name) ?? null;
  }
  const definition = variable?.defs[0];
  if (!definition) return null;
  if (definition.node.type === 'FunctionDeclaration') return definition.node;
  if (definition.node.type !== 'VariableDeclarator') return null;
  const init = definition.node.init;
  if (isFunction(init)) return init;
  if (init?.type === 'CallExpression' && calleeName(init) === 'useCallback') {
    return isFunction(init.arguments[0]) ? init.arguments[0] : null;
  }
  return null;
}

function expressionFunction(context, expression) {
  if (isFunction(expression)) return expression;
  if (expression.type === 'Identifier')
    return functionNamed(context, expression);
  return null;
}

function attributeExpression(attribute) {
  const { value } = attribute;
  return value?.type === 'JSXExpressionContainer' ? value.expression : null;
}

function hasAncestorElement(node, name) {
  for (let current = node.parent; current; current = current.parent) {
    if (
      current.type === 'JSXElement' &&
      current.openingElement.name.type === 'JSXIdentifier' &&
      current.openingElement.name.name === name
    ) {
      return true;
    }
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow React 19-only APIs in source that packages/react-18 is generated from.',
    },
    schema: [],
    messages: {
      api: '`{{name}}` is React 19 only, so the generated packages/react-18 breaks. Use an API React 18.3 has.',
      contextProvider:
        'Rendering a context as a provider is React 19 only. Render `<{{name}}.Provider value={…}>`.',
      refCleanup:
        'A ref callback that returns a cleanup is React 18-incompatible: React 18 ignores the cleanup and calls the ref with `null`. Keep the node in state and set up and tear down in an effect.',
      deferredInitialValue:
        "`useDeferredValue`'s initial value is React 19 only. Pass one argument.",
      formAction:
        'A function `{{name}}` is React 19 only. Handle the form in `onSubmit` or the button in `onClick`.',
      documentMetadata:
        '`<{{name}}>` is hoisted into the document head by React 19 only. React 18 renders it in place.',
    },
  },
  create(context) {
    // Local names bound to the `react` / `react-dom` namespace or default import.
    const namespaces = new Map();
    const contexts = new Set();

    function reportMember(node, source, name) {
      if (ONLY_19_BY_SOURCE[source]?.has(name)) {
        context.report({ node, messageId: 'api', data: { name } });
      }
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (!(source in ONLY_19_BY_SOURCE)) return;
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier') {
            const imported =
              specifier.imported.name ?? specifier.imported.value;
            reportMember(specifier, source, imported);
          } else {
            namespaces.set(specifier.local.name, source);
          }
        }
      },

      MemberExpression(node) {
        if (
          node.object.type !== 'Identifier' ||
          node.property.type !== 'Identifier'
        ) {
          return;
        }
        const source = namespaces.get(node.object.name);
        if (source) reportMember(node.property, source, node.property.name);
      },

      JSXMemberExpression(node) {
        if (node.object.type !== 'JSXIdentifier') return;
        const source = namespaces.get(node.object.name);
        if (source) reportMember(node.property, source, node.property.name);
      },

      VariableDeclarator(node) {
        if (
          node.id.type === 'Identifier' &&
          node.init?.type === 'CallExpression' &&
          calleeName(node.init) === 'createContext'
        ) {
          contexts.add(node.id.name);
        }
      },

      CallExpression(node) {
        if (
          calleeName(node) === 'useDeferredValue' &&
          node.arguments.length > 1
        ) {
          context.report({ node, messageId: 'deferredInitialValue' });
        }
      },

      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return;
        const { name } = node.name;
        const attributes = node.attributes.filter(
          (attribute) => attribute.type === 'JSXAttribute'
        );

        const isContext = contexts.has(name) || /^[A-Z]\w*Context$/.test(name);
        if (
          isContext &&
          attributes.some((attribute) => attribute.name.name === 'value')
        ) {
          context.report({
            node,
            messageId: 'contextProvider',
            data: { name },
          });
        }

        if (name === 'meta' || name === 'link') {
          context.report({
            node,
            messageId: 'documentMetadata',
            data: { name },
          });
        }
        if (name === 'title' && !hasAncestorElement(node.parent, 'svg')) {
          context.report({
            node,
            messageId: 'documentMetadata',
            data: { name },
          });
        }
        if (
          name === 'style' &&
          attributes.some((attribute) => attribute.name.name === 'precedence')
        ) {
          context.report({
            node,
            messageId: 'documentMetadata',
            data: { name },
          });
        }

        for (const attribute of attributes) {
          const attributeName = attribute.name.name;
          const expression = attributeExpression(attribute);
          if (!expression) continue;

          if (attributeName === 'ref') {
            const fn = expressionFunction(context, expression);
            if (fn && returnsFunction(fn)) {
              context.report({ node: attribute, messageId: 'refCleanup' });
            }
          }
          if (
            (attributeName === 'action' || attributeName === 'formAction') &&
            expressionFunction(context, expression)
          ) {
            context.report({
              node: attribute,
              messageId: 'formAction',
              data: { name: attributeName },
            });
          }
        }
      },
    };
  },
};
