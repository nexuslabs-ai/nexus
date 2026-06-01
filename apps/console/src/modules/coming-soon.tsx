import { useParams } from '@tanstack/react-router';

import { MODULE_ITEMS } from '../shell/modules';

/**
 * Shared placeholder for modules not yet built. One route (`/m/$module`) backs
 * every unbuilt nav entry, so the IA is navigable while the shell, routing,
 * theming, and mock-API layer are already in place beneath it.
 */
export function ComingSoon() {
  const { module } = useParams({ from: '/m/$module' });
  const label = MODULE_ITEMS.find((m) => m.module === module)?.label ?? module;
  return (
    <div className="nx:flex nx:min-h-[60vh] nx:flex-col nx:items-center nx:justify-center nx:gap-3 nx:p-6 nx:text-center">
      <span className="nx:typography-label-small nx:text-muted-foreground-subtle nx:uppercase nx:tracking-wide">
        Atlas module
      </span>
      <h2 className="nx:typography-heading-large nx:text-foreground">
        {label}
      </h2>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-md">
        This module isn’t built yet — it lands in a later Atlas phase. The
        shell, routing, theming, and mock-API layer are already wired for it.
      </p>
    </div>
  );
}
