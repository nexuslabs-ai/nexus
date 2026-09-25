import { Link } from '@tanstack/react-router';

/**
 * Rendered under the thin root — outside both the `_app` shell and the `_auth`
 * layout — when no route matches. It sets its own base surface/text tokens for
 * the same reason `auth-layout.tsx` does: nothing above it does, so without them
 * an unmatched URL renders bare (black-on-dark in dark mode). A richer 404 lands
 * with Phase 4's state coverage.
 */
export function NotFound() {
  return (
    <div className="nx:bg-background nx:text-foreground nx:flex nx:min-h-svh nx:flex-col nx:items-center nx:justify-center nx:gap-3 nx:p-6 nx:text-center">
      <p className="nx:typography-label-caps nx:text-muted-foreground-subtle nx:uppercase">
        404
      </p>
      <h1 className="nx:typography-heading-large">Page not found</h1>
      <p className="nx:text-muted-foreground nx:max-w-md">
        That page doesn’t exist — it may have moved, or the link was mistyped.
      </p>
      <Link
        to="/"
        className="nx:text-primary-subtle-foreground nx:hover:underline"
      >
        Back to Atlas
      </Link>
    </div>
  );
}
