import type { MDXComponents } from 'mdx/types';

import * as Nexus from './app/_components/nexus';

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
          'nx:list-disc nx:ps-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={join(
          'nx:list-decimal nx:ps-6 nx:mb-4 nx:flex nx:flex-col nx:gap-1 nx:text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li
        className={join(
          'nx:typography-body-default nx:[&.task-list-item]:list-none nx:[&.task-list-item_input:disabled]:me-2 nx:[&.task-list-item_input:disabled]:align-middle',
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
    // Shiki (via rehype-pretty-code) writes each token's two colours as
    // --shiki-light / --shiki-dark rather than a resolved `color`, so picking
    // the pair off the appearance toggle's `.dark` class is all the theming a
    // code block needs — no highlighter ships to the client. A span without the
    // property (Shiki's per-line wrapper) inherits the surrounding foreground.
    // Shiki also gives the scroll container a `tabindex`, so it takes the same
    // focus ring the scrollable table wrapper below does.
    pre: ({ className, ...props }) => (
      <pre
        className={join(
          'nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:mb-4 nx:overflow-x-auto nx:typography-code-block nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block nx:[&_span]:text-(--shiki-light) nx:dark:[&_span]:text-(--shiki-dark) nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
          className
        )}
        {...props}
      />
    ),
    table: ({ className, ...props }) => (
      <div
        // A scroll container with no focusable children needs its own tab stop.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="nx:mb-4 nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
      >
        <table
          className={join(
            'nx:w-full nx:border-collapse nx:typography-label-default',
            className
          )}
          {...props}
        />
      </div>
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={join(
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
        className={join(
          'nx:py-2 nx:pe-3 nx:text-start nx:font-semibold nx:text-foreground',
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={join(
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
