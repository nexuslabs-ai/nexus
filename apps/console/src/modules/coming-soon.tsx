import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@nexus/react';
import { useParams } from '@tanstack/react-router';

import { MODULE_ITEMS } from '../shell/modules';

/**
 * Shared placeholder for modules not yet built. One route (`/m/$module`) backs
 * every unbuilt nav entry, so the IA is navigable while the shell, routing,
 * theming, and mock-API layer are already in place beneath it.
 */
export function ComingSoon() {
  // `from` is the route ID, which the pathless `_app` layout route prefixes
  // with `/app` (the URL stays `/m/$module`).
  const { module } = useParams({ from: '/app/m/$module' });
  const item = MODULE_ITEMS.find((m) => m.module === module);
  const label = item?.label ?? module;
  const Icon = item?.icon;

  return (
    <EmptyState className="nx:min-h-[60svh]">
      {/* The page's h1 — the visible title is EmptyStateTitle, not a heading. */}
      <h1 className="nx:sr-only">{label}</h1>
      <EmptyStateHeader>
        {Icon && (
          <EmptyStateMedia variant="icon">
            <Icon />
          </EmptyStateMedia>
        )}
        <EmptyStateTitle>{label}</EmptyStateTitle>
        <EmptyStateDescription>
          This module isn’t built yet — it lands in a later Atlas phase. The
          shell, routing, theming, and mock-API layer are already wired for it.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  );
}
