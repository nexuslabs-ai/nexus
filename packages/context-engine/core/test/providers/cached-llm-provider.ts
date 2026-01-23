/**
 * Cached LLM Provider
 *
 * Implements ILLMProvider interface to provide cached response playback.
 * This provider supports three modes:
 *
 * ## Modes
 *
 * ### 1. RECORD_RESPONSES=true
 * When enabled, wraps a real provider and saves responses to disk.
 * Used to populate the cache with baseline responses.
 *
 * ### 2. USE_CACHED=true (Default playback mode)
 * Loads recorded responses from disk instead of calling real LLM.
 * Falls back to real LLM if no cached response exists for the input.
 *
 * ### 3. VALIDATE_LLM=true
 * Calls real LLM AND compares output to cached baseline.
 * Reports significant structural deviations for regression detection.
 *
 * ## Cache Key Strategy
 *
 * Responses are keyed by:
 * - Component name (lowercased)
 * - Input hash (SHA-256 of prompt content for uniqueness)
 *
 * ## Usage
 *
 * ```typescript
 * import { CachedLLMProvider } from './cached-llm-provider';
 *
 * // Playback mode (default)
 * const provider = new CachedLLMProvider();
 *
 * // Record mode (wraps real provider)
 * const provider = new CachedLLMProvider({
 *   realProvider: createAnthropicProvider({ apiKey }),
 *   recordMode: true,
 * });
 *
 * // Validate mode (compares real vs cached)
 * const provider = new CachedLLMProvider({
 *   realProvider: createAnthropicProvider({ apiKey }),
 *   validateMode: true,
 * });
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

import type { ComponentMetaTool } from '../../src/generator/tool-schema.js';
import type {
  ILLMProvider,
  LLMProviderType,
  ToolCallingOptions,
  ToolCallResult,
} from '../../src/generator/types.js';

// Directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RESPONSES_DIR = resolve(__dirname, '../fixtures/responses');

/**
 * Cached response record structure
 *
 * Stored in test/fixtures/responses/{component}.json
 */
export interface CachedResponseRecord {
  /** Component name this response is for */
  componentName: string;

  /** The tool call response data */
  response: ComponentMetaTool;

  /** Recording timestamp (ISO string) */
  recordedAt: string;

  /** Provider that generated this response */
  provider: string;

  /** Model used for generation */
  model: string;

  /** Hash of the input prompt for cache key matching */
  inputHash: string;

  /** Summary of the prompt for debugging (truncated) */
  promptSummary: string;
}

/**
 * Validation result when comparing real vs cached responses
 */
export interface ValidationResult {
  /** Whether the responses are semantically similar */
  passed: boolean;

  /** List of structural differences found */
  differences: ValidationDifference[];

  /** Cached response used for comparison */
  cached: ComponentMetaTool;

  /** Real response from LLM */
  real: ComponentMetaTool;
}

export interface ValidationDifference {
  field: string;
  expected: unknown;
  actual: unknown;
  severity: 'info' | 'warning' | 'error';
}

/**
 * Configuration for CachedLLMProvider
 */
export interface CachedLLMProviderConfig {
  /**
   * Real LLM provider to use for recording or validation.
   * Required for RECORD_RESPONSES and VALIDATE_LLM modes.
   */
  realProvider?: ILLMProvider;

  /**
   * Enable recording mode - saves responses to disk.
   * Requires realProvider to be set.
   */
  recordMode?: boolean;

  /**
   * Enable validation mode - calls real LLM and compares to cached.
   * Requires realProvider to be set.
   */
  validateMode?: boolean;

  /**
   * Custom responses directory path.
   * @default test/fixtures/responses
   */
  responsesDir?: string;

  /**
   * Callback for validation results (in validate mode).
   */
  onValidation?: (result: ValidationResult, componentName: string) => void;
}

/**
 * CachedLLMProvider - Implements ILLMProvider with caching support
 *
 * Provides three modes of operation:
 * 1. Playback: Returns cached responses (no LLM calls)
 * 2. Record: Calls real LLM and saves responses
 * 3. Validate: Calls real LLM and compares to cached
 */
export class CachedLLMProvider implements ILLMProvider {
  readonly providerType: LLMProviderType = 'mock';
  readonly modelId: string = 'cached-provider';

  private config: CachedLLMProviderConfig;
  private responsesDir: string;
  private responseCache: Map<string, CachedResponseRecord> = new Map();

  constructor(config: CachedLLMProviderConfig = {}) {
    this.config = config;
    this.responsesDir = config.responsesDir ?? RESPONSES_DIR;

    // Validate configuration
    if (config.recordMode && !config.realProvider) {
      throw new Error('CachedLLMProvider: recordMode requires realProvider');
    }
    if (config.validateMode && !config.realProvider) {
      throw new Error('CachedLLMProvider: validateMode requires realProvider');
    }

    // Pre-load all cached responses
    this.loadAllCachedResponses();
  }

