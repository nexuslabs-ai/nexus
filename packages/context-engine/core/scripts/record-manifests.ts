/**
 * Script to record complete ComponentManifest outputs for all fixtures
 *
 * Usage: yarn record:manifests [component]
 *
 * Records manifests one at a time with delays to avoid rate limits.
 * If no component specified, records all components.
 *
 * Unlike record-responses.ts (which records raw LLM responses), this script
 * records the COMPLETE manifest output from the full processor pipeline.
 *
 * Uses @nexus/react components directly from packages/react/src/components/ui/
 */

import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ILLMProvider } from '../src/generator/types.js';
import {
  createComponentProcessor,
  isProcessorSuccess,
} from '../src/processor/index.js';
import { createProviderFromEnv } from '../src/utils/env-provider.js';
import { CachedLLMProvider } from '../test/providers/cached-llm-provider.js';
import { saveRecordedManifest } from '../test/utils/manifest-recorder.js';
import {
  kebabToPascal,
  listAvailableComponents,
  loadNexusComponent,
  type NexusComponentFixture,
} from '../test/utils/nexus-fixture-loader.js';

// Load .env.test from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env.test') });

const RESPONSES_DIR = resolve(__dirname, '../test/fixtures/responses');
const TEST_ORG_ID = 'test-org';

// Delay between recordings (ms) to avoid rate limits
const DELAY_MS = 5000;

// Path to Nexus React package
// From: packages/context-engine/core/scripts/
// To:   packages/react/
const REACT_PACKAGE_DIR = resolve(__dirname, '../../../react');

/**
 * Read path aliases from tsconfig.json
 */
function readPathAliases(): Record<string, string[]> {
  try {
    const tsconfigPath = resolve(REACT_PACKAGE_DIR, 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    return tsconfig.compilerOptions?.paths ?? {};
  } catch (_error) {
    console.warn('Could not read tsconfig.json, using empty path aliases');
    return {};
  }
}

/**
 * Read dependencies from package.json (dependencies + peerDependencies)
 */
function readDependencies(): string[] {
  try {
    const packageJsonPath = resolve(REACT_PACKAGE_DIR, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    const deps = Object.keys(packageJson.dependencies ?? {});
    const peerDeps = Object.keys(packageJson.peerDependencies ?? {});

    return [...new Set([...deps, ...peerDeps])];
  } catch (_error) {
    console.warn('Could not read package.json, using empty dependencies');
    return [];
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getComponentFixtures(): string[] {
  return listAvailableComponents();
}

async function recordComponentManifest(
  fixture: NexusComponentFixture,
  provider: ILLMProvider,
  availableComponents: string[]
): Promise<boolean> {
  // Create cached provider that wraps the real provider
  // This will use cached responses if available, otherwise call real LLM
  const cachedProvider = new CachedLLMProvider({
    realProvider: provider,
    recordMode: false, // Not recording responses, just using cache
    responsesDir: RESPONSES_DIR,
  });

  // Read project config dynamically from packages/react
  const pathAliases = readPathAliases();
  const dependencies = readDependencies();

  // Create processor with the cached provider, available components,
  // and extractor options for accurate internal/external import detection
  const processor = createComponentProcessor({
    llmProvider: cachedProvider,
    availableComponents,
    extractorOptions: {
      pathAliases,
      dependencies,
    },
  });

  // Convert kebab-case to PascalCase for component name
  const properName = kebabToPascal(fixture.name);

  console.log(`\nProcessing ${properName}...`);

  try {
    const result = await processor.process({
      filePath: fixture.componentPath,
      name: properName,
      sourceCode: fixture.sourceCode,
      storiesCode: fixture.storiesCode,
      storiesFilePath: fixture.storiesPath,
      framework: 'react',
      orgId: TEST_ORG_ID,
    });

    if (isProcessorSuccess(result)) {
      // Save the manifest using the new split structure
      saveRecordedManifest(properName, result.output, {
        fixtureSource: `nexus/${fixture.name}`,
      });
      console.log(`  ✓ ${properName} manifest recorded`);
      return true;
    } else {
      console.error(`  ✗ ${properName} failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ ${properName} error:`, error);
    return false;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const specificComponent = args[0];

  const provider = createProviderFromEnv();
  console.log(`Using ${provider.providerType} provider`);

  // Get all available component names for filtering relatedComponents
  const allComponentNames = getComponentFixtures();
  const availableComponents = allComponentNames.map(kebabToPascal);
  console.log(`\nAvailable components: ${availableComponents.join(', ')}`);

  let componentNames: string[];

  if (specificComponent) {
    componentNames = [specificComponent];
  } else {
    componentNames = allComponentNames;
  }

  console.log(
    `\nWill record manifests for ${componentNames.length} component(s):`
  );
  console.log(`  ${componentNames.join(', ')}`);
  console.log(`\nUsing ${DELAY_MS}ms delay between each to avoid rate limits`);
  console.log('Press Ctrl+C to cancel\n');

  let recorded = 0;
  let failed = 0;

  for (const componentName of componentNames) {
    try {
      const fixture = loadNexusComponent(componentName);
      const success = await recordComponentManifest(
        fixture,
        provider,
        availableComponents
      );
      if (success) {
        recorded++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`  ✗ ${componentName} error loading fixture:`, error);
      failed++;
    }

    // Delay before next component (except for last one)
    if (componentNames.indexOf(componentName) < componentNames.length - 1) {
      console.log(`  Waiting ${DELAY_MS}ms before next component...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n--- Manifest Recording Complete ---`);
  console.log(`  ✓ Recorded: ${recorded}`);
  if (failed > 0) {
    console.log(`  ✗ Failed: ${failed}`);
  }
  console.log(`\nManifests saved to: test/fixtures/manifests/`);
}

main().catch(console.error);
