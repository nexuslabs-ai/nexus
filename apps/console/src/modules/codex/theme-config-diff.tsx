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
}

export function ThemeConfigDiff({ contract }: ThemeConfigDiffProps) {
  const prevRef = useRef<CodexThemeContract | null>(null);
  const prev = prevRef.current;
  useEffect(() => {
    prevRef.current = contract;
  });

  const nextLines = toLines(contract);
  const prevByKey = new Map(
    prev ? toLines(prev).map((l) => [l.key, l.text]) : []
  );

  return (
    <pre
      className="nx:overflow-x-auto nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-3 nx:font-mono nx:text-muted-foreground"
      style={{ fontSize: '12px', lineHeight: '1.7' }}
    >
      <code>
        <div>{`const themePreview: ThemeConfig = {`}</div>
        {nextLines.map((line) => {
          const before = prevByKey.get(line.key);
          const changed = before !== undefined && before !== line.text;
          return (
            <div key={line.key}>
              {changed ? (
                <div className="nx:bg-error-subtle nx:text-error-subtle-foreground">{`  - ${before}`}</div>
              ) : null}
              <div
                className={
                  changed
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
