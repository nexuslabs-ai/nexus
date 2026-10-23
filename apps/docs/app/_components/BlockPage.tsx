import { getBlockDocs } from '../../__generated__/demo-index';
import { loadInstallPlan } from '../_lib/catalog';
import type { ManifestPage } from '../_lib/manifest';

import { ComponentDemo } from './ComponentDemo';
import {
  AddCommand,
  ComponentLinks,
  PackagesSample,
  SourceFile,
  StylesSample,
} from './ComponentInstallation';
import { DescriptionText } from './DescriptionText';
import {
  PAGE_HEADING_CLASS,
  SECTION_HEADING_CLASS,
  SectionHeading,
} from './Heading';
import { InlineCode } from './InlineCode';

type BlockManifestPage = Extract<ManifestPage, { kind: 'block' }>;

const BODY_CLASS =
  'nx:mb-4 nx:typography-body-default nx:text-muted-foreground';

/** A block's story tagged `docs` as the preview, then its install plan. */
export function BlockPage({ page }: { page: BlockManifestPage }) {
  const { description, preview } = getBlockDocs(page.slug);
  const {
    components,
    packages,
    files: sources,
    styles,
  } = loadInstallPlan(page.slug);

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <DescriptionText text={description} className="nx:mb-6" />
      <ComponentDemo id={preview} />

      <SectionHeading className={SECTION_HEADING_CLASS}>
        Installation
      </SectionHeading>
      <AddCommand name={page.slug} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Source</SectionHeading>
      <p className={BODY_CLASS}>
        To install by hand, copy these files into your project. Paths are
        relative to <InlineCode>packages/react/src/</InlineCode>. Copy each file
        to the same path under <InlineCode>components/nxds/</InlineCode>, and
        the imports between files work without edits.
      </p>
      {components.length > 0 && (
        <p className={BODY_CLASS}>
          Install these components first: <ComponentLinks slugs={components} />.
        </p>
      )}
      {packages.length > 0 && <PackagesSample packages={packages} />}
      {sources.map(({ path, source }) => (
        <SourceFile key={path} path={path} source={source} />
      ))}
      {styles.length > 0 && <StylesSample styles={styles} />}
    </>
  );
}
