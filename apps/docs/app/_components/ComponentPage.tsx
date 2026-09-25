import { type DemoId, demos, isDemoId } from '../../__generated__/demo-index';
import { requireSection } from '../_lib/manifest';

import { ComponentPreview } from './ComponentPreview';
import { ComponentSource } from './ComponentSource';
import {
  PAGE_HEADING_CLASS,
  SECTION_HEADING_CLASS,
  SectionHeading,
  SUBSECTION_HEADING_CLASS,
  SubsectionHeading,
} from './Heading';
import { InstallBlock } from './InstallBlock';
import { PropsTable } from './PropsTable';

const PREVIEW_DEMO = 'demo';

type Example = { id: DemoId; name: string };

/**
 * A component's docs page: Preview, Install, Code, Props, then Examples, all
 * derived from `slug`. Demos live at `apps/docs/examples/{slug}/{name}.tsx`;
 * `demo` feeds Preview and Code, every other name is an example.
 */
export function ComponentPage({ slug }: { slug: string }) {
  const page = requireSection('components').pages.find(
    (entry) => entry.slug === slug
  );
  if (!page) {
    throw new Error(
      `ComponentPage: no /components/${slug} page in the manifest — add apps/docs/content/components/${slug}.mdx.`
    );
  }

  const previewId = `${slug}/${PREVIEW_DEMO}`;
  if (!isDemoId(previewId)) {
    throw new Error(
      `ComponentPage: "${slug}" has no preview demo — add apps/docs/examples/${previewId}.tsx.`
    );
  }

  const examples = examplesFor(slug);

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <ComponentPreview id={previewId} />

      <SectionHeading className={SECTION_HEADING_CLASS}>
        Installation
      </SectionHeading>
      <InstallBlock slug={slug} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Code</SectionHeading>
      <ComponentSource id={previewId} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Props</SectionHeading>
      <PropsTable slug={slug} />

      {examples.length > 0 && (
        <SectionHeading className={SECTION_HEADING_CLASS}>
          Examples
        </SectionHeading>
      )}
      {examples.map(({ id, name }) => (
        <section key={id}>
          <SubsectionHeading
            id={`example-${name}`}
            className={SUBSECTION_HEADING_CLASS}
          >
            {humanize(name)}
          </SubsectionHeading>
          <ComponentPreview id={id} />
          <ComponentSource id={id} />
        </section>
      ))}
    </>
  );
}

function examplesFor(slug: string): Example[] {
  const prefix = `${slug}/`;

  return Object.keys(demos)
    .filter(isDemoId)
    .filter((id) => id.startsWith(prefix))
    .map((id) => {
      const name = id.slice(prefix.length);
      if (name.includes('/')) {
        throw new Error(
          `ComponentPage: apps/docs/examples/${id}.tsx is nested too deep — a component's demos live at examples/${slug}/{name}.tsx.`
        );
      }
      return { id, name };
    })
    .filter(({ name }) => name !== PREVIEW_DEMO);
}

// `with-icon` → `With icon`.
function humanize(name: string) {
  const spaced = name.replaceAll('-', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
