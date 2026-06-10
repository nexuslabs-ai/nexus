import { useEffect, useRef } from 'react';

import type { CodexThemeContract } from '@nexus/core';

/** The lines we surface in the preview (the derivation-relevant fields). */
function toLines(c: CodexThemeContract): { key: string; text: string }[] {
  const seeds = c.appearance === 'light' ? c.light : c.dark;
  return [
    { key: 'appearance', text: `appearance: "${c.appearance}",` },
    { key: 'accent', text: `accent: "${seeds.accent}",` },
    { key: 'background', text: `background: "${seeds.background}",` },
    { key: 'foreground', text: `foreground: "${seeds.foreground}",` },
    { key: 'contrast', text: `contrast: ${c.contrast},` },
  ];
}

interface ThemeConfigDiffProps {
  contract: CodexThemeContract;
  /** "color" tints changed lines; "symbols" shows only +/- (the diffMarkers pref). */
  markers?: 'color' | 'symbols';
}

export function ThemeConfigDiff({
  contract,
  markers = 'color',
}: ThemeConfigDiffProps) {
  const prevRef = useRef<CodexThemeContract | null>(null);
  const prev = prevRef.current;
  useEffect(() => {
    prevRef.current = contract;
  });

  const nextLines = toLines(contract);
  const prevByKey = new Map(
    prev ? toLines(prev).map((l) => [l.key, l.text]) : []
  );

  // font-size is driven by the codeFontSize pref (prefsToCss `code, pre` rule).
  return (
    <pre
      className="nx:overflow-x-auto nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-3 nx:font-mono nx:text-muted-foreground"
      style={{ lineHeight: '1.7' }}
    >
      <code>
        <div>{`const themePreview: ThemeConfig = {`}</div>
        {nextLines.map((line) => {
          const before = prevByKey.get(line.key);
          const changed = before !== undefined && before !== line.text;
          return (
            <div key={line.key}>
              {changed ? (
                <div
                  className={
                    markers === 'color'
                      ? 'nx:bg-error-subtle nx:text-error-subtle-foreground'
                      : 'nx:text-error-subtle-foreground'
                  }
                >{`  - ${before}`}</div>
              ) : null}
              <div
                className={
                  changed && markers === 'color'
                    ? 'nx:bg-success-subtle nx:text-success-subtle-foreground'
                    : undefined
                }
              >
                {changed ? `  + ${line.text}` : `  ${line.text}`}
              </div>
            </div>
          );
        })}
        <div>{`};`}</div>
      </code>
    </pre>
  );
}
