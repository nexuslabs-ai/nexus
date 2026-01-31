/**
 * Environment-based Provider Selection
 *
 * Creates an LLM provider based on environment variables.
 * Set CONTEXT_ENGINE_PROVIDER to 'gemini' for Gemini, otherwise defaults to Anthropic.
 */

import { createAnthropicProvider } from '../generator/anthropic-provider.js';
import { createGeminiProvider } from '../generator/gemini-provider.js';
import type { ILLMProvider } from '../generator/types.js';

/**
 * Create an LLM provider based on environment variables.
 *
 * @returns ILLMProvider - The selected provider instance
 * @throws Error if the required API key is not set
 *
 * @example
 * // Default (Anthropic)
 * // ANTHROPIC_API_KEY=sk-...
 * const provider = createProviderFromEnv();
 *
 * // Explicit Gemini selection
 * // CONTEXT_ENGINE_PROVIDER=gemini
 * // GOOGLE_API_KEY=...
 * const provider = createProviderFromEnv();
 */
export function createProviderFromEnv(): ILLMProvider {
  const provider = process.env.CONTEXT_ENGINE_PROVIDER?.toLowerCase();

  if (provider === 'gemini') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY required for Gemini provider');
    }
    return createGeminiProvider({ apiKey });
  }

  // Default to Anthropic
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY required');
  }
  return createAnthropicProvider({ apiKey });
}
