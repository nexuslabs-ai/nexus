import { getBlockDocs } from '../../__generated__/demo-index';
import { loadBlockPlan, loadReactSource } from '../_lib/dependencies';
import type { ManifestPage } from '../_lib/manifest';

import { ComponentDemo } from './ComponentDemo';
import {
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
export async function BlockPage({ page }: { page: BlockManifestPage }) {
  const { description, preview } = getBlockDocs(page.slug);
  const { components, packages, files, styles } = await loadBlockPlan(
    page.slug
  );
  const sources = await Promise.all(
    files.map(async (path) => ({ path, source: await loadReactSource(path) }))
  );

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <DescriptionText text={description} className="nx:mb-6" />
      <ComponentDemo id={preview} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Source</SectionHeading>
      <p className={BODY_CLASS}>
        Copy these files into your project. Paths are relative to{' '}
        <InlineCode>packages/react/src/</InlineCode>. Keep the same folders
        under your <InlineCode>@/</InlineCode> root, and the imports between
        files work without edits.
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
