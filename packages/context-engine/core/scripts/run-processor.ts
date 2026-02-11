#!/usr/bin/env node
/**
 * Processor Runner Script
 *
 * CLI script that processes Nexus components through the extraction-generation
 * processor and saves outputs to a local directory.
 *
 * Usage:
 *   tsx scripts/run-processor.ts --phase <phase> [options]
 *
 * Options:
 *   --phase <phase>      Required. Phase to run: extract, generate, build, full
 *   --component <name>   Process single component by name
 *   --output <dir>       Output directory (default: .ce-output)
 *   --help               Show help
 *
 * Examples:
 *   tsx scripts/run-processor.ts --phase full              # Full processing, all components
 *   tsx scripts/run-processor.ts --phase extract           # Extract only, all components
 *   tsx scripts/run-processor.ts --phase full --component Button  # Full processing, Button only
 *   tsx scripts/run-processor.ts --phase extract --component Button
 */

import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ComponentProcessor } from '../src/processor/index.js';
import { createProviderFromEnv } from '../src/utils/env-provider.js';
import { createLogger } from '../src/utils/logger.js';

import {
  type ComponentDefinition,
  COMPONENTS,
  findComponent,
  getComponentNames,
} from './components.js';

const logger = createLogger({ name: 'run-processor' });

// =============================================================================
// Constants
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.test from packages/context-engine/core/
config({ path: resolve(__dirname, '../.env.test') });

const DEFAULT_OUTPUT_DIR = '.ce-output';
const LLM_DELAY_MS = 2000; // Delay between LLM calls to avoid rate limiting

type Phase = 'extract' | 'generate' | 'build' | 'full';

// =============================================================================
// CLI Argument Parsing
// =============================================================================

interface CliArgs {
  phase?: Phase;
  component?: string;
  output: string;
  help: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
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
Context Engine Processor Runner

Usage:
  tsx scripts/run-processor.ts --phase <phase> [options]

Options:
  --phase <phase>      Required. Phase to run: extract, generate, build, full
  --component <name>   Process single component by name
  --output <dir>       Output directory (default: .ce-output)
  --help, -h           Show this help message

Phases:
  extract   Extract props, variants, dependencies from source code
  generate  Generate semantic metadata via LLM (requires prior extraction)
  build     Build manifest from stored extraction and generation
  full      Full pipeline via processAndStore (extract → generate → build)

Examples:
  # Process all components through full processor
  tsx scripts/run-processor.ts

  # Extract only (fast, no LLM)
  tsx scripts/run-processor.ts --phase extract

  # Process single component
  tsx scripts/run-processor.ts --component Button

  # Extract single component
  tsx scripts/run-processor.ts --component Button --phase extract

  # Custom output directory
  tsx scripts/run-processor.ts --output ./my-output

Available Components:
  ${getComponentNames().join(', ')}

Environment Variables:
  CONTEXT_ENGINE_PROVIDER   Provider to use: 'anthropic' (default) or 'gemini'
  LLM_API_KEY               API key for the selected provider

  Config is loaded from packages/context-engine/core/.env.test
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
  logger.info('  Context Engine Processor Runner');
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
// Component Processing
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
      availableComponents: getComponentNames(),
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

    // Full processing via processAndStore
    const start = performance.now();
    await processor.processAndStore(input);
    timings.total = Math.round(performance.now() - start);
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

  // Validate that --phase is provided
  if (!args.phase) {
    logger.error('Error: --phase is required.');
    logger.error('');
    logger.error('Usage: tsx scripts/run-processor.ts --phase <phase>');
    logger.error('Phases: extract, generate, build, full');
    logger.error('');
    logger.error('Run with --help for more information.');
    process.exit(1);
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

  // Create processor with storeDir for persistent storage
  const processor = new ComponentProcessor({
    storeDir: outputDir,
    llmProvider: createProviderFromEnv(),
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
      if (result.timings.total !== undefined) {
        logger.info(`  [ok] Full pipeline (${formatMs(result.timings.total)})`);
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

  // Exit with appropriate code
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  logger.error('Fatal error:', error as Error);
  process.exit(1);
});
