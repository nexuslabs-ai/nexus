import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import plugin from '../src/index.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const rule = plugin.rules['no-react-19-only'];

ruleTester.run('no-react-19-only', rule, {
  valid: [
    "import * as React from 'react'; const id = React.useId();",
    "import { useSyncExternalStore, useId } from 'react';",
    "import { createPortal } from 'react-dom';",
    // A context rendered through `.Provider` works on React 18.
    `const ThemeContext = React.createContext(null);
     const el = <ThemeContext.Provider value={1}>x</ThemeContext.Provider>;`,
    // A ref callback that handles `null` instead of returning a cleanup.
    `function focusInput(input) { input?.focus(); }
     const el = <input ref={focusInput} />;`,
    `const setNode = React.useCallback((node) => { nodeRef.current = node; }, []);
     const el = <div ref={setNode} />;`,
    // A function returned from a nested callback is not the ref's cleanup.
    `const el = <div ref={(node) => { items.forEach(() => () => {}); }} />;`,
    'const value = React.useDeferredValue(query);',
    // A string action is a URL, which React 18 renders as an attribute.
    '<form action="/search" />',
    // An SVG title labels the graphic in place on every React version.
    '<svg><title>Close</title><path d="M0 0" /></svg>',
    '<style>{css}</style>',
    // Other libraries' exports of the same names are fine.
    "import { use } from 'chai';",
  ],
  invalid: [
    {
      code: "import { use, useOptimistic } from 'react';",
      errors: [
        { messageId: 'api', data: { name: 'use' } },
        { messageId: 'api', data: { name: 'useOptimistic' } },
      ],
    },
    {
      code: "import * as React from 'react'; const state = React.useActionState(fn, null);",
      errors: [{ messageId: 'api', data: { name: 'useActionState' } }],
    },
    {
      code: 'import React from \'react\'; const el = <React.Activity mode="hidden" />;',
      errors: [{ messageId: 'api', data: { name: 'Activity' } }],
    },
    {
      code: "import { useFormStatus, preload } from 'react-dom';",
      errors: [
        { messageId: 'api', data: { name: 'useFormStatus' } },
        { messageId: 'api', data: { name: 'preload' } },
      ],
    },
    {
      code: "import * as ReactDOM from 'react-dom'; ReactDOM.preinit('/font.woff2', { as: 'font' });",
      errors: [{ messageId: 'api', data: { name: 'preinit' } }],
    },
    {
      code: `const ThemeContext = React.createContext(null);
             const el = <ThemeContext value={1}>x</ThemeContext>;`,
      errors: [
        { messageId: 'contextProvider', data: { name: 'ThemeContext' } },
      ],
    },
    {
      // A context imported from another file, named by convention.
      code: '<ButtonGroupSizeContext value="sm">x</ButtonGroupSizeContext>',
      errors: [{ messageId: 'contextProvider' }],
    },
    {
      code: '<div ref={(node) => { observe(node); return () => unobserve(node); }} />',
      errors: [{ messageId: 'refCleanup' }],
    },
    {
      code: '<div ref={(node) => () => unobserve(node)} />',
      errors: [{ messageId: 'refCleanup' }],
    },
    {
      code: `const observeNode = React.useCallback((node) => {
               const observer = new ResizeObserver(check);
               observer.observe(node);
               return () => observer.disconnect();
             }, []);
             const el = <div ref={observeNode} />;`,
      errors: [{ messageId: 'refCleanup' }],
    },
    {
      code: `function attach(node) { return () => detach(node); }
             const el = <div ref={attach} />;`,
      errors: [{ messageId: 'refCleanup' }],
    },
    {
      code: 'const value = React.useDeferredValue(query, "");',
      errors: [{ messageId: 'deferredInitialValue' }],
    },
    {
      code: '<form action={async (data) => save(data)} />',
      errors: [{ messageId: 'formAction', data: { name: 'action' } }],
    },
    {
      code: `function save(data) {}
             const el = <button formAction={save}>Save</button>;`,
      errors: [{ messageId: 'formAction', data: { name: 'formAction' } }],
    },
    {
      code: '<><title>Settings</title><meta name="robots" content="noindex" /></>',
      errors: [
        { messageId: 'documentMetadata', data: { name: 'title' } },
        { messageId: 'documentMetadata', data: { name: 'meta' } },
      ],
    },
    {
      code: '<link rel="stylesheet" href="/x.css" precedence="default" />',
      errors: [{ messageId: 'documentMetadata', data: { name: 'link' } }],
    },
    {
      code: '<style href="nxds" precedence="default">{css}</style>',
      errors: [{ messageId: 'documentMetadata', data: { name: 'style' } }],
    },
  ],
});
