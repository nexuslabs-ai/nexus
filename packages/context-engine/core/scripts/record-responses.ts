/**
 * Script to record LLM responses for component fixtures
 *
 * Usage: yarn test:record-all [component]
 *
 * Records responses one at a time with delays to avoid rate limits.
 * If no component specified, records all missing components.
 *
 * Uses @nexus/react components directly from packages/react/src/components/ui/
 */

import { config } from 'dotenv';
import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ILLMProvider } from '../src/generator/types.js';
import { createComponentProcessor } from '../src/processor/component-processor.js';
import { createProviderFromEnv } from '../src/utils/env-provider.js';
import { CachedLLMProvider } from '../test/providers/cached-llm-provider.js';
import {
  listAvailableComponents,
  loadNexusComponent,
  type NexusComponentFixture,
} from '../test/utils/nexus-fixture-loader.js';

// Load .env.test from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env.test') });

const RESPONSES_DIR = resolve(__dirname, '../test/fixtures/responses');

// Delay between recordings (ms) to avoid rate limits
const DELAY_MS = 5000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getComponentFixtures(): string[] {
  return listAvailableComponents();
}

function getMissingComponents(): string[] {
  const allComponents = getComponentFixtures();
  const cachedResponses = existsSync(RESPONSES_DIR)
    ? readdirSync(RESPONSES_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => basename(f, '.json'))
    : [];

  return allComponents.filter((c) => !cachedResponses.includes(c));
}

async function recordComponent(
  fixture: NexusComponentFixture,
  provider: ILLMProvider
): Promise<boolean> {
  // Create recording provider that wraps the real provider
  const recordingProvider = new CachedLLMProvider({
    realProvider: provider,
    recordMode: true,
    responsesDir: RESPONSES_DIR,
  });

  // Create processor with the recording provider
  const processor = createComponentProcessor({
    llmProvider: recordingProvider,
  });

  // Capitalize first letter for component name
  const properName =
    fixture.name.charAt(0).toUpperCase() + fixture.name.slice(1);

  console.log(`\nRecording ${properName}...`);

  try {
    const result = await processor.process({
      filePath: fixture.componentPath,
      name: properName,
      sourceCode: fixture.sourceCode,
      storiesCode: fixture.storiesCode,
      storiesFilePath: fixture.storiesPath,
      framework: 'react',
      orgId: 'test-org',
    });

    if (result.type === 'success') {
      console.log(`✅ ${properName} recorded successfully`);
      return true;
    } else {
      console.error(`❌ ${properName} failed: ${result.error.message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${properName} error:`, error);
    return false;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const specificComponent = args[0];

  const provider = createProviderFromEnv();
  console.log(`Using ${provider.providerType} provider`);

  let componentNames: string[];

  if (specificComponent) {
    componentNames = [specificComponent];
  } else {
    componentNames = getMissingComponents();
    if (componentNames.length === 0) {
      console.log('All components already have cached responses!');
      console.log('Existing:', getComponentFixtures());
      return;
    }
    console.log(`Missing responses for: ${componentNames.join(', ')}`);
  }

  console.log(
    `\nWill record ${componentNames.length} component(s) with ${DELAY_MS}ms delay between each`
  );
  console.log('Press Ctrl+C to cancel\n');

  let recorded = 0;
  let failed = 0;

  for (const componentName of componentNames) {
    try {
      const fixture = loadNexusComponent(componentName);
      const success = await recordComponent(fixture, provider);
      if (success) {
        recorded++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${componentName} error loading fixture:`, error);
      failed++;
    }

    // Delay before next component (except for last one)
    if (componentNames.indexOf(componentName) < componentNames.length - 1) {
      console.log(`Waiting ${DELAY_MS}ms before next component...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n--- Recording Complete ---`);
  console.log(`Recorded: ${recorded}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
