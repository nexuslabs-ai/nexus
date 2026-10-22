import { describe, expect, it } from 'vitest';

import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
} from './appearance-model';
import { deriveTheme } from './derive-theme';
import { SEMANTIC_TOKEN_REGISTRY } from './token-registry';

const names = (map: Record<string, string>) =>
  Object.keys(map)
    .map((key) => key.replace('--nx-color-', ''))
    .sort();

describe('semantic token registry', () => {
  it('set-equals the engine emission, both modes', () => {
    const theme = deriveTheme(createNxdsThemeContract(DEFAULT_NXDS_APPEARANCE));

    expect(SEMANTIC_TOKEN_REGISTRY.map((token) => token.name).sort()).toEqual(
      names(theme.light)
    );
    expect(names(theme.dark)).toEqual(names(theme.light));
  });

  it('does not repeat token names', () => {
    const registryNames = SEMANTIC_TOKEN_REGISTRY.map((token) => token.name);

    expect(new Set(registryNames).size).toBe(registryNames.length);
  });
});
