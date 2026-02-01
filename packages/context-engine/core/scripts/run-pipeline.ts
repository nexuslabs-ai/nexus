#!/usr/bin/env node
/**
 * Pipeline Runner Script
 *
 * CLI script that processes Nexus components through the extraction-generation
 * pipeline and saves outputs to a local directory.
 *
 * Usage:
 *   tsx scripts/run-pipeline.ts [options]
 *
 * Options:
 *   --phase <phase>      Run specific phase: extract, generate, build, full (default: full)
 *   --component <name>   Process single component by name
 *   --output <dir>       Output directory (default: .ce-output)
 *   --help               Show help
 *
 * Examples:
 *   tsx scripts/run-pipeline.ts                           # Full pipeline, all components
 *   tsx scripts/run-pipeline.ts --phase extract           # Extract only, all components
 *   tsx scripts/run-pipeline.ts --component Button        # Full pipeline, Button only
 *   tsx scripts/run-pipeline.ts --component Button --phase extract
 */

import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ILLMProvider, ToolCallResult } from '../src/generator/index.js';
import { FileStateStore, Pipeline } from '../src/pipeline/index.js';
import {
  isExtractSuccess,
  isProcessorSuccess,
} from '../src/processor/index.js';
import { createProviderFromEnv } from '../src/utils/env-provider.js';

import {
  type ComponentDefinition,
  COMPONENTS,
  findComponent,
  getComponentNames,
} from './components.js';

// =============================================================================
// Noop LLM Provider (for extraction-only mode)
// =============================================================================

/**
 * A noop LLM provider that throws when used.
 *
 * This allows the Pipeline/ComponentProcessor to be instantiated without
 * requiring an API key, while ensuring generation operations fail clearly
 * if attempted.
 */
class NoopLLMProvider implements ILLMProvider {
  readonly providerType = 'noop' as const;
  readonly modelId = 'noop';

  async generateWithToolCalling<T>(): Promise<ToolCallResult<T>> {
    return {
      type: 'failure',
      error:
        'NoopLLMProvider: Generation not available. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY.',
      retryable: false,
    };
  }
}

// =============================================================================
// Constants
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.test from packages/context-engine/ (parent of core/)
config({ path: resolve(__dirname, '../../.env.test') });

const DEFAULT_OUTPUT_DIR = '.ce-output';
const LLM_DELAY_MS = 2000; // Delay between LLM calls to avoid rate limiting

type Phase = 'extract' | 'generate' | 'build' | 'full';

// =============================================================================
// CLI Argument Parsing
// =============================================================================

interface CliArgs {
  phase: Phase;
  component?: string;
  output: string;
  help: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    phase: 'full',
    output: DEFAULT_OUTPUT_DIR,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--phase') {
      const value = args[++i];
      if (!value || !['extract', 'generate', 'build', 'full'].includes(value)) {
        console.error(
          `Invalid phase: ${value}. Must be: extract, generate, build, or full`
        );
        process.exit(1);
      }
      result.phase = value as Phase;
    } else if (arg === '--component') {
      const value = args[++i];
      if (!value) {
        console.error('--component requires a value');
        process.exit(1);
      }
      result.component = value;
    } else if (arg === '--output') {
      const value = args[++i];
      if (!value) {
        console.error('--output requires a value');
        process.exit(1);
      }
      result.output = value;
    }
  }

  return result;
}

function showHelp(): void {
  console.log(`
Context Engine Pipeline Runner

Usage:
  tsx scripts/run-pipeline.ts [options]

Options:
  --phase <phase>      Run specific phase: extract, generate, build, full (default: full)
  --component <name>   Process single component by name
  --output <dir>       Output directory (default: .ce-output)
  --help, -h           Show this help message

Phases:
  extract   Extract props, variants, dependencies from source code
  generate  Generate semantic metadata via LLM (requires prior extraction)
  build     Build manifest from stored extraction and generation
  full      Run all phases in sequence (default)

Examples:
  # Process all components through full pipeline
  tsx scripts/run-pipeline.ts

  # Extract only (fast, no LLM)
  tsx scripts/run-pipeline.ts --phase extract

  # Process single component
  tsx scripts/run-pipeline.ts --component Button

  # Extract single component
  tsx scripts/run-pipeline.ts --component Button --phase extract

  # Custom output directory
  tsx scripts/run-pipeline.ts --output ./my-output

Available Components:
  ${getComponentNames().join(', ')}

Environment Variables:
  CONTEXT_ENGINE_PROVIDER   Provider to use: 'anthropic' (default) or 'gemini'
  ANTHROPIC_API_KEY         Required for Anthropic provider
  GOOGLE_API_KEY            Required for Gemini provider

  Config is loaded from packages/context-engine/.env.test
`);
}

