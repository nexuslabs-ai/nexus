import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// `shiki` pins its in-family `@shikijs/*` dependencies to its own exact
// version, so the grammars the docs import must resolve to that same version.
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;

// `@shikijs/langs` does not export `./package.json`, so climb from the resolved
// entry. A `dist/` directory can hold a bare `{"type":"module"}` manifest, so
// only one that names a package counts as the package root.
/**
 * @param {string} specifier
 * @returns {{ name: string, version?: string, dependencies?: Record<string, string> }}
 */
function packageJsonFor(specifier) {
  let dir = path.dirname(fileURLToPath(import.meta.resolve(specifier)));

  while (dir !== path.dirname(dir)) {
    const manifest = path.join(dir, 'package.json');
    if (existsSync(manifest)) {
      const parsed = JSON.parse(readFileSync(manifest, 'utf8'));
      if (parsed.name) return parsed;
    }
    dir = path.dirname(dir);
  }

  throw new Error(`No package manifest above the resolved ${specifier}.`);
}

const langsPin = packageJsonFor('shiki').dependencies?.['@shikijs/langs'];

if (langsPin === undefined) {
  console.error(
    'shiki no longer depends on @shikijs/langs, so the grammars apps/docs imports can no longer be checked against it.'
  );
  process.exit(1);
}

if (!EXACT_VERSION.test(langsPin)) {
  console.error(
    `shiki declares @shikijs/langs as "${langsPin}" rather than an exact version, so the resolved grammars can no longer be checked against it.`
  );
  process.exit(1);
}

const langsVersion = packageJsonFor('@shikijs/langs/tsx').version;

if (langsVersion !== langsPin) {
  console.error(
    `Grammar/core skew: shiki pins @shikijs/langs@${langsPin}, but @shikijs/langs@${langsVersion} resolves. Pin both to the same version in apps/docs/package.json.`
  );
  process.exit(1);
}

console.log(`@shikijs/langs@${langsVersion} matches the version shiki pins.`);
