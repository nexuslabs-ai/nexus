import type { MDXComponents } from 'mdx/types';

import * as Nexus from './app/_components/nexus';

/**
 * Required by @next/mdx in the App Router. Maps Markdown-rendered HTML to
 * Nexus-styled elements (typography utilities, semantic tokens) and exposes
 * the @nexus/react components so MDX authors can drop a live <Button> etc.
 * into prose with no import.
 *
 * The pre/code pairing matters: a fenced ``` block renders as <pre><code>;
 * the inline-code background is reset inside <pre> so blocks don't double up.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // children rendered explicitly (not via {...props}) so jsx-a11y can see
    // the heading/anchor has content.
    h1: ({ children, ...props }) => (
      <h1 className="nx:typography-heading-large nx:mb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="nx:text-sm nx:font-semibold nx:mt-6 nx:mb-2" {...props}>
        {children}
      </h3>
    ),
    p: (props) => (
      <p
        className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]"
        {...props}
      />
    ),
    ul: (props) => (
      <ul
        className="nx:list-disc nx:pl-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="nx:list-decimal nx:pl-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground"
        {...props}
      />
    ),
    li: (props) => <li className="nx:typography-body-default" {...props} />,
    a: ({ children, ...props }) => (
      <a
        className="nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2"
        {...props}
      >
        {children}
      </a>
    ),
    code: (props) => (
      <code
        className="nx:font-mono nx:text-sm nx:bg-muted nx:px-1 nx:py-0.5 nx:rounded-sm"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:mb-4 nx:overflow-x-auto nx:text-sm nx:[&_code]:bg-transparent nx:[&_code]:p-0"
        {...props}
      />
    ),
    // live @nexus/react components, usable in MDX without an import
    ...Nexus,
    // caller-provided overrides win
    ...components,
  };
}
