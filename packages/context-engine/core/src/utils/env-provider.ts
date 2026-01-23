/**
 * Environment-based Provider Selection
 *
 * Convenience utility for applications/scripts to create an LLM provider
 * based on available environment variables.
 *
 * Provider selection priority:
 * 1. CONTEXT_ENGINE_PROVIDER env var (explicit selection: 'anthropic' or 'gemini')
 * 2. Auto-detect: Gemini first (free tier), then Anthropic
 */

import { createAnthropicProvider } from '../generator/anthropic-provider.js';
import { createGeminiProvider } from '../generator/gemini-provider.js';
import type { ILLMProvider } from '../generator/types.js';

/**
 * Create an LLM provider based on available environment variables.
 *
 * Provider selection logic:
 * 1. If CONTEXT_ENGINE_PROVIDER is set to 'anthropic' or 'gemini', use that provider
 *    (requires the corresponding API key to be set)
 * 2. Otherwise, auto-detect: Gemini first (free tier), then Anthropic
 *
 * @returns ILLMProvider - The selected provider instance
 * @throws Error if the selected/required API key is not set
 *
 * @example
 * // Auto-detect provider
 * const provider = createProviderFromEnv();
 *
 * // Explicit provider selection via env var
 * // CONTEXT_ENGINE_PROVIDER=anthropic
 * // ANTHROPIC_API_KEY=sk-...
 * const provider = createProviderFromEnv();
 */
export function createProviderFromEnv(): ILLMProvider {
  const explicitProvider = process.env.CONTEXT_ENGINE_PROVIDER?.toLowerCase();
  const googleKey = process.env.GOOGLE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Explicit provider selection takes precedence
  if (explicitProvider === 'anthropic') {
    if (!anthropicKey) {
      throw new Error(
        'CONTEXT_ENGINE_PROVIDER is set to "anthropic" but ANTHROPIC_API_KEY is not set.'
      );
    }
    return createAnthropicProvider({ apiKey: anthropicKey });
  }

  if (explicitProvider === 'gemini') {
    if (!googleKey) {
      throw new Error(
        'CONTEXT_ENGINE_PROVIDER is set to "gemini" but GOOGLE_API_KEY is not set.'
      );
    }
    return createGeminiProvider({ apiKey: googleKey });
  }

  // Validate explicit provider value if set but invalid
  if (explicitProvider && !['anthropic', 'gemini'].includes(explicitProvider)) {
    throw new Error(
      `Invalid CONTEXT_ENGINE_PROVIDER value: "${explicitProvider}". Must be "anthropic" or "gemini".`
    );
  }

  // Auto-detect: Gemini first (free tier), then Anthropic
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
