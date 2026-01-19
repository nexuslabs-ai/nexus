/**
 * Script to record LLM responses for component fixtures
 *
 * Usage: yarn test:record-all [component]
 *
 * Records responses one at a time with delays to avoid rate limits.
 * If no component specified, records all missing components.
 */

import { config } from 'dotenv';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAnthropicProvider } from '../src/generator/anthropic-provider.js';
import { createGeminiProvider } from '../src/generator/gemini-provider.js';
import type { ILLMProvider } from '../src/generator/types.js';
import { createComponentProcessor } from '../src/processor/component-processor.js';
import { CachedLLMProvider } from '../test/providers/cached-llm-provider.js';

// Load .env.test from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env.test') });

const FIXTURES_DIR = resolve(__dirname, '../test/fixtures/components/shadcn');
const RESPONSES_DIR = resolve(__dirname, '../test/fixtures/responses');

// Delay between recordings (ms) to avoid rate limits
const DELAY_MS = 5000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getProvider(): ILLMProvider {
  const googleKey = process.env.GOOGLE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (googleKey) {
    console.log('Using Gemini provider');
    return createGeminiProvider({ apiKey: googleKey });
  }
  if (anthropicKey) {
    console.log('Using Anthropic provider');
    return createAnthropicProvider({ apiKey: anthropicKey });
  }
  throw new Error('No API key found. Set GOOGLE_API_KEY or ANTHROPIC_API_KEY');
}

function getComponentFixtures(): string[] {
  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.tsx'));
  return files.map((f) => basename(f, '.tsx'));
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
  componentName: string,
  provider: ILLMProvider
): Promise<boolean> {
  const fixturePath = join(FIXTURES_DIR, `${componentName}.tsx`);

  if (!existsSync(fixturePath)) {
    console.error(`Fixture not found: ${fixturePath}`);
    return false;
  }

  const sourceCode = readFileSync(fixturePath, 'utf-8');

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

  console.log(`\nRecording ${componentName}...`);

  try {
    const result = await processor.process({
      filePath: fixturePath,
      name: componentName.charAt(0).toUpperCase() + componentName.slice(1),
      sourceCode,
      framework: 'react',
      orgId: 'test-org',
    });

    if (result.type === 'success') {
      console.log(`✅ ${componentName} recorded successfully`);
      return true;
    } else {
      console.error(`❌ ${componentName} failed: ${result.error.message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${componentName} error:`, error);
    return false;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const specificComponent = args[0];

  const provider = getProvider();

  let components: string[];

  if (specificComponent) {
    components = [specificComponent];
  } else {
    components = getMissingComponents();
    if (components.length === 0) {
      console.log('All components already have cached responses!');
      console.log('Existing:', getComponentFixtures());
      return;
    }
    console.log(`Missing responses for: ${components.join(', ')}`);
  }

  console.log(
    `\nWill record ${components.length} component(s) with ${DELAY_MS}ms delay between each`
  );
  console.log('Press Ctrl+C to cancel\n');

  let recorded = 0;
  let failed = 0;

  for (const component of components) {
    const success = await recordComponent(component, provider);
    if (success) {
      recorded++;
    } else {
      failed++;
    }

    // Delay before next component (except for last one)
    if (components.indexOf(component) < components.length - 1) {
      console.log(`Waiting ${DELAY_MS}ms before next component...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n--- Recording Complete ---`);
  console.log(`Recorded: ${recorded}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
