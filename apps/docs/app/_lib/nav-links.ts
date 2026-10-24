import { type ManifestSection, PAGE_MANIFEST } from './manifest';

type NavLink = { href: string; label: string; section?: ManifestSection };

export const NAV_LINKS: NavLink[] = [
  { href: '/playground', label: 'Playground' },
  ...PAGE_MANIFEST.map((section) => ({
    href: section.href,
    label: section.title,
    section,
  })),
  { href: '/changelog', label: 'Changelog' },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}
