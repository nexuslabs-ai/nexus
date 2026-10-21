import {
  type VueComponentDocs,
  type VueDemo,
  vueDemos,
} from '../../generated/vue/docs';

import { CodeSample, CodeSampleCard } from './CodeSample';
import { ComponentInstallation } from './ComponentInstallation';
import { DescriptionText } from './DescriptionText';
import {
  SECTION_HEADING_CLASS,
  SectionHeading,
  slugify,
  SUBSECTION_HEADING_CLASS,
  SubsectionHeading,
} from './Heading';
import { ExampleInstall } from './InstallBlock';
import { PropsTable } from './PropsTable';
import { VueDemoStage } from './VueDemoStage';

/** Vue headings share the page with React's, so their ids carry a prefix. */
function vueHeadingId(text: string) {
  return `vue-${slugify(text)}`;
}

function requireVueDemo(id: string): VueDemo {
  const demo = vueDemos[id];
  if (!demo) throw new Error(`No Vue demo "${id}".`);
  return demo;
}

/** One Vue docs story: a live Vue app on the stage, its single-file component below. */
function VueComponentDemo({ demo }: { demo: VueDemo }) {
  return (
    <CodeSampleCard
      data-slot="component-demo"
      data-demo={demo.id}
      className="nx:my-6"
      lang="vue"
      code={demo.source}
      header={
        <div
          data-md-skip
          className="nx:flex nx:min-h-44 nx:items-center nx:justify-center nx:p-8 nx:border-b nx:border-border-default nx:bg-background"
        >
          <VueDemoStage id={demo.id} />
        </div>
      }
    />
  );
}

/** One Vue docs story by id, for MDX pages. */
export function VueDemo({ id }: { id: string }) {
  return <VueComponentDemo demo={requireVueDemo(id)} />;
}

/** The Vue panel of a component page, built from packages/vue's docs stories. */
export function VueComponentPanel({
  slug,
  docs,
}: {
  slug: string;
  docs: VueComponentDocs;
}) {
  const preview = requireVueDemo(docs.preview);

  return (
    <>
      <DescriptionText text={docs.description} className="nx:mb-6" />
      <VueComponentDemo demo={preview} />
      <ExampleInstall slugs={preview.alsoInstall} packages={preview.packages} />

      <SectionHeading
        id={vueHeadingId('Installation')}
        className={SECTION_HEADING_CLASS}
      >
        Installation
      </SectionHeading>
      <ComponentInstallation slug={slug} framework="vue" />

      <SectionHeading
        id={vueHeadingId('Usage')}
        className={SECTION_HEADING_CLASS}
      >
        Usage
      </SectionHeading>
      <CodeSample lang="tsx">{docs.imports}</CodeSample>

      {docs.examples.length > 0 && (
        <SectionHeading
          id={vueHeadingId('Examples')}
          className={SECTION_HEADING_CLASS}
        >
          Examples
        </SectionHeading>
      )}
      {docs.examples.map((id) => {
        const demo = requireVueDemo(id);
        return (
          <section key={id}>
            <SubsectionHeading
              id={vueHeadingId(`example-${demo.title}`)}
              className={SUBSECTION_HEADING_CLASS}
            >
              {demo.title}
            </SubsectionHeading>
            {demo.description && (
              <DescriptionText text={demo.description} className="nx:mb-4" />
            )}
            <VueComponentDemo demo={demo} />
            <ExampleInstall
              slugs={demo.alsoInstall.filter(
                (also) => !preview.alsoInstall.includes(also)
              )}
              packages={demo.packages.filter(
                (spec) => !preview.packages.includes(spec)
              )}
            />
          </section>
        );
      })}

      <SectionHeading
        id={vueHeadingId('Props')}
        className={SECTION_HEADING_CLASS}
      >
        Props
      </SectionHeading>
      <PropsTable slug={slug} framework="vue" />
    </>
  );
}
