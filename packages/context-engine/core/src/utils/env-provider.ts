/**
 * Environment-based Provider Selection
 *
 * Creates an LLM provider based on environment variables.
 * Set CONTEXT_ENGINE_PROVIDER to 'gemini' for Gemini, otherwise defaults to Anthropic.
 * Uses LLM_API_KEY as the single API key variable for any provider.
 */

import { createAnthropicProvider } from '../generator/anthropic-provider.js';
import { createGeminiProvider } from '../generator/gemini-provider.js';
import type { ILLMProvider } from '../generator/types.js';

/**
 * Create an LLM provider based on environment variables.
 *
 * @returns ILLMProvider - The selected provider instance
 * @throws Error if LLM_API_KEY is not set
 *
 * @example
 * // Default (Anthropic)
 * // LLM_API_KEY=sk-...
 * const provider = createProviderFromEnv();
 *
 * // Explicit Gemini selection
 * // CONTEXT_ENGINE_PROVIDER=gemini
 * // LLM_API_KEY=...
 * const provider = createProviderFromEnv();
 */
export function createProviderFromEnv(): ILLMProvider {
  const provider = process.env.CONTEXT_ENGINE_PROVIDER?.toLowerCase();
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error(
      'LLM_API_KEY is required. Set it to your Anthropic or Gemini API key based on CONTEXT_ENGINE_PROVIDER.'
    );
  }

  if (provider === 'gemini') {
    return createGeminiProvider({ apiKey });
  }

  // Default to Anthropic
  return createAnthropicProvider({ apiKey });
}
