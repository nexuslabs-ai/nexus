import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import { writeJson } from './files.mjs';
import { toPropsIndex } from './props-entries.ts';
import { reactPropsFiles } from './react-props.mjs';
import { docsRoot, toRepoPath } from './roots.mjs';

const outputDir = path.join(docsRoot, 'generated', 'props');

// A file this script wrote carries its own slug in its body.
function wasGeneratedHere(fileName) {
  try {
    const body = JSON.parse(
      readFileSync(path.join(outputDir, fileName), 'utf8')
    );
    return body?.slug === path.basename(fileName, '.json');
  } catch {
    return false;
  }
}

function clearPreviousOutput() {
  for (const fileName of readdirSync(outputDir)) {
    if (!wasGeneratedHere(fileName)) continue;
    rmSync(path.join(outputDir, fileName), { force: true });
  }
}

const files = reactPropsFiles();

mkdirSync(outputDir, { recursive: true });
clearPreviousOutput();

for (const file of files) {
  writeJson(path.join(outputDir, `${file.slug}.json`), file);
}

const index = toPropsIndex(files);
writeJson(path.join(outputDir, 'index.json'), index);

const components = files.flatMap((file) => file.components);
const propCount = components.reduce(
  (total, component) => total + component.props.length,
  0
);

console.log(
  `props: ${Object.keys(index).length} entries, ${components.length} components, ${propCount} props -> ${toRepoPath(outputDir)}`
);
