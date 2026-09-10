import type { Block } from '../../page-registry/blocks';
import type { ManifestPage, ManifestSection } from '../_lib/manifest';
import { PAGE_WIREFRAMES } from '../_lib/page-content.generated';

import { Breadcrumb } from './Breadcrumb';
import { Placeholder } from './Placeholder';

export function PageWireframeView({
  section,
  page,
}: {
  section: ManifestSection;
  page: Extract<ManifestPage, { kind: 'placeholder' }>;
}) {
  const wireframe = PAGE_WIREFRAMES[page.route];
  if (!wireframe) {
    throw new Error(
      `${page.route} is a placeholder page with no PAGE_WIREFRAMES entry — the manifest and the content module have desynced.`
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: section.title, href: section.href },
          { label: page.label },
        ]}
      />
      <h1 className="nx:typography-heading-large">[ {page.label} ]</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-5">
        {wireframe.lede}
      </p>
      {wireframe.blocks.map((block, i) => (
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
