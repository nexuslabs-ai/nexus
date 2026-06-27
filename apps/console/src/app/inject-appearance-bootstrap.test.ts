import { describe, expect, it } from 'vitest';

import {
  CONSOLE_APPEARANCE_DEFAULT,
  CONSOLE_STORAGE_KEY,
} from './appearance-defaults';
import { injectAppearanceBootstrap } from './inject-appearance-bootstrap';

const HTML =
  '<!doctype html><html><head><title>Nexus</title></head><body><script type="module" src="/src/main.tsx"></script></body></html>';

describe('injectAppearanceBootstrap', () => {
  const out = injectAppearanceBootstrap(HTML, {
    storageKey: CONSOLE_STORAGE_KEY,
    defaultState: CONSOLE_APPEARANCE_DEFAULT,
  });

  it('injects a classic inline script', () => {
    const script = out.match(/<script>([\s\S]*?)<\/script>/);

    expect(script?.[0]).toBeDefined();
    expect(script?.[0]).not.toContain('type=');
    expect(script?.[1]).toContain('classList.toggle("dark"');
  });

  it('places the bootstrap before the app module', () => {
    const bootstrapIndex = out.indexOf('classList.toggle("dark"');

    expect(bootstrapIndex).toBeGreaterThan(-1);
    expect(bootstrapIndex).toBeLessThan(out.indexOf('/src/main.tsx'));
    expect(bootstrapIndex).toBeLessThan(out.indexOf('</head>'));
  });

  it('embeds the shared storage key and default state', () => {
    expect(out).toContain(JSON.stringify(CONSOLE_STORAGE_KEY));
    expect(out).toContain(CONSOLE_APPEARANCE_DEFAULT.brandColor);
  });
});
