import { cn } from '@nexus_ds/react/utils';
import type { MDXComponents } from 'mdx/types';

import { CodeBlock } from './app/_components/CodeBlock';
import * as Nexus from './app/_components/nexus';

/**
 * Required by @next/mdx in the App Router. Maps Markdown-rendered HTML to
 * Nexus-styled elements (typography utilities, semantic tokens) and exposes
 * the @nexus_ds/react components so MDX authors can drop a live <Button> etc.
 * into prose with no import.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // children rendered explicitly so jsx-a11y can see the element has content.
    h1: ({ children, className, ...props }) => (
      <h1
        className={cn('nx:typography-heading-large nx:mb-2', className)}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, className, ...props }) => (
      <h2
        className={cn('nx:typography-heading-small nx:mt-8 nx:mb-3', className)}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, className, ...props }) => (
      <h3
        className={cn(
          'nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn(
          'nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]',
          className
        )}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          'nx:list-disc nx:ps-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          'nx:list-decimal nx:ps-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li
        className={cn(
          'nx:typography-body-default nx:[&.task-list-item]:list-none nx:[&.task-list-item_input:disabled]:me-2 nx:[&.task-list-item_input:disabled]:align-middle',
          className
        )}
        {...props}
      />
    ),
    a: ({ children, className, ...props }) => (
      <a
        className={cn(
          'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </a>
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          'nx:font-mono nx:typography-code-inline nx:bg-muted nx:px-1 nx:py-0.5 nx:rounded-sm',
          className
        )}
        {...props}
      />
    ),
    pre: CodeBlock,
    table: ({ className, ...props }) => (
      <div
        // A scroll container with no focusable children needs its own tab stop.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="nx:mb-4 nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
      >
        <table
          className={cn(
            'nx:w-full nx:border-collapse nx:typography-label-default',
            className
          )}
          {...props}
        />
      </div>
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn(
          'nx:border-b-default nx:border-border-default-alpha nx:[tbody_&:last-child]:border-b-0',
          className
        )}
        {...props}
      />
    ),
    // `{...props}` stays last: a `:---:` row arrives as an inline textAlign
    // style, which must outrank `nx:text-start`.
    th: ({ className, ...props }) => (
      <th
        scope="col"
        className={cn(
          'nx:py-2 nx:pe-3 nx:text-start nx:font-semibold nx:text-foreground',
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn(
          'nx:py-2 nx:pe-3 nx:align-top nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    // live @nexus_ds/react components, usable in MDX without an import
    ...Nexus,
    // caller-provided overrides win
    ...components,
  };
}
