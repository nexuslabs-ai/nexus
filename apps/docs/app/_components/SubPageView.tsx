import { notFound } from 'next/navigation';

import type { Block } from '../_lib/sections';
import { getSection, getSubPage } from '../_lib/sections';

import { Breadcrumb } from './Breadcrumb';
import { Placeholder } from './Placeholder';

export function SubPageView({
  sectionSlug,
  subSlug,
}: {
  sectionSlug: string;
  subSlug: string;
}) {
  const section = getSection(sectionSlug);
  const sub = getSubPage(sectionSlug, subSlug);
  if (!section || !sub) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: section.title, href: section.href },
          { label: sub.label },
        ]}
      />
      <h1 className="nx:typography-heading-large">[ {sub.label} ]</h1>
      <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-5">
        {sub.lede}
      </p>
      {sub.blocks.map((block, i) => (
        <BlockRender key={i} block={block} />
      ))}
    </>
  );
}

function BlockRender({ block }: { block: Block }) {
  if (block.type === 'h2') {
    return (
      <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3">
        {block.text}
      </h2>
    );
  }
  if (block.type === 'row') {
    return (
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-2 nx:gap-3 nx:my-3">
        {block.blocks.map((b, i) => (
          <Placeholder key={i} variant={b.variant ?? 'default'}>
            {b.label}
          </Placeholder>
        ))}
      </div>
    );
  }
  return (
    <Placeholder variant={block.variant ?? 'default'}>
      {block.label}
    </Placeholder>
  );
}