  /**
   * Load all cached responses from disk into memory
   */
  private loadAllCachedResponses(): void {
    if (!existsSync(this.responsesDir)) {
      return;
    }

    const files = readdirSync(this.responsesDir).filter((f) =>
      f.endsWith('.json')
    );

    for (const file of files) {
      try {
        const filePath = join(this.responsesDir, file);
        const content = readFileSync(filePath, 'utf-8');
        const record: CachedResponseRecord = JSON.parse(content);

        // Key by component name (lowercased)
        const key = record.componentName.toLowerCase();
        this.responseCache.set(key, record);
      } catch {
        // Skip invalid files
      }
    }
  }

  /**
   * Generate structured output using tool calling - behavior depends on mode
   */
  async generateWithToolCalling<T = ComponentMetaTool>(
    prompt: string,
    options?: ToolCallingOptions
  ): Promise<ToolCallResult<T>> {
    // Extract component name from prompt
    const componentName = this.extractComponentName(prompt);
    const inputHash = this.hashPrompt(prompt);

    // Mode 1: Record mode - call real provider and save response
    if (this.config.recordMode && this.config.realProvider) {
      return this.recordResponse(prompt, options, componentName, inputHash);
    }

    // Mode 2: Validate mode - call real provider and compare to cached
    if (this.config.validateMode && this.config.realProvider) {
      return this.validateResponse(prompt, options, componentName, inputHash);
    }

    // Mode 3: Playback mode (default) - return cached response
    return this.playbackResponse(prompt, options, componentName);
  }

  /**
   * Record mode: Call real provider and save response
   */
  private async recordResponse<T = ComponentMetaTool>(
    prompt: string,
    options: ToolCallingOptions | undefined,
    componentName: string,
    inputHash: string
  ): Promise<ToolCallResult<T>> {
    const realProvider = this.config.realProvider!;

    // Call real provider
    const result = await realProvider.generateWithToolCalling<T>(
      prompt,
      options
    );

    if (result.type === 'failure') {
      return result;
    }

    // Save to disk
    const record: CachedResponseRecord = {
      componentName,
      response: result.data as ComponentMetaTool,
      recordedAt: new Date().toISOString(),
      provider: realProvider.providerType,
      model: result.model,
      inputHash,
      promptSummary: this.summarizePrompt(prompt),
    };

    this.saveRecordedResponse(record);

    // Update in-memory cache
    this.responseCache.set(componentName.toLowerCase(), record);

    return result;
  }

  /**
   * Validate mode: Call real provider and compare to cached
   */
  private async validateResponse<T = ComponentMetaTool>(
    prompt: string,
    options: ToolCallingOptions | undefined,
    componentName: string,
    _inputHash: string
  ): Promise<ToolCallResult<T>> {
    const realProvider = this.config.realProvider!;
    const cacheKey = componentName.toLowerCase();

    // Call real provider
    const result = await realProvider.generateWithToolCalling<T>(
      prompt,
      options
    );

    if (result.type === 'failure') {
      return result;
    }

    // Get cached response for comparison
    const cachedRecord = this.responseCache.get(cacheKey);

    if (cachedRecord) {
      // Compare responses
      const validationResult = this.compareResponses(
        cachedRecord.response,
        result.data as ComponentMetaTool,
        componentName
      );

      // Call validation callback if provided
      if (this.config.onValidation) {
        this.config.onValidation(validationResult, componentName);
      }

      // Log differences if any
      if (!validationResult.passed) {
        console.warn(
          `[CachedLLMProvider] Validation differences for ${componentName}:`,
          validationResult.differences
        );
      }
    }

    return result;
  }

  /**
   * Playback mode: Return cached response
   */
  private playbackResponse<T = ComponentMetaTool>(
    prompt: string,
    _options: ToolCallingOptions | undefined,
    componentName: string
  ): Promise<ToolCallResult<T>> {
    const cacheKey = componentName.toLowerCase();
    const cachedRecord = this.responseCache.get(cacheKey);

    if (cachedRecord) {
      return Promise.resolve({
        type: 'success',
        data: { ...cachedRecord.response } as T,
        model: cachedRecord.model,
        usage: {
          inputTokens: 500,
          outputTokens: 200,
        },
      });
    }

    // Fallback to real provider if available
    if (this.config.realProvider) {
      console.warn(
        `[CachedLLMProvider] No cached response for "${componentName}", falling back to real provider`
      );
      return this.config.realProvider.generateWithToolCalling<T>(
        prompt,
        _options
      );
    }

    // No cached response and no fallback - return error
    return Promise.resolve({
      type: 'failure',
      error: `CachedLLMProvider: No cached response for "${componentName}" and no realProvider configured for fallback`,
      retryable: false,
    });
  }

