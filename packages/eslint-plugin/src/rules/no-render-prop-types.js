// Enforces `.claude/rules/composition-over-render-props.md`: component props
// should not be typed as render callbacks (`(...) => ReactNode`), component
// references (`ComponentType<...>`, `FC<...>`), or unions thereof. Event
// handler props (`onClick`, `onSubmit`, ...) return data, not JSX, and are
// exempt.
//
// Known scope gaps — these patterns sneak through the AST visitors below and
// must be caught by code review:
// - Render-shaped props inherited via `Pick<Props, 'renderItem'>`.
// - Prop shapes derived from `z.infer<typeof schema>` (no TSPropertySignature
//   in the source AST — the shape comes from a type expression).
// - Destructured arrow-fn parameters typed inline (no enclosing
//   `TSInterfaceBody` / `TSTypeLiteral` — checker walks property signatures
//   only).

const EVENT_HANDLER = /^on[A-Z]/;

const REACT_NODE_NAMES = new Set([
  'ReactNode',
  'ReactElement',
  'ReactChild',
  'ReactFragment',
  'JSX.Element',
  'React.ReactNode',
  'React.ReactElement',
]);

const COMPONENT_TYPE_NAMES = new Set([
  'ComponentType',
  'FC',
  'FunctionComponent',
  'ElementType',
  'React.ComponentType',
  'React.FC',
  'React.FunctionComponent',
  'React.ElementType',
]);

function typeReferenceName(node) {
  if (node.type !== 'TSTypeReference') {
    return null;
  }
  const t = node.typeName;
  if (t.type === 'Identifier') {
    return t.name;
  }
  if (
    t.type === 'TSQualifiedName' &&
    t.left.type === 'Identifier' &&
    t.right.type === 'Identifier'
  ) {
    return `${t.left.name}.${t.right.name}`;
  }
  return null;
}

function returnsReactNode(fnType) {
  if (fnType.type !== 'TSFunctionType') {
    return false;
  }
  const ret = fnType.returnType?.typeAnnotation;
  if (!ret || ret.type !== 'TSTypeReference') {
    return false;
  }
  const name = typeReferenceName(ret);
  return name !== null && REACT_NODE_NAMES.has(name);
}

function isComponentTypeRef(node) {
  const name = typeReferenceName(node);
  return name !== null && COMPONENT_TYPE_NAMES.has(name);
}

function findViolation(typeNode) {
  if (typeNode.type === 'TSFunctionType' && returnsReactNode(typeNode)) {
    return { kind: 'renderCallback' };
  }
  if (typeNode.type === 'TSTypeReference' && isComponentTypeRef(typeNode)) {
    return { kind: 'componentAsProp', typeName: typeReferenceName(typeNode) };
  }
  if (typeNode.type === 'TSUnionType') {
    for (const member of typeNode.types) {
      const v = findViolation(member);
      if (v) {
        return v;
      }
    }
  }
  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow render-callback props and component-as-prop patterns; use `children` composition or per-mode component split.',
    },
    schema: [],
    messages: {
      renderCallback:
        'Prop "{{name}}" returns ReactNode/JSX.Element — use `children` (or named ReactNode slots) instead of a render callback.',
      componentAsProp:
        'Prop "{{name}}" is typed as a component ({{typeName}}) — use `children` composition or split into per-mode components instead.',
    },
  },
  create(context) {
    function checkPropertySignature(node) {
      if (!node.key || node.key.type !== 'Identifier') {
        return;
      }
      const name = node.key.name;
      if (EVENT_HANDLER.test(name)) {
        return;
      }
      const ann = node.typeAnnotation?.typeAnnotation;
      if (!ann) {
        return;
      }
      const v = findViolation(ann);
      if (!v) {
        return;
      }
      context.report({
        node,
        messageId: v.kind,
        data: { name, typeName: v.typeName ?? '' },
      });
    }

    return {
      'TSInterfaceBody > TSPropertySignature': checkPropertySignature,
      'TSTypeLiteral > TSPropertySignature': checkPropertySignature,
    };
  },
};
