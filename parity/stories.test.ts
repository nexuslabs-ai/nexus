import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  componentStoryFiles,
  DOCS_TAG,
  parseStoriesFile,
  tagsOf,
} from '../apps/docs/scripts/docs-stories.ts';
import { vueComponentsRoot } from '../apps/docs/scripts/roots.mjs';

import { shared } from './parity.ts';

function vueStoryFiles(slug: string) {
  const dir = path.join(vueComponentsRoot, slug);
  return readdirSync(dir)
    .filter((file) => file.endsWith('.stories.ts'))
    .sort()
    .map((file) => path.join(dir, file));
}

function docsStoryNames(files: string[]) {
  return files.flatMap((file) =>
    parseStoriesFile(file)
      .stories.filter((story) => tagsOf(story.object).includes(DOCS_TAG))
      .map((story) => story.name)
  );
}

describe('docs stories', () => {
  it.each(shared)(
    '%s shows the same docs examples, in the same order',
    (slug) => {
      const react = docsStoryNames(componentStoryFiles(slug));
      expect(react.length).toBeGreaterThan(0);
      expect(docsStoryNames(vueStoryFiles(slug))).toEqual(react);
    }
  );
});
