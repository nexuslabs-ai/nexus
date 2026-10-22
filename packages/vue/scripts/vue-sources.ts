// The Vue package as an install source: which files the planner walks, how it
// reads a `.vue` file's imports, and which components `@nxds/vue` exports.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseSfc } from 'vue/compiler-sfc';

import { importSpecifiers } from '../../catalog/scripts/files.mjs';
import {
  createInstallPlanner,
  type Walk,
} from '../../catalog/scripts/install-plans.ts';
import {
  isUnder,
  toRepoPath,
  vueComponentsRoot,
  vueRoot,
  vueSrc,
} from '../../catalog/scripts/roots.mjs';

const COMPONENT_SPECIFIER = './components/';

/** Every component folder `src/index.ts` exports, in export order. */
export function vueComponentSlugs() {
  const index = readFileSync(path.join(vueSrc, 'index.ts'), 'utf8');
  return importSpecifiers(index)
    .filter((specifier) => specifier.startsWith(COMPONENT_SPECIFIER))
    .map((specifier) => {
      const [slug] = specifier.slice(COMPONENT_SPECIFIER.length).split('/');
      if (!slug)
        throw new Error(`vue sources: src/index.ts exports '${specifier}'.`);
      return slug;
    });
}

function isVueModuleSource(file: string) {
  return /\.(?:ts|vue)$/.test(file) && !file.endsWith('.stories.ts');
}

/** A `.vue` file's `<script>` blocks; any other file whole. */
function readVueScript(file: string) {
  const text = readFileSync(file, 'utf8');
  if (!file.endsWith('.vue')) return text;
  const { descriptor, errors } = parseSfc(text, { filename: file });
  if (errors.length > 0) {
    throw new Error(
      `vue sources: ${toRepoPath(file)} does not parse: ${errors[0]?.message}`
    );
  }
  return [descriptor.script, descriptor.scriptSetup]
    .map((block) => block?.content ?? '')
    .join('\n');
}

// A Vue component is its whole folder, so any file in it links the component.
function linkedVueSlug(file: string, exported: Set<string>) {
  if (!isUnder(file, vueComponentsRoot)) return null;
  const [slug] = path.relative(vueComponentsRoot, file).split(path.sep);
  return slug !== undefined && exported.has(slug) ? slug : null;
}

export const vue = createInstallPlanner({
  root: vueRoot,
  src: vueSrc,
  componentsRoot: vueComponentsRoot,
  framework: 'vue',
  isModuleSource: isVueModuleSource,
  readScript: readVueScript,
  linkedComponentSlug: linkedVueSlug,
});

/** Each slug's walked files and packages, by slug, once every package they import is declared. */
export function vueWalks(slugs: string[]) {
  const walks = slugs.map(vue.walkSlug).filter((walked) => walked !== null);
  vue.assertDeclaredPackages(walks);
  return new Map<string, Walk>(walks.map((walked) => [walked.name, walked]));
}
