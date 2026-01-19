/**
 * Response Recorder
 *
 * Utilities for recording and loading LLM responses for deterministic testing.
 *
 * ## Recording Modes
 *
 * The testing infrastructure supports three modes controlled by environment variables:
 *
 * ### RECORD_RESPONSES=true
 * Records real LLM responses to disk for future playback.
 * Requires ANTHROPIC_API_KEY or GOOGLE_API_KEY to be set.
 *
 * ```bash
 * RECORD_RESPONSES=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ### USE_CACHED=true
 * Uses cached responses instead of calling real LLM (faster, deterministic).
 * Falls back to real LLM if no cached response exists and API key is available.
 *
 * ```bash
 * USE_CACHED=true yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ### VALIDATE_LLM=true
 * Calls real LLM AND compares to cached baseline (regression detection).
 * Reports structural deviations between cached and real responses.
 *
 * ```bash
 * VALIDATE_LLM=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ## File Structure
 *
 * Recorded responses are stored in `test/fixtures/responses/{component}.json`:
 *
 * ```json
 * {
 *   "componentName": "Button",
 *   "response": { ... },
 *   "recordedAt": "2025-01-19T10:00:00.000Z",
 *   "provider": "anthropic",
 *   "model": "claude-sonnet-4-20250514",
 *   "inputHash": "abc123...",
 *   "promptSummary": "Generate metadata for Button component..."
 * }
 * ```
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { LLMCompletionResponse } from '../../src/generator/types.js';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RESPONSES_DIR = resolve(__dirname, '../fixtures/responses');

/**
 * Recorded response with metadata (legacy format for backwards compatibility)
 *
 * @deprecated Use CachedResponseRecord from cached-llm-provider.ts
 */
export interface RecordedResponse {
  /** Component name this response is for */
  componentName: string;

  /** The LLM completion response */
  response: LLMCompletionResponse;

  /** Recording timestamp */
  recordedAt: string;

  /** Prompt used to generate this response (for reference) */
  promptSummary: string;
}

/**
 * Extended response record with full metadata
 */
export interface ExtendedRecordedResponse extends RecordedResponse {
  /** Provider that generated this response */
  provider?: string;

  /** Model used for generation */
  model?: string;

  /** Hash of the input prompt for cache key matching */
  inputHash?: string;
}

// =============================================================================
// Environment Mode Detection
// =============================================================================

/**
 * Check if recording mode is enabled
 */
export function isRecordingMode(): boolean {
  return process.env.RECORD_RESPONSES === 'true';
}

/**
 * Check if cached playback mode is enabled
 */
export function isCachedMode(): boolean {
  return process.env.USE_CACHED === 'true';
}

/**
 * Check if validation mode is enabled
 */
export function isValidationMode(): boolean {
  return process.env.VALIDATE_LLM === 'true';
}

/**
 * Get the current testing mode
 */
export function getTestingMode(): 'record' | 'cached' | 'validate' | 'real' {
  if (isRecordingMode()) return 'record';
  if (isValidationMode()) return 'validate';
  if (isCachedMode()) return 'cached';
  return 'real';
}

// =============================================================================
// Response Saving/Loading
// =============================================================================

/**
 * Create SHA-256 hash of content
 */
export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Save a response to the fixtures directory
 *
 * @param componentName - Component name (used as filename)
 * @param response - LLM completion response
 * @param options - Additional metadata options
 */
export function saveRecordedResponse(
  componentName: string,
  response: LLMCompletionResponse,
  options: {
    promptSummary?: string;
    provider?: string;
    inputHash?: string;
  } = {}
): string {
  // Ensure directory exists
  if (!existsSync(RESPONSES_DIR)) {
    mkdirSync(RESPONSES_DIR, { recursive: true });
  }

  const record: ExtendedRecordedResponse = {
    componentName,
    response,
    recordedAt: new Date().toISOString(),
    promptSummary:
      options.promptSummary ??
      `Generate metadata for ${componentName} component`,
    provider:
      (options.provider ?? response.model.includes('claude'))
        ? 'anthropic'
        : 'gemini',
    model: response.model,
    inputHash: options.inputHash ?? '',
  };

  const filePath = join(RESPONSES_DIR, `${componentName.toLowerCase()}.json`);
  writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');

  return filePath;
}

/**
 * Load a recorded response from fixtures
 *
 * @param componentName - Component name to load
 * @returns LLM completion response
 * @throws Error if response file not found
 */
