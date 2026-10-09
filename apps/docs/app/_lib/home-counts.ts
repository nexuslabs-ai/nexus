import type { ManifestSection } from './manifest';

function plural(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function describeSize(section: ManifestSection): string {
  switch (section.unit) {
    case 'components':
      return plural(section.pages.length, 'component');
    case 'blocks':
      return plural(section.pages.length, 'block');
    case undefined:
      return plural(section.pages.length, 'page');
  }
}
