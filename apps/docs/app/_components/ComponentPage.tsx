import {
  type ComponentDocs,
  type Demo,
  type DemoId,
  demos,
  getComponentDocs,
} from '../../__generated__/demo-index';
import type { ManifestPage } from '../_lib/manifest';

import { CodeSample } from './CodeSample';
import { ComponentDemo } from './ComponentDemo';
import { ComponentInstallation } from './ComponentInstallation';
import { DescriptionText } from './DescriptionText';
import {
  PAGE_HEADING_CLASS,
  SECTION_HEADING_CLASS,
  SectionHeading,
  slugify,
  SUBSECTION_HEADING_CLASS,
  SubsectionHeading,
} from './Heading';
import { ExampleInstall } from './InstallBlock';
import { PropsTable } from './PropsTable';

type ComponentManifestPage = Extract<ManifestPage, { kind: 'generated' }>;

/**
 * Every section comes from the component's stories tagged `docs`: the first is
 * the preview at the top, Usage and Composition come from all of them, and the
 * rest are its examples, in story order.
 */
export function ComponentPage({ page }: { page: ComponentManifestPage }) {
  const { slug } = page;
  const docs = getComponentDocs(slug);
  const previewId = docs.preview;
  if (!previewId) return <PreviewlessComponentPage page={page} docs={docs} />;

  const preview: Demo = demos[previewId];

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <DescriptionText text={docs.description} className="nx:mb-6" />
      <ComponentDemo id={previewId} />
      <ExampleInstall slugs={preview.alsoInstall} packages={preview.packages} />

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

      {docs.examples.length > 0 && (
        <SectionHeading className={SECTION_HEADING_CLASS}>
          Examples
        </SectionHeading>
      )}
      {docs.examples.map((id) => (
        <Example key={id} id={id} previewId={previewId} />
      ))}

      <SectionHeading className={SECTION_HEADING_CLASS}>Props</SectionHeading>
      <PropsTable slug={slug} />
    </>
  );
}

function Example({ id, previewId }: { id: DemoId; previewId: DemoId }) {
  const { title, description, alsoInstall, packages }: Demo = demos[id];
  const preview: Demo = demos[previewId];

  return (
    <section>
      <SubsectionHeading
        id={`example-${slugify(title)}`}
        className={SUBSECTION_HEADING_CLASS}
      >
        {title}
      </SubsectionHeading>
      {description && (
        <DescriptionText text={description} className="nx:mb-4" />
      )}
      <ComponentDemo id={id} />
      <ExampleInstall
        slugs={alsoInstall.filter(
          (also) => !preview.alsoInstall.includes(also)
        )}
        packages={packages.filter((spec) => !preview.packages.includes(spec))}
      />
    </section>
  );
}

/** Installation, Usage and Props only, for a component that can't render a preview here. */
function PreviewlessComponentPage({
  page,
  docs,
}: {
  page: ComponentManifestPage;
  docs: ComponentDocs;
}) {
  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <DescriptionText text={docs.description} className="nx:mb-6" />

      <SectionHeading className={SECTION_HEADING_CLASS}>
        Installation
      </SectionHeading>
      <ComponentInstallation slug={page.slug} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Usage</SectionHeading>
      <CodeSample lang="tsx">{docs.imports}</CodeSample>

      <SectionHeading className={SECTION_HEADING_CLASS}>Props</SectionHeading>
      <PropsTable slug={page.slug} />
    </>
  );
}
