import { Outlet } from '@tanstack/react-router';

/**
 * The shell-less layout for the auth flow (login / signup / verify / forgot).
 * The auth screen is the base — centered at every width. The brand panel is a
 * Standard-tier enhancement, shown alongside it only at `lg` and up
 * (`nx:lg:flex`).
 *
 * It sets `nx:bg-background nx:text-foreground` on its root because it renders
 * OUTSIDE the app shell — a sibling pathless route, not a child — so it can't
 * inherit the shell's base surface/text tokens. Omitting them reproduces the
 * dark-mode regression that bit the foundation PR.
 */
export function AuthLayout() {
  return (
    <div className="nx:bg-background nx:text-foreground nx:flex nx:min-h-svh">
      <aside className="nx:bg-primary-background nx:text-primary-foreground nx:hidden nx:w-1/2 nx:flex-col nx:justify-between nx:p-12 nx:lg:flex">
        <div className="nx:flex nx:items-center nx:gap-2">
          <div className="nx:bg-primary-foreground nx:flex nx:size-8 nx:items-center nx:justify-center nx:rounded-lg">
            <span className="nx:text-primary-background nx:typography-label-default nx:font-bold">
              A
            </span>
          </div>
          <span className="nx:typography-heading-xsmall">Atlas</span>
        </div>
        <div className="nx:space-y-3">
          <p className="nx:typography-heading-medium nx:leading-snug">
            The operating system for your whole company.
          </p>
          <p className="nx:text-primary-foreground/80 nx:typography-body-default">
            CRM, projects, billing, and analytics — themed end to end by Nexus.
          </p>
        </div>
        <p className="nx:text-primary-foreground/70 nx:typography-label-small">
          Built on the Nexus design system.
        </p>
      </aside>

      <main className="nx:flex nx:flex-1 nx:items-center nx:justify-center nx:p-6">
        <div className="nx:w-full nx:max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
