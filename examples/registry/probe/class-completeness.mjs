// Checks that every nx: class the installed Nexus tree uses is in the fixture's built CSS.
// A candidate counts only when the oracle (@nexus_ds/react's own dist/react.css from
// the same revision) emits it, which filters out strings that merely look like classes.
// usage: node class-completeness.mjs <fixture built css> <oracle css> <components/nexus dir>
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const [fixtureCssPath, oracleCssPath, treeDir] = process.argv.slice(2);
if (!treeDir) {
  throw new Error('usage: node class-completeness.mjs <fixture css> <oracle css> <tree dir>');
}

const escapeClass = (name) =>
  [...name].map((c) => (/[\w-]/.test(c) || c.charCodeAt(0) > 127 ? c : `\\${c}`)).join('');
const emits = (css, name) => css.includes(`.${escapeClass(name)}`);

const fixtureCss = readFileSync(fixtureCssPath, 'utf8');
const oracleCss = readFileSync(oracleCssPath, 'utf8');
const sources = readdirSync(treeDir, { recursive: true })
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => readFileSync(path.join(treeDir, file), 'utf8'));

const candidates = new Set(sources.flatMap((source) => source.match(/nx:[^\s'"`{}]+/g) ?? []));
const classes = [...candidates].filter((name) => emits(oracleCss, name));
const missing = classes.filter((name) => !emits(fixtureCss, name)).sort();

console.log(JSON.stringify({ candidates: candidates.size, classes: classes.length, missing }));
if (missing.length > 0) process.exitCode = 1;
