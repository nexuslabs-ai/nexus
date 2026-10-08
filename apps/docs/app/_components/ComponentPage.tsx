import {
  type Demo,
  type DemoId,
  demos,
  getComponentSnippets,
  isDemoId,
} from '../../__generated__/demo-index';
import { orderExamples, PREVIEW_DEMO } from '../../scripts/examples.mjs';
import { humanize } from '../../scripts/humanize.mjs';
import type { ManifestPage } from '../_lib/manifest';

import { CodeSample } from './CodeSample';
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
 * Every section comes from `examples/{slug}/`: `demo.tsx` is the preview at the
 * top, Usage and Composition are generated from all of its demos, and every
 * other demo is an example, in `orderExamples` order.
 */
export function ComponentPage({
  page,
}: {
  page: Extract<ManifestPage, { kind: 'generated' }>;
}) {
  const { slug } = page;
  const previewId = `${slug}/${PREVIEW_DEMO}`;
  if (!isDemoId(previewId)) {
    throw new Error(
      `ComponentPage: "${slug}" has no preview demo — add apps/docs/examples/${previewId}.tsx.`
    );
  }

  const preview: Demo = demos[previewId];
  const snippets = getComponentSnippets(slug);
  const examples = examplesFor(slug);

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

      <SectionHeading className={SECTION_HEADING_CLASS}>Usage</SectionHeading>
      <CodeSample lang="tsx">{snippets.imports}</CodeSample>

      {snippets.composition && (
        <>
          <SectionHeading className={SECTION_HEADING_CLASS}>
            Composition
          </SectionHeading>
          <CodeSample lang="text">{snippets.composition}</CodeSample>
        </>
      )}

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

function examplesFor(slug: string): Example[] {
  const prefix = `${slug}/`;
  const names = Object.keys(demos)
    .filter((id) => id.startsWith(prefix))
    .map((id) => id.slice(prefix.length))
    .filter((name) => name !== PREVIEW_DEMO);

  return orderExamples(names).map((name) => {
    const id = `${prefix}${name}`;
    if (!isDemoId(id)) {
      throw new Error(
        `ComponentPage: no demo ${id} in the demo index — run \`pnpm --filter @nexus_ds/docs generate:demos\`.`
      );
    }
    return { id, name };
  });
}
