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
 */

import { config } from 'dotenv';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ILLMProvider } from '../src/generator/types.js';
import {
  createComponentProcessor,
  isProcessorSuccess,
} from '../src/processor/index.js';
import { createProviderFromEnv } from '../src/utils/env-provider.js';
import { CachedLLMProvider } from '../test/providers/cached-llm-provider.js';
import { saveRecordedManifest } from '../test/utils/manifest-recorder.js';

// Load .env.test from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env.test') });

const FIXTURES_DIR = resolve(__dirname, '../test/fixtures/components/shadcn');
const RESPONSES_DIR = resolve(__dirname, '../test/fixtures/responses');
const TEST_ORG_ID = 'test-org';

// Delay between recordings (ms) to avoid rate limits
const DELAY_MS = 5000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getComponentFixtures(): string[] {
  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.tsx'));
  return files.map((f) => basename(f, '.tsx'));
}

async function recordComponentManifest(
  componentName: string,
  provider: ILLMProvider
): Promise<boolean> {
  const fixturePath = join(FIXTURES_DIR, `${componentName}.tsx`);

  if (!existsSync(fixturePath)) {
    console.error(`Fixture not found: ${fixturePath}`);
    return false;
  }

  const sourceCode = readFileSync(fixturePath, 'utf-8');

  // Create cached provider that wraps the real provider
  // This will use cached responses if available, otherwise call real LLM
  const cachedProvider = new CachedLLMProvider({
    realProvider: provider,
    recordMode: false, // Not recording responses, just using cache
    responsesDir: RESPONSES_DIR,
  });

  // Create processor with the cached provider
  const processor = createComponentProcessor({
    llmProvider: cachedProvider,
  });

  // Capitalize first letter for component name
  const properName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  console.log(`\nProcessing ${properName}...`);

  try {
    const result = await processor.process({
      filePath: fixturePath,
      name: properName,
      sourceCode,
      framework: 'react',
      orgId: TEST_ORG_ID,
    });

    if (isProcessorSuccess(result)) {
      // Save the manifest using the manifest recorder utility
      saveRecordedManifest(properName, result.manifest, {
        fixtureSource: `shadcn/${componentName}`,
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

  let components: string[];

  if (specificComponent) {
    components = [specificComponent];
  } else {
    components = getComponentFixtures();
  }

  console.log(`\nWill record manifests for ${components.length} component(s):`);
  console.log(`  ${components.join(', ')}`);
  console.log(`\nUsing ${DELAY_MS}ms delay between each to avoid rate limits`);
  console.log('Press Ctrl+C to cancel\n');

  let recorded = 0;
  let failed = 0;

  for (const component of components) {
    const success = await recordComponentManifest(component, provider);
    if (success) {
      recorded++;
    } else {
      failed++;
    }

    // Delay before next component (except for last one)
    if (components.indexOf(component) < components.length - 1) {
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
