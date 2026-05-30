'use client';

import { useState } from 'react';

import { Button } from '../../_components/nexus';

/**
 * The perceptual grid + a color-vision-deficiency preview.
 *
 * Client component: it owns the active-filter toggle (useState — user
 * interaction state, not an effect). The swatches reference --nx-color-*
 * primitives via inline styles; the CVD filter is an SVG feColorMatrix
 * applied to the whole grid so you can see the palette as dichromats do.
 *
 * The matrices are the standard CSS-filter dichromacy approximations —
 * a visual preview. The design system itself gates the palette against
 * Viénot-simulated dichromacy in CI (see the Accessibility section).
 */

const BASES = ['slate', 'neutral', 'gray', 'stone', 'zinc'] as const;
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const CVD_MODES = [
  { id: 'normal', label: 'Normal' },
  { id: 'protanopia', label: 'Protanopia' },
  { id: 'deuteranopia', label: 'Deuteranopia' },
  { id: 'tritanopia', label: 'Tritanopia' },
] as const;

type CvdMode = (typeof CVD_MODES)[number]['id'];

const GRID_COLS = `4.5rem repeat(${SHADES.length}, 1fr)`;

export function PerceptualGrid() {
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

      {/* Hidden SVG filter defs for the CVD preview */}
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

      <div className="nx:overflow-x-auto">
        <div
          className="nx:min-w-[640px]"
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

          {/* one row per base palette */}
          {BASES.map((base) => (
            <div
              key={base}
              className="nx:grid nx:gap-1 nx:mb-1 nx:items-center"
              style={{ gridTemplateColumns: GRID_COLS }}
            >
              <div className="nx:text-xs nx:capitalize nx:text-muted-foreground nx:pr-2">
                {base}
              </div>
              {SHADES.map((shade) => (
                <div
                  key={shade}
                  className="nx:h-10 nx:rounded-sm nx:border nx:border-border-default"
                  style={{ background: `var(--nx-color-${base}-${shade})` }}
                  title={`${base}.${shade}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