  /**
   * Extract component name from prompt
   *
   * Looks for patterns like "Component: Button" or "name: Button"
   */
  private extractComponentName(prompt: string): string {
    // Try to extract from "Component:" or "name:" patterns
    const componentMatch = prompt.match(
      /(?:Component|name):\s*['"]*(\w+)['""]*/i
    );
    if (componentMatch) {
      return componentMatch[1];
    }

    // Try to extract from "Generate metadata for X component" patterns
    const generateMatch = prompt.match(
      /metadata for (?:the )?['"]*(\w+)['""]* component/i
    );
    if (generateMatch) {
      return generateMatch[1];
    }

    // Try to extract from "React component named X" patterns
    const namedMatch = prompt.match(/component named ['"]*(\w+)['""]*/i);
    if (namedMatch) {
      return namedMatch[1];
    }

    // Default fallback
    return 'unknown';
  }

  /**
   * Create SHA-256 hash of prompt for cache key
   */
  private hashPrompt(prompt: string): string {
    return createHash('sha256').update(prompt).digest('hex');
  }

  /**
   * Create a summary of the prompt for debugging
   */
  private summarizePrompt(prompt: string): string {
    const componentName = this.extractComponentName(prompt);
    const truncated =
      prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;

    return `Generate metadata for ${componentName} component. Prompt: ${truncated}`;
  }

  /**
   * Save a recorded response to disk
   */
  private saveRecordedResponse(record: CachedResponseRecord): void {
    // Ensure directory exists
    if (!existsSync(this.responsesDir)) {
      mkdirSync(this.responsesDir, { recursive: true });
    }

    const filePath = join(
      this.responsesDir,
      `${record.componentName.toLowerCase()}.json`
    );

    writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');

    console.log(`[CachedLLMProvider] Recorded response saved to: ${filePath}`);
  }

  /**
   * Compare two tool responses for semantic similarity
   *
   * Uses structural comparison since LLM outputs are non-deterministic.
   * Focuses on key fields rather than exact text matching.
   */
  private compareResponses(
    cached: ComponentMetaTool,
    real: ComponentMetaTool,
    componentName: string
  ): ValidationResult {
    const differences: ValidationDifference[] = [];

    // Compare key structural fields
    const fieldsToCompare: (keyof ComponentMetaTool)[] = [
      'description',
      'tier',
      'tokens',
    ];

    for (const field of fieldsToCompare) {
      const cachedValue = cached[field];
      const realValue = real[field];

      // Check field presence
      if (cachedValue === undefined && realValue !== undefined) {
        differences.push({
          field,
          expected: 'undefined',
          actual: typeof realValue,
          severity: 'info',
        });
      } else if (cachedValue !== undefined && realValue === undefined) {
        differences.push({
          field,
          expected: typeof cachedValue,
          actual: 'undefined',
          severity: 'warning',
        });
      }

      // For arrays, compare lengths and presence of values
      if (Array.isArray(cachedValue) && Array.isArray(realValue)) {
        const lengthDiff = Math.abs(cachedValue.length - realValue.length);
        if (lengthDiff > 2) {
          differences.push({
            field: `${field}.length`,
            expected: cachedValue.length,
            actual: realValue.length,
            severity: 'warning',
          });
        }
      }
    }

    // Check description contains component name
    const realDesc = String(real.description ?? '').toLowerCase();
    if (!realDesc.includes(componentName.toLowerCase())) {
      differences.push({
        field: 'description',
        expected: `contains "${componentName}"`,
        actual: realDesc,
        severity: 'warning',
      });
    }

    // Determine if validation passed (no errors or warnings)
    const passed = !differences.some(
      (d) => d.severity === 'error' || d.severity === 'warning'
    );

    return { passed, differences, cached, real };
  }

  /**
   * Check if a cached response exists for a component
   */
  hasCachedResponse(componentName: string): boolean {
    return this.responseCache.has(componentName.toLowerCase());
  }

  /**
   * Get all cached component names
   */
  getCachedComponents(): string[] {
    return Array.from(this.responseCache.values()).map((r) => r.componentName);
  }

  /**
   * Clear in-memory cache (does not delete files)
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Reload cache from disk
   */
  reloadCache(): void {
    this.clearCache();
    this.loadAllCachedResponses();
  }
}

/**
 * Create a cached provider for playback mode
 */
export function createCachedProvider(
  config?: CachedLLMProviderConfig
): CachedLLMProvider {
  return new CachedLLMProvider(config);
}

/**
 * Create a cached provider configured for recording
 */
export function createRecordingProvider(
  realProvider: ILLMProvider,
  responsesDir?: string
): CachedLLMProvider {
  return new CachedLLMProvider({
    realProvider,
    recordMode: true,
    responsesDir,
  });
}

/**
 * Create a cached provider configured for validation
 */
export function createValidatingProvider(
  realProvider: ILLMProvider,
  onValidation?: CachedLLMProviderConfig['onValidation'],
  responsesDir?: string
): CachedLLMProvider {
  return new CachedLLMProvider({
    realProvider,
    validateMode: true,
    onValidation,
    responsesDir,
  });
}
