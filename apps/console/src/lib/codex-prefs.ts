export interface CodexPrefs {
  uiFont: string;
  codeFont: string;
  uiFontSize: number; // px
  codeFontSize: number; // px
  translucentSidebar: boolean;
  pointerCursors: boolean;
  reduceMotion: 'system' | 'on' | 'off';
  diffMarkers: 'color' | 'symbols';
  fontSmoothing: boolean;
}

export const DEFAULT_CODEX_PREFS: CodexPrefs = {
  uiFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  codeFont: 'ui-monospace, "SF Mono", Menlo, monospace',
  uiFontSize: 14,
  codeFontSize: 12,
  translucentSidebar: true,
  pointerCursors: false,
  reduceMotion: 'system',
  diffMarkers: 'color',
  fontSmoothing: true,
};

const STORAGE_KEY = 'nexus-console-codex-prefs';
const clampPx = (n: unknown, fallback: number) =>
  typeof n === 'number' && n >= 8 && n <= 32 ? n : fallback;

/** Coerce an unknown payload into valid prefs, field by field. */
export function sanitizePrefs(raw: unknown): CodexPrefs {
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const d = DEFAULT_CODEX_PREFS;
  return {
    uiFont: typeof o.uiFont === 'string' ? o.uiFont : d.uiFont,
    codeFont: typeof o.codeFont === 'string' ? o.codeFont : d.codeFont,
    uiFontSize: clampPx(o.uiFontSize, d.uiFontSize),
    codeFontSize: clampPx(o.codeFontSize, d.codeFontSize),
    translucentSidebar:
      typeof o.translucentSidebar === 'boolean'
        ? o.translucentSidebar
        : d.translucentSidebar,
    pointerCursors:
      typeof o.pointerCursors === 'boolean'
        ? o.pointerCursors
        : d.pointerCursors,
    reduceMotion:
      o.reduceMotion === 'on' || o.reduceMotion === 'off'
        ? o.reduceMotion
        : 'system',
    diffMarkers: o.diffMarkers === 'symbols' ? 'symbols' : 'color',
    fontSmoothing:
      typeof o.fontSmoothing === 'boolean' ? o.fontSmoothing : d.fontSmoothing,
  };
}

export function loadCodexPrefs(): CodexPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizePrefs(JSON.parse(raw)) : DEFAULT_CODEX_PREFS;
  } catch {
    return DEFAULT_CODEX_PREFS;
  }
}

export function saveCodexPrefs(prefs: CodexPrefs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage failures
  }
}

/** Concrete CSS for the prefs — injected as one <style>, parallel to themeToCss. */
export function prefsToCss(prefs: CodexPrefs): string {
  const blocks: string[] = [
    `:root {
  --nx-typography-family-font-sans: ${prefs.uiFont};
  --nx-typography-family-font-mono: ${prefs.codeFont};
  font-size: ${prefs.uiFontSize}px;
}`,
    `code, pre, .nx\\:font-mono { font-size: ${prefs.codeFontSize}px; }`,
    `html { -webkit-font-smoothing: ${prefs.fontSmoothing ? 'antialiased' : 'auto'}; }`,
  ];
  if (prefs.pointerCursors) {
    blocks.push(
      `button:not(:disabled), [role="button"], [role="tab"], [role="radio"], a[href], summary { cursor: pointer; }`
    );
  }
  if (prefs.reduceMotion === 'on') {
    blocks.push(
      `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`
    );
  }
  if (prefs.translucentSidebar) {
    blocks.push(
      `[data-slot="sidebar-container"] { backdrop-filter: blur(12px); }`
    );
  }
  return blocks.join('\n');
}
