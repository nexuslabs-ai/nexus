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
import { ComponentProcessor } from '../src/processor/index.js';
import { createProviderFromEnv } from '../src/utils/env-provider.js';
import { createLogger } from '../src/utils/logger.js';

import {
  type ComponentDefinition,
  COMPONENTS,
  findComponent,
  getComponentNames,
} from './components.js';

const logger = createLogger({ name: 'run-pipeline' });

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
    throw new Error(
      'NoopLLMProvider: Generation not available. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY.'
    );
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
        logger.error(
          `Invalid phase: ${value}. Must be: extract, generate, build, or full`
        );
        process.exit(1);
      }
      result.phase = value as Phase;
    } else if (arg === '--component') {
      const value = args[++i];
      if (!value) {
        logger.error('--component requires a value');
        process.exit(1);
      }
      result.component = value;
    } else if (arg === '--output') {
      const value = args[++i];
      if (!value) {
        logger.error('--output requires a value');
        process.exit(1);
      }
      result.output = value;
    }
  }

  return result;
}

function showHelp(): void {
  logger.info(`
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
  logger.info('\n' + '='.repeat(65));
  logger.info('  Context Engine Pipeline Runner');
  logger.info('='.repeat(65));
  logger.info('');
  logger.info(`Phase: ${phase}`);
  logger.info(`Output: ${output}`);
  logger.info(`Components: ${componentCount}`);
  logger.info('');
  logger.info('-'.repeat(65));
}

function printSummary(
  succeeded: string[],
  failed: Array<{ name: string; error: string }>,
  totalTimeMs: number
): void {
  logger.info('');
  logger.info('-'.repeat(65));
  logger.info('Summary');
  logger.info('-'.repeat(65));
  logger.info(
    `Processed: ${succeeded.length + failed.length}/${succeeded.length + failed.length}`
  );
  logger.info(`Succeeded: ${succeeded.length}`);
  logger.info(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    for (const f of failed) {
      logger.info(`  - ${f.name}: ${f.error}`);
    }
  }

  logger.info('');
  logger.info(`Total time: ${(totalTimeMs / 1000).toFixed(1)}s`);
  logger.info('');
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
  processor: ComponentProcessor,
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
      await processor.extractAndStore(input);
      timings.extraction = Math.round(performance.now() - start);
      return { success: true, timings };
    }

    if (phase === 'generate') {
      const start = performance.now();
      await processor.generateAndStore(component.name);
      timings.generation = Math.round(performance.now() - start);
      return { success: true, timings };
    }

    if (phase === 'build') {
      const start = performance.now();
      await processor.buildAndStore(component.name);
      timings.build = Math.round(performance.now() - start);
      return { success: true, timings };
    }

    // Full pipeline - all methods throw on error
    const extractStart = performance.now();
    await processor.extractAndStore(input);
    timings.extraction = Math.round(performance.now() - extractStart);

    const genStart = performance.now();
    await processor.generateAndStore(component.name);
    timings.generation = Math.round(performance.now() - genStart);

    const buildStart = performance.now();
    await processor.buildAndStore(component.name);
    timings.build = Math.round(performance.now() - buildStart);

    return { success: true, timings };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      timings,
      error: message,
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
      logger.error(
        'Error: GOOGLE_API_KEY environment variable is required for Gemini provider.'
      );
      logger.error('');
      logger.error(
        'Set CONTEXT_ENGINE_PROVIDER=gemini and GOOGLE_API_KEY in .env.test'
      );
      process.exit(1);
    } else if (provider !== 'gemini' && !hasAnthropicKey) {
      logger.error(
        'Error: ANTHROPIC_API_KEY environment variable is required for Anthropic provider.'
      );
      logger.error('');
      logger.error('Set it in your environment or use Gemini:');
      logger.error('  CONTEXT_ENGINE_PROVIDER=gemini');
      logger.error('  GOOGLE_API_KEY=your-key-here');
      logger.error('');
      logger.error('Or run extraction only (no LLM required):');
      logger.error('  tsx scripts/run-pipeline.ts --phase extract');
      process.exit(1);
    }

    logger.info(`Using provider: ${provider}`);
  }

  // Resolve components to process
  let components: ComponentDefinition[];
  if (args.component) {
    const component = findComponent(args.component);
    if (!component) {
      logger.error(`Unknown component: ${args.component}`);
      logger.error(`Available: ${getComponentNames().join(', ')}`);
      process.exit(1);
    }
    components = [component];
  } else {
    components = COMPONENTS;
  }

  // Resolve output directory
  const outputDir = resolve(process.cwd(), args.output);

  // Use env-based provider for phases that need LLM, noop provider for extract-only
  const llmProvider = needsLLM
    ? createProviderFromEnv()
    : new NoopLLMProvider();

  // Create processor with storeDir for persistent storage
  const processor = new ComponentProcessor({
    storeDir: outputDir,
    llmProvider,
    availableComponents: getComponentNames(),
  });

  // Print header
  printHeader(args.phase, args.output, components.length);

  // Process components
  const succeeded: string[] = [];
  const failed: Array<{ name: string; error: string }> = [];
  const startTime = performance.now();

  for (let i = 0; i < components.length; i++) {
    const component = components[i];

    logger.info(`Processing ${component.name}...`);

    const result = await processComponent(processor, component, args.phase);

    if (result.success) {
      succeeded.push(component.name);

      // Print timings
      if (result.timings.extraction !== undefined) {
        logger.info(
          `  [ok] Extraction (${formatMs(result.timings.extraction)})`
        );
      }
      if (result.timings.generation !== undefined) {
        logger.info(
          `  [ok] Generation (${formatMs(result.timings.generation)})`
        );
      }
      if (result.timings.build !== undefined && result.timings.build > 0) {
        logger.info(`  [ok] Build (${formatMs(result.timings.build)})`);
      }

      // Show saved location
      const kebabName = component.name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      logger.info(`  -> Saved to ${args.output}/${kebabName}.*.json`);
    } else {
      failed.push({
        name: component.name,
        error: result.error ?? 'Unknown error',
      });
      logger.error(`  [FAILED] ${result.error}`);
    }

    // Add delay between LLM calls if processing multiple components
    if (
      (args.phase === 'generate' || args.phase === 'full') &&
      i < components.length - 1
    ) {
      await new Promise((resolve) => setTimeout(resolve, LLM_DELAY_MS));
    }

    logger.info('');
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
  logger.error('Fatal error:', error as Error);
  process.exit(1);
});
