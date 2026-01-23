/**
 * Environment-based Provider Selection
 *
 * Convenience utility for applications/scripts to create an LLM provider
 * based on available environment variables.
 *
 * Priority: Gemini first (free tier), then Anthropic.
 */

import { createAnthropicProvider } from '../generator/anthropic-provider.js';
import { createGeminiProvider } from '../generator/gemini-provider.js';
import type { ILLMProvider } from '../generator/types.js';

/**
 * Create an LLM provider based on available environment variables.
 *
 * @returns ILLMProvider - Gemini if GOOGLE_API_KEY is set, otherwise Anthropic
 * @throws Error if neither GOOGLE_API_KEY nor ANTHROPIC_API_KEY is set
 *
 * @example
 * const provider = createProviderFromEnv();
 * const generator = createMetaGenerator({ provider });
 */
export function createProviderFromEnv(): ILLMProvider {
  const googleKey = process.env.GOOGLE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (googleKey) {
    return createGeminiProvider({ apiKey: googleKey });
  }
  if (anthropicKey) {
    return createAnthropicProvider({ apiKey: anthropicKey });
  }
  throw new Error(
    'No LLM API key found. Set GOOGLE_API_KEY or ANTHROPIC_API_KEY environment variable.'
  );
}
