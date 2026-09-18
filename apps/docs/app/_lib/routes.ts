import type { SectionSlug } from './sections';
import { getSection, SECTION_SLUGS } from './sections';

/** Route params for `app/[section]` — one per section key. */
export function sectionParams() {
  return SECTION_SLUGS.map((section) => ({ section }));
}

/** Route params for `app/[section]/[sub]` — every sub-page of every section. */
export function subPageParams() {
  return SECTION_SLUGS.flatMap((section) =>
    getSection(section).subs.map((sub) => ({ section, sub: sub.slug }))
  );
}

/** The path `app/[section]` serves for a section key. */
export function sectionHref(section: SectionSlug) {
  return `/${section}`;
}

/** The path `app/[section]/[sub]` serves for a section key and sub-page slug. */
export function subPageHref(section: SectionSlug, sub: string) {
  return `/${section}/${sub}`;
}
