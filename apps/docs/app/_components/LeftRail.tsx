import type { ManifestSection } from '../_lib/manifest';

import { SectionPageList } from './SectionPageList';

export function LeftRail({ section }: { section: ManifestSection }) {
  return (
    <nav
      aria-label={section.title}
      className="nx:hidden nx:lg:block nx:sticky nx:top-(--docs-header-h) nx:self-start nx:max-h-[calc(100svh-var(--docs-header-h))] nx:overflow-y-auto nx:pr-2"
    >
      <h3 className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2">
        {section.title}
      </h3>
      <SectionPageList section={section} />
    </nav>
  );
}
