import {
  type Demo,
  type DemoId,
  demos,
  isDemoId,
} from '../../__generated__/demo-index';
import { PREVIEW_DEMO } from '../../scripts/examples.mjs';
import { humanize } from '../../scripts/humanize.mjs';
import { requireComponentsSection } from '../_lib/manifest';

import { ComponentDemo } from './ComponentDemo';
import { ComponentInstallation } from './ComponentInstallation';
import {
  PAGE_HEADING_CLASS,
  SECTION_HEADING_CLASS,
  SectionHeading,
  slugify,
  SUBSECTION_HEADING_CLASS,
  SubsectionHeading,
} from './Heading';
import { InstallBlock } from './InstallBlock';
import { PropsTable } from './PropsTable';

type Example = { id: DemoId; name: string };

/**
 * `examples/{slug}/demo.tsx` is the preview at the top; every other demo in that
 * folder is an example, registry `examples` first, then the rest by name.
 */
export function ComponentPage({ slug }: { slug: string }) {
  const page = requireComponentsSection().pages.find(
    (entry) => entry.slug === slug
  );
  if (page?.kind !== 'mdx') {
    throw new Error(
      `ComponentPage: no /components/${slug} component page in the manifest — add apps/docs/content/components/${slug}.mdx.`
    );
  }

  const previewId = `${slug}/${PREVIEW_DEMO}`;
  if (!isDemoId(previewId)) {
    throw new Error(
      `ComponentPage: "${slug}" has no preview demo — add apps/docs/examples/${previewId}.tsx.`
    );
  }

  const preview: Demo = demos[previewId];
  const examples = examplesFor(slug, page.examples);

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <ComponentDemo id={previewId} />
      <InstallBlock
        slugs={preview.alsoInstall}
        besides={[slug]}
        alsoPackages={preview.packages}
        caption="This example also needs:"
      />

      <SectionHeading className={SECTION_HEADING_CLASS}>
        Installation
      </SectionHeading>
      <ComponentInstallation slug={slug} />

      {examples.length > 0 && (
        <SectionHeading className={SECTION_HEADING_CLASS}>
          Examples
        </SectionHeading>
      )}
      {examples.map(({ id, name }) => (
        <section key={id}>
          <SubsectionHeading
            id={`example-${slugify(name)}`}
            className={SUBSECTION_HEADING_CLASS}
          >
            {humanize(name)}
          </SubsectionHeading>
          <ComponentDemo id={id} />
          <InstallBlock
            slugs={demos[id].alsoInstall}
            besides={[slug, ...preview.alsoInstall]}
            alsoPackages={demos[id].packages.filter(
              (spec) => !preview.packages.includes(spec)
            )}
            caption="This example also needs:"
          />
        </section>
      ))}

      <SectionHeading className={SECTION_HEADING_CLASS}>Props</SectionHeading>
      <PropsTable slug={slug} />
    </>
  );
}

function examplesFor(slug: string, order: readonly string[]): Example[] {
  const prefix = `${slug}/`;
  const names = Object.keys(demos)
    .filter((id) => id.startsWith(prefix))
    .map((id) => id.slice(prefix.length))
    .filter((name) => name !== PREVIEW_DEMO);
  const ordered = [...order, ...names.filter((name) => !order.includes(name))];

  return ordered.map((name) => {
    const id = `${prefix}${name}`;
    if (!isDemoId(id)) {
      throw new Error(
        `ComponentPage: no demo ${id} in the demo index — run \`pnpm --filter @nexus_ds/docs generate:demos\`.`
      );
    }
    return { id, name };
  });
}
