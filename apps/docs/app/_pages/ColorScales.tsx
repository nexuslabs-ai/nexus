'use client';

import { useState } from 'react';

import { Button } from '../_components/nexus';

/**
 * Every Nexus color scale, with a shared color-vision-deficiency preview.
 *
 * Client component: owns the CVD toggle (useState — interaction state, not an
 * effect) that filters ALL grids at once, so you can watch red↔green
 * separation collapse under protan/deuteranopia — the canonical case the
 * status palette (error=red, success=green) has to survive.
 *
 * Three grids: the 5 neutral bases (the perceptual-consistency proof), the
 * functional palettes wired to brand/status, and a collapsible full
 * reference of all 17 chromatic scales. Swatches reference --nx-color-*
 * primitives inline; the CVD filter is an SVG feColorMatrix.
 */

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

type Palette = { name: string; role?: string };

const NEUTRAL: Palette[] = [
  { name: 'slate' },
  { name: 'neutral' },
  { name: 'gray' },
  { name: 'stone' },
  { name: 'zinc' },
];

const FUNCTIONAL: Palette[] = [
  { name: 'blue', role: 'brand · information' },
  { name: 'purple', role: 'brand' },
  { name: 'pink', role: 'brand' },
  { name: 'teal', role: 'brand' },
  { name: 'orange', role: 'brand' },
  { name: 'green', role: 'success' },
  { name: 'yellow', role: 'warning' },
  { name: 'red', role: 'error' },
];

// All chromatic scales, hue-ordered (warm → cool → magenta). Excludes the 5
// neutral bases (shown above) and white/black.
const FULL_CHROMATIC: Palette[] = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
].map((name) => ({ name }));

const CVD_MODES = [
  { id: 'normal', label: 'Normal' },
  { id: 'protanopia', label: 'Protanopia' },
  { id: 'deuteranopia', label: 'Deuteranopia' },
  { id: 'tritanopia', label: 'Tritanopia' },
] as const;

type CvdMode = (typeof CVD_MODES)[number]['id'];

const GRID_COLS = `7rem repeat(${SHADES.length}, 1fr)`;

export function ColorScales() {
  const [cvd, setCvd] = useState<CvdMode>('normal');

  return (
    <div>
      <div className="nx:flex nx:flex-wrap nx:gap-2 nx:mb-4">
        {CVD_MODES.map((mode) => (
          <Button
            key={mode.id}
            size="sm"
            variant={cvd === mode.id ? 'default' : 'outline'}
            onClick={() => setCvd(mode.id)}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      <CvdFilterDefs />

      <SwatchGrid items={NEUTRAL} cvd={cvd} />

      <h3 className="nx:typography-heading-xsmall nx:mt-8 nx:mb-1">
        Brand &amp; status hues
      </h3>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
        Brand modes are blue, purple, pink, teal, orange, and black. The
        chromatic brand modes share the OKLCH pipeline; black is a monochrome
        semantic recipe built from{' '}
        <code className="nx:typography-code-inline">black.base</code>,{' '}
        <code className="nx:typography-code-inline">white.base</code>, and
        neutral support. Switch to a color-vision filter and watch the red/green
        pair (error/success) converge: that&rsquo;s why status never relies on
        hue alone.
      </p>
      <SwatchGrid items={FUNCTIONAL} cvd={cvd} />

      <details className="nx:mt-8">
        <summary className="nx:cursor-pointer nx:typography-heading-xsmall nx:mb-1 nx:select-none nx:text-foreground">
          All color scales (17)
        </summary>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:my-3 nx:max-w-[64ch]">
          The full chromatic set. Brand uses blue, purple, pink, teal, and
          orange; status uses red, yellow, green, and blue. The rest are raw
          primitives available for data viz and one-off use.
        </p>
        <SwatchGrid items={FULL_CHROMATIC} cvd={cvd} />
      </details>
    </div>
  );
}

function SwatchGrid({ items, cvd }: { items: Palette[]; cvd: CvdMode }) {
  return (
    <div className="nx:overflow-x-auto">
      <div
        className="nx:min-w-[680px]"
        style={{ filter: cvd === 'normal' ? undefined : `url(#cvd-${cvd})` }}
      >
        {/* shade header row */}
        <div
          className="nx:grid nx:gap-1 nx:mb-1"
          style={{ gridTemplateColumns: GRID_COLS }}
        >
          <div />
          {SHADES.map((shade) => (
            <div
              key={shade}
              className="nx:text-[10px] nx:text-muted-foreground-subtle nx:text-center nx:font-mono"
            >
              {shade}
            </div>
          ))}
        </div>

        {items.map((item) => (
          <div
            key={item.name}
            className="nx:grid nx:gap-1 nx:mb-1 nx:items-center"
            style={{ gridTemplateColumns: GRID_COLS }}
          >
            <div className="nx:pr-2 nx:leading-tight">
              <span className="nx:text-xs nx:capitalize nx:text-muted-foreground">
                {item.name}
              </span>
              {item.role && (
                <span className="nx:block nx:text-[10px] nx:text-muted-foreground-subtle">
                  {item.role}
                </span>
              )}
            </div>
            {SHADES.map((shade) => (
              <div
                key={shade}
                className="nx:h-10 nx:rounded-sm nx:border nx:border-border-default"
                style={{ background: `var(--nx-color-${item.name}-${shade})` }}
                title={`${item.name}.${shade}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CvdFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      className="nx:absolute nx:w-0 nx:h-0"
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        <filter id="cvd-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"
          />
        </filter>
        <filter id="cvd-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"
          />
        </filter>
        <filter id="cvd-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