// =============================================================================
// Console Formatting
// =============================================================================

function printHeader(
  phase: Phase,
  output: string,
  componentCount: number
): void {
  console.log('\n' + '='.repeat(65));
  console.log('  Context Engine Pipeline Runner');
  console.log('='.repeat(65));
  console.log();
  console.log(`Phase: ${phase}`);
  console.log(`Output: ${output}`);
  console.log(`Components: ${componentCount}`);
  console.log();
  console.log('-'.repeat(65));
}

function printSummary(
  succeeded: string[],
  failed: Array<{ name: string; error: string }>,
  totalTimeMs: number
): void {
  console.log();
  console.log('-'.repeat(65));
  console.log('Summary');
  console.log('-'.repeat(65));
  console.log(
    `Processed: ${succeeded.length + failed.length}/${succeeded.length + failed.length}`
  );
  console.log(`Succeeded: ${succeeded.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    for (const f of failed) {
      console.log(`  - ${f.name}: ${f.error}`);
    }
  }

  console.log();
  console.log(`Total time: ${(totalTimeMs / 1000).toFixed(1)}s`);
  console.log();
}

function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${Math.round(ms)}ms`;
}

// =============================================================================
// File Reading
// =============================================================================

async function readComponentFile(component: ComponentDefinition): Promise<{
  sourceCode: string;
  storiesCode?: string;
  filePath: string;
  storiesFilePath?: string;
}> {
  const filePath = resolve(__dirname, component.path);
  const sourceCode = await readFile(filePath, 'utf-8');

  let storiesCode: string | undefined;
  let storiesFilePath: string | undefined;

  if (component.storiesPath) {
    try {
      storiesFilePath = resolve(__dirname, component.storiesPath);
      storiesCode = await readFile(storiesFilePath, 'utf-8');
    } catch {
      // Stories file is optional
    }
  }

  return { sourceCode, storiesCode, filePath, storiesFilePath };
}

// =============================================================================
// Pipeline Processing
// =============================================================================

async function processComponent(
  pipeline: Pipeline,
  component: ComponentDefinition,
  phase: Phase
): Promise<{
  success: boolean;
  timings: Record<string, number>;
  error?: string;
}> {
  const timings: Record<string, number> = {};

  try {
    const { sourceCode, storiesCode, filePath, storiesFilePath } =
      await readComponentFile(component);

    const input = {
      orgId: 'nexus',
      name: component.name,
      sourceCode,
      storiesCode,
      filePath,
      storiesFilePath,
      framework: 'react' as const,
    };

    if (phase === 'extract') {
      const start = performance.now();
      const result = await pipeline.extractAndSave(input);
      timings.extraction = Math.round(performance.now() - start);

      if (!isExtractSuccess(result)) {
        return {
          success: false,
          timings,
          error: result.error,
        };
      }

      return { success: true, timings };
    }

    if (phase === 'generate') {
      const start = performance.now();
      const result = await pipeline.generateFromStored(component.name);
      timings.generation = Math.round(performance.now() - start);

      if (!isProcessorSuccess(result)) {
        return {
          success: false,
          timings,
          error: result.error,
        };
      }

      return { success: true, timings };
    }

    if (phase === 'build') {
      const start = performance.now();
      const result = await pipeline.buildFromStored(component.name);
      timings.build = Math.round(performance.now() - start);

      if (result.type === 'failure') {
        return {
          success: false,
          timings,
          error: result.error,
        };
      }

      return { success: true, timings };
    }

    // Full pipeline
    const extractStart = performance.now();
    const extractResult = await pipeline.extractAndSave(input);
    timings.extraction = Math.round(performance.now() - extractStart);

    if (!isExtractSuccess(extractResult)) {
      return {
        success: false,
        timings,
        error: extractResult.error,
      };
    }

    const genStart = performance.now();
    const result = await pipeline.generateFromStored(component.name);
    timings.generation = Math.round(performance.now() - genStart);

    if (!isProcessorSuccess(result)) {
      return {
        success: false,
        timings,
        error: result.error,
      };
    }

    // Build timing is included in generateFromStored
    timings.build = 0;

    return { success: true, timings };
  } catch (error) {
    return {
      success: false,
      timings,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Validate API key for phases that need it
  const needsLLM = args.phase === 'generate' || args.phase === 'full';
  if (needsLLM) {
    const provider =
      process.env.CONTEXT_ENGINE_PROVIDER?.toLowerCase() ?? 'anthropic';
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasGeminiKey = !!process.env.GOOGLE_API_KEY;

    if (provider === 'gemini' && !hasGeminiKey) {
      console.error(
        'Error: GOOGLE_API_KEY environment variable is required for Gemini provider.'
      );
      console.error('');
      console.error(
        'Set CONTEXT_ENGINE_PROVIDER=gemini and GOOGLE_API_KEY in .env.test'
      );
      process.exit(1);
    } else if (provider !== 'gemini' && !hasAnthropicKey) {
      console.error(
        'Error: ANTHROPIC_API_KEY environment variable is required for Anthropic provider.'
      );
      console.error('');
      console.error('Set it in your environment or use Gemini:');
      console.error('  CONTEXT_ENGINE_PROVIDER=gemini');
      console.error('  GOOGLE_API_KEY=your-key-here');
      console.error('');
      console.error('Or run extraction only (no LLM required):');
      console.error('  tsx scripts/run-pipeline.ts --phase extract');
      process.exit(1);
    }

    console.log(`Using provider: ${provider}`);
  }

  // Resolve components to process
  let components: ComponentDefinition[];
  if (args.component) {
    const component = findComponent(args.component);
    if (!component) {
      console.error(`Unknown component: ${args.component}`);
      console.error(`Available: ${getComponentNames().join(', ')}`);
      process.exit(1);
    }
    components = [component];
  } else {
    components = COMPONENTS;
  }

  // Resolve output directory
  const outputDir = resolve(process.cwd(), args.output);

  // Create pipeline
  const store = new FileStateStore(outputDir);

  // Use env-based provider for phases that need LLM, noop provider for extract-only
  const llmProvider = needsLLM
    ? createProviderFromEnv()
    : new NoopLLMProvider();

  const pipelineConfig = {
    llmProvider,
    availableComponents: getComponentNames(),
  };

  const pipeline = Pipeline.createWithStore(pipelineConfig, store);

  // Print header
  printHeader(args.phase, args.output, components.length);

  // Process components
  const succeeded: string[] = [];
  const failed: Array<{ name: string; error: string }> = [];
  const startTime = performance.now();

  for (let i = 0; i < components.length; i++) {
    const component = components[i];

    console.log(`Processing ${component.name}...`);

    const result = await processComponent(pipeline, component, args.phase);

    if (result.success) {
      succeeded.push(component.name);

      // Print timings
      if (result.timings.extraction !== undefined) {
        console.log(
          `  [ok] Extraction (${formatMs(result.timings.extraction)})`
        );
      }
      if (result.timings.generation !== undefined) {
        console.log(
          `  [ok] Generation (${formatMs(result.timings.generation)})`
        );
      }
      if (result.timings.build !== undefined && result.timings.build > 0) {
        console.log(`  [ok] Build (${formatMs(result.timings.build)})`);
      }

      // Show saved location
      const kebabName = component.name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      console.log(`  -> Saved to ${args.output}/${kebabName}.*.json`);
    } else {
      failed.push({
        name: component.name,
        error: result.error ?? 'Unknown error',
      });
      console.log(`  [FAILED] ${result.error}`);
    }

    // Add delay between LLM calls if processing multiple components
    if (
      (args.phase === 'generate' || args.phase === 'full') &&
      i < components.length - 1
    ) {
      await new Promise((resolve) => setTimeout(resolve, LLM_DELAY_MS));
    }

    console.log();
  }

  // Print summary
  const totalTimeMs = performance.now() - startTime;
  printSummary(succeeded, failed, totalTimeMs);

  // Exit with error if any failed
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