export function loadRecordedResponse(
  componentName: string
): LLMCompletionResponse {
  const filePath = join(RESPONSES_DIR, `${componentName.toLowerCase()}.json`);

  if (!existsSync(filePath)) {
    throw new Error(`Recorded response not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const recorded: RecordedResponse = JSON.parse(content);

  return recorded.response;
}

/**
 * Load a recorded response with full metadata
 */
export function loadRecordedResponseWithMeta(
  componentName: string
): ExtendedRecordedResponse | null {
  const filePath = join(RESPONSES_DIR, `${componentName.toLowerCase()}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Check if a recorded response exists
 */
export function hasRecordedResponse(componentName: string): boolean {
  const filePath = join(RESPONSES_DIR, `${componentName.toLowerCase()}.json`);
  return existsSync(filePath);
}

/**
 * Get all available recorded responses
 */
export function getAvailableResponses(): string[] {
  if (!existsSync(RESPONSES_DIR)) {
    return [];
  }

  return readdirSync(RESPONSES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

/**
 * Get the responses directory path
 */
export function getResponsesDir(): string {
  return RESPONSES_DIR;
}

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Semantic comparison result
 */
export interface SemanticComparisonResult {
  /** Overall similarity score (0-1) */
  similarity: number;

  /** Whether the comparison passed threshold */
  passed: boolean;

  /** List of differences found */
  differences: Array<{
    field: string;
    cached: unknown;
    real: unknown;
    severity: 'info' | 'warning' | 'error';
  }>;
}

/**
 * Compare two LLM responses for semantic similarity
 *
 * Uses structural comparison rather than exact text matching
 * since LLM outputs are non-deterministic.
 */
export function compareResponsesSemantically(
  cached: LLMCompletionResponse,
  real: LLMCompletionResponse,
  componentName: string
): SemanticComparisonResult {
  const differences: SemanticComparisonResult['differences'] = [];
  let matchCount = 0;
  const totalFields = 6;

  // Parse JSON from both responses
  let cachedParsed: Record<string, unknown>;
  let realParsed: Record<string, unknown>;

  try {
    cachedParsed = JSON.parse(cached.text);
  } catch {
    return {
      similarity: 0,
      passed: false,
      differences: [
        {
          field: 'cached.text',
          cached: 'parse error',
          real: null,
          severity: 'error',
        },
      ],
    };
  }

  try {
    realParsed = JSON.parse(real.text);
  } catch {
    return {
      similarity: 0,
      passed: false,
      differences: [
        {
          field: 'real.text',
          cached: null,
          real: 'parse error',
          severity: 'error',
        },
      ],
    };
  }

  // Compare key fields
  const fieldsToCompare = [
    'description',
    'tier',
    'patterns',
    'tokens',
    'examples',
    'relatedComponents',
  ];

  for (const field of fieldsToCompare) {
    const cachedValue = cachedParsed[field];
    const realValue = realParsed[field];

    // Both undefined - match
    if (cachedValue === undefined && realValue === undefined) {
      matchCount++;
      continue;
    }

    // One undefined - difference
    if (cachedValue === undefined || realValue === undefined) {
      differences.push({
        field,
        cached: cachedValue,
        real: realValue,
        severity: 'warning',
      });
      continue;
    }

    // For arrays, check length similarity
    if (Array.isArray(cachedValue) && Array.isArray(realValue)) {
      const lengthDiff = Math.abs(cachedValue.length - realValue.length);
      if (lengthDiff <= 2) {
        matchCount++;
      } else {
        differences.push({
          field: `${field}.length`,
          cached: cachedValue.length,
          real: realValue.length,
          severity: 'warning',
        });
      }
      continue;
    }

    // For strings, check if both are non-empty
    if (typeof cachedValue === 'string' && typeof realValue === 'string') {
      if (cachedValue.length > 0 && realValue.length > 0) {
        matchCount++;
      } else {
        differences.push({
          field,
          cached: `[${cachedValue.length} chars]`,
          real: `[${realValue.length} chars]`,
          severity: 'warning',
        });
      }
      continue;
    }

    // Same value
    if (cachedValue === realValue) {
      matchCount++;
    }
  }

  // Check description contains component name
  const realDesc = String(realParsed['description'] ?? '').toLowerCase();
  if (!realDesc.includes(componentName.toLowerCase())) {
    differences.push({
      field: 'description.componentName',
      cached: `contains "${componentName}"`,
      real: realDesc.substring(0, 50) + '...',
      severity: 'warning',
    });
  }

  const similarity = matchCount / totalFields;
  const passed =
    similarity >= 0.7 && !differences.some((d) => d.severity === 'error');

  return { similarity, passed, differences };
}

// =============================================================================
// CLI Entry Point (for manual recording)
// =============================================================================

/**
 * CLI usage:
 *
 * ```bash
 * # Record a specific component
 * ANTHROPIC_API_KEY=xxx npx tsx test/utils/response-recorder.ts button
 *
 * # Record all shadcn fixtures
 * ANTHROPIC_API_KEY=xxx npx tsx test/utils/response-recorder.ts --all
 * ```
 */
async function main() {
  const args = process.argv.slice(2);
  const componentName = args[0];

  if (!componentName) {
    console.log('Response Recorder - Save real LLM responses for testing\n');
    console.log('Usage:');
    console.log('  npx tsx test/utils/response-recorder.ts <component-name>');
    console.log('  npx tsx test/utils/response-recorder.ts --all\n');
    console.log('Environment:');
    console.log('  ANTHROPIC_API_KEY or GOOGLE_API_KEY required\n');
    console.log(
      'Available cached responses:',
      getAvailableResponses().join(', ') || 'none'
    );
    process.exit(0);
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  if (!anthropicKey && !googleKey) {
    console.error(
      'Error: ANTHROPIC_API_KEY or GOOGLE_API_KEY environment variable is required'
    );
    process.exit(1);
  }

  if (componentName === '--all') {
    console.log('Recording all components...');
    console.log(
      'Use RECORD_RESPONSES=true yarn test test/integration/real-llm.test.ts instead'
    );
    process.exit(0);
  }

  console.log(`Recording response for component: ${componentName}`);
  console.log(`Provider: ${anthropicKey ? 'Anthropic' : 'Gemini'}`);
  console.log('');
  console.log('To record responses, run:');
  console.log(
    '  RECORD_RESPONSES=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts'
  );
  console.log('');
  console.log('Or use USE_CACHED=true to run with cached responses:');
  console.log('  USE_CACHED=true yarn test test/integration/real-llm.test.ts');
}

// Only run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}
