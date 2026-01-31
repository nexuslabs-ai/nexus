/**
 * Generator Module
 *
 * Exports for LLM-based metadata generation including provider abstractions,
 * the Anthropic and Gemini implementations, MetaGenerator, and prompts.
 */

// Types
export type {
  AnthropicProviderConfig,
  GeminiProviderConfig,
  GeneratorFailure,
  GeneratorInput,
  GeneratorOutput,
  GeneratorSuccess,
  ILLMProvider,
  IMetaGenerator,
  LLMCompletionOptions,
  LLMCompletionResponse,
  LLMProviderConfig,
  ToolCallFailure,
  ToolCallingOptions,
  ToolCallResult,
  ToolCallSuccess,
} from './types.js';
export {
  GenerationOutputType,
  isGeneratorFailure,
  isGeneratorSuccess,
  isToolCallFailure,
  isToolCallSuccess,
  LLMProviderType,
} from './types.js';

// Providers
export {
  AnthropicProvider,
  createAnthropicProvider,
} from './anthropic-provider.js';
export { createGeminiProvider, GeminiProvider } from './gemini-provider.js';

// Meta Generator
export {
  createMetaGenerator,
  MetaGenerator,
  type MetaGeneratorConfig,
} from './meta-generator.js';

// Prompts
export {
  buildToolCallingPrompt,
  filterValidPatterns,
  type PromptBuilderInput,
  TOOL_CALLING_SYSTEM_PROMPT,
} from './prompts.js';

// Tool Schema
export {
  COMPONENT_META_TOOL,
  COMPONENT_META_TOOL_JSON_SCHEMA,
  type ComponentMetaTool,
  type ComponentMetaToolDefinition,
  ComponentMetaToolSchema,
  ToolCodeExampleSchema,
  ToolExamplesSchema,
  ToolGuidanceSchema,
} from './tool-schema.js';
