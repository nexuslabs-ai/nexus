import { SECTIONS } from './sections';

/** Route params for `app/[section]` — one per section key. */
export function sectionParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

/** Route params for `app/[section]/[sub]` — every sub-page of every section. */
export function subPageParams() {
  return Object.entries(SECTIONS).flatMap(([section, { subs }]) =>
    subs.map((sub) => ({ section, sub: sub.slug }))
  );
}

/** The path `app/[section]` serves for a section key. */
export function sectionHref(section: string) {
  return `/${section}`;
}

/** The path `app/[section]/[sub]` serves for a section key and sub-page slug. */
export function subPageHref(section: string, sub: string) {
  return `/${section}/${sub}`;
}
