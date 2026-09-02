import type { MDXComponents } from 'mdx/types';

import * as Nexus from './app/_components/nexus';

/**
 * remark-gfm labels some elements itself (`task-list-item`, `sr-only` on the
 * footnote label), so every override appends that class rather than letting a
 * trailing `{...props}` spread drop its own.
 */
const join = (base: string, incoming?: string) =>
  incoming ? `${base} ${incoming}` : base;

/**
 * Required by @next/mdx in the App Router. Maps Markdown-rendered HTML to
 * Nexus-styled elements (typography utilities, semantic tokens) and exposes
 * the @nexus_ds/react components so MDX authors can drop a live <Button> etc.
 * into prose with no import.
 *
 * The pre/code pairing matters: a fenced ``` block renders as <pre><code>;
 * the inline-code background is reset inside <pre> so blocks don't double up.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // children rendered explicitly (not via {...props}) so jsx-a11y can see
    // the heading/anchor has content.
    h1: ({ children, className, ...props }) => (
      <h1
        className={join('nx:typography-heading-large nx:mb-2', className)}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, className, ...props }) => (
      <h2
        className={join(
          'nx:typography-heading-small nx:mt-8 nx:mb-3',
          className
        )}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, className, ...props }) => (
      <h3
        className={join(
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
        className={join(
          'nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]',
          className
        )}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={join(
          'nx:list-disc nx:pl-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={join(
          'nx:list-decimal nx:pl-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    // A GFM task list marks its items `task-list-item` and prepends a disabled
    // checkbox. A tight list holds that input directly; a loose one wraps it in
    // a `p`, so the checkbox is matched as a descendant rather than a child.
    li: ({ className, ...props }) => (
      <li
        className={join(
          'nx:typography-body-default nx:[&.task-list-item]:list-none nx:[&.task-list-item_input]:me-2 nx:[&.task-list-item_input]:align-middle',
          className
        )}
        {...props}
      />
    ),
    a: ({ children, className, ...props }) => (
      <a
        className={join(
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
        className={join(
          'nx:font-mono nx:typography-code-inline nx:bg-muted nx:px-1 nx:py-0.5 nx:rounded-sm',
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={join(
          'nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:mb-4 nx:overflow-x-auto nx:typography-code-block nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block',
          className
        )}
        {...props}
      />
    ),
    table: ({ className, ...props }) => (
      <div
        // A wide table overflows horizontally and holds no focusable children,
        // so the container itself must be keyboard-focusable to scroll into
        // view (axe scrollable-region-focusable / WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="nx:mb-4 nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:[outline-offset:-2px]"
      >
        <table
          className={join(
            'nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default',
            className
          )}
          {...props}
        />
      </div>
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={join('nx:border-b nx:border-border-default', className)}
        {...props}
      />
    ),
    // props stay after className so a `:---:` alignment row still wins:
    // hast-util-to-estree's tableCellAlignToStyle turns the cell's `align`
    // into style={{textAlign}}, and an inline style outranks `nx:text-left`.
    th: ({ className, ...props }) => (
      <th
        className={join(
          'nx:py-2 nx:pr-3 nx:text-left nx:font-semibold nx:text-foreground',
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={join(
          'nx:py-2 nx:pr-3 nx:align-top nx:text-muted-foreground',
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
