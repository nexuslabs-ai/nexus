import {
  type Demo,
  type DemoId,
  demos,
  getComponentDocs,
} from '../../__generated__/demo-index';
import { importStatement } from '../../scripts/import-statement.mjs';
import type { ManifestPage } from '../_lib/manifest';
import { type ComponentEntry, loadComponentDocs } from '../_lib/props';

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

type ComponentManifestPage = Extract<ManifestPage, { kind: 'generated' }>;

/**
 * Every section comes from the component's stories tagged `docs`: the first is
 * the preview at the top, Usage and Composition come from all of them, and the
 * rest are its examples, in story order.
 */
export function ComponentPage({ page }: { page: ComponentManifestPage }) {
  if (!page.preview) return <PreviewlessComponentPage page={page} />;

  const { slug } = page;
  const docs = getComponentDocs(slug);
  const [previewId, ...exampleIds] = docs.demos;
  if (!previewId) {
    throw new Error(
      `ComponentPage: "${slug}" has no docs stories — tag one of its stories \`docs\`.`
    );
  }
  const preview: Demo = demos[previewId];

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
      <CodeSample lang="tsx">{docs.imports}</CodeSample>

      {docs.composition && (
        <>
          <SectionHeading className={SECTION_HEADING_CLASS}>
            Composition
          </SectionHeading>
          <CodeSample lang="text">{docs.composition}</CodeSample>
        </>
      )}

      {exampleIds.length > 0 && (
        <SectionHeading className={SECTION_HEADING_CLASS}>
          Examples
        </SectionHeading>
      )}
      {exampleIds.map((id) => (
        <Example key={id} id={id} slug={slug} previewId={previewId} />
      ))}

      <SectionHeading className={SECTION_HEADING_CLASS}>Props</SectionHeading>
      <PropsTable slug={slug} />
    </>
  );
}

function Example({
  id,
  slug,
  previewId,
}: {
  id: DemoId;
  slug: string;
  previewId: DemoId;
}) {
  const { title, alsoInstall, packages }: Demo = demos[id];
  const preview: Demo = demos[previewId];

  return (
    <section>
      <SubsectionHeading
        id={`example-${slugify(title)}`}
        className={SUBSECTION_HEADING_CLASS}
      >
        {title}
      </SubsectionHeading>
      <ComponentDemo id={id} />
      <InstallBlock
        slugs={alsoInstall}
        besides={[slug, ...preview.alsoInstall]}
        alsoPackages={packages.filter(
          (spec) => !preview.packages.includes(spec)
        )}
        caption="This example also needs:"
      />
    </section>
  );
}

/** Installation, Usage and Props only, for a component that can't render a preview here. */
async function PreviewlessComponentPage({
  page,
}: {
  page: ComponentManifestPage;
}) {
  const entries = await loadComponentDocs(page.slug);

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>

      <SectionHeading className={SECTION_HEADING_CLASS}>
        Installation
      </SectionHeading>
      <ComponentInstallation slug={page.slug} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Usage</SectionHeading>
      <CodeSample lang="tsx">{importsByFile(entries)}</CodeSample>

      <SectionHeading className={SECTION_HEADING_CLASS}>Props</SectionHeading>
      <PropsTable slug={page.slug} />
    </>
  );
}

// `packages/react/src/components/x/x.tsx` → `@/components/x/x`, one import per file.
function importsByFile(entries: readonly ComponentEntry[]) {
  const byModule = new Map<string, string[]>();
  for (const { name, sourcePath } of entries) {
    const module = sourcePath
      .replace(/^packages\/react\/src\//, '@/')
      .replace(/\.tsx?$/, '');
    byModule.set(module, [...(byModule.get(module) ?? []), name]);
  }
  return [...byModule]
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([module, names]) => importStatement(names.toSorted(), module))
    .join('\n');
}
