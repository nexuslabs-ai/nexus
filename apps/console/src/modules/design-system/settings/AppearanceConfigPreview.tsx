import { useEffect, useRef } from 'react';

import type { NexusThemeContract } from '@nexus/core';

import type { Base } from '../../../hooks/useTheme';

function editedBlock(
  appearance: NexusThemeContract['appearance']
): 'light' | 'dark' {
  return appearance === 'light' ? 'light' : 'dark';
}

/** The derivation-relevant fields shown in the compact preview. */
function toLines(
  contract: NexusThemeContract,
  base: Base
): { key: string; text: string }[] {
  const seeds = contract[editedBlock(contract.appearance)];
  return [
    { key: 'appearance', text: `appearance: "${contract.appearance}",` },
    { key: 'brand', text: `brand: "${seeds.accent}",` },
    { key: 'base', text: `base: "${base}",` },
    { key: 'background', text: `background: "${seeds.background}",` },
    { key: 'foreground', text: `foreground: "${seeds.foreground}",` },
    { key: 'contrast', text: `contrast: ${contract.contrast},` },
  ];
}

interface AppearanceConfigPreviewProps {
  contract: NexusThemeContract;
  base: Base;
  /** "color" tints changed lines; "symbols" shows only +/- markers. */
  markers?: 'color' | 'symbols';
}

export function AppearanceConfigPreview({
  contract,
  base,
  markers = 'color',
}: AppearanceConfigPreviewProps) {
  const prevRef = useRef<{ contract: NexusThemeContract; base: Base } | null>(
    null
  );
  const prev = prevRef.current;
  useEffect(() => {
    prevRef.current = { contract, base };
  });

  const nextLines = toLines(contract, base);
  const prevByKey = new Map(
    prev ? toLines(prev.contract, prev.base).map((l) => [l.key, l.text]) : []
  );

  return (
    <pre
      className="nx:overflow-x-auto nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-3 nx:font-mono nx:text-muted-foreground"
      style={{ lineHeight: '1.7' }}
    >
      <code>
        <div>{`const appearance = {`}</div>
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
