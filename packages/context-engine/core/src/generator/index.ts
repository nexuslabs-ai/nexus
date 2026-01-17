/**
 * Generator Module
 *
 * Exports for LLM-based metadata generation including provider abstractions,
 * the Anthropic implementation, MetaGenerator, and prompts.
 */

// Types
export type {
  AnthropicProviderConfig,
  GeneratorFailure,
  GeneratorInput,
  GeneratorOutput,
  GeneratorSuccess,
  ILLMProvider,
  IMetaGenerator,
  LLMCompletionOptions,
  LLMCompletionResponse,
  LLMProviderConfig,
  ParsedLLMMetaResponse,
} from './types.js';
export {
  GenerationOutputType,
  isGeneratorFailure,
  isGeneratorSuccess,
  LLMProviderType,
} from './types.js';

// Providers
export {
  AnthropicProvider,
  createAnthropicProvider,
} from './anthropic-provider.js';

// Meta Generator
export {
  createMetaGenerator,
  MetaGenerator,
  type MetaGeneratorConfig,
} from './meta-generator.js';

// Prompts
export {
  buildPrompt,
  buildUserPrompt,
  type ExpectedLLMResponse,
  filterValidPatterns,
  isValidPattern,
  type PromptBuilderInput,
  type PromptPlaceholders,
  SYSTEM_PROMPT,
  USER_PROMPT_TEMPLATE,
} from './prompts.js';
