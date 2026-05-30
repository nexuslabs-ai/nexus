import type { Section } from '../_lib/sections';

import { LeftRail } from './LeftRail';
import { RightRail } from './RightRail';

export function SectionLayout({
  section,
  children,
}: {
  section: Section;
  children: React.ReactNode;
}) {
  return (
    <div className="nx:grid nx:gap-8 nx:max-w-[1280px] nx:mx-auto nx:px-6 nx:py-8 nx:pb-16 nx:grid-cols-1 nx:lg:grid-cols-[220px_minmax(0,1fr)_200px]">
      <LeftRail section={section} />
      <article className="nx:min-w-0">{children}</article>
      <RightRail />
    </div>
  );
}
