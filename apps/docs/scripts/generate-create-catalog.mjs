import { generateGalleryEvidence } from './generate-gallery-evidence.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import { generateTokenCatalog } from '../../../packages/core/scripts/token-catalog.js';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const defaultOutput = path.join(root, 'apps/docs/app/_create/generated');
export async function generateCreateCatalog({
  development = false,
  output = defaultOutput,
  tokensDir = path.join(root, 'packages/core/tokens'),
  gallery = true,
} = {}) {
  if (gallery) await generateGalleryEvidence();
  await fs.mkdir(output, { recursive: true });
  let catalog, inspection;
  try {
    const jiti = createJiti(import.meta.url, {
      moduleCache: false,
      fsCache: false,
    });
    const engine = await jiti.import(
      path.join(root, 'packages/core/src/index.ts')
    );
    const generated = await generateTokenCatalog({
      engine,
      tokensDir,
    });
    catalog = { status: 'ready', catalog: generated.catalog };
    inspection = { status: 'ready', inspection: generated.inspection };
  } catch (error) {
    if (!development) throw error;
    catalog = inspection = {
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
  for (const [name, data] of [
    ['catalog', catalog],
    ['inspection', inspection],
  ]) {
    const target = path.join(output, name + '.json');
    const temporary = target + '.tmp';
    await fs.writeFile(temporary, JSON.stringify(data));
    await fs.rename(temporary, target);
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  await generateCreateCatalog();
