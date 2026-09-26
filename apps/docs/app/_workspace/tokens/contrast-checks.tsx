'use client';

import { useId } from 'react';

import type { CatalogueToken } from '@nexus_ds/core/catalogue';
import { Badge } from '@nexus_ds/react';

import type { LiveTheme } from './use-live-theme';

/** The live theme's contrast checks for one runtime color. */
export function ContrastChecks({
  token,
  live,
}: {
  token: CatalogueToken;
  live: LiveTheme;
}) {
  const headingId = useId();
  const checks = live.contrast.filter(
    (check) => check.fg === token.name || check.bg === token.name
  );
  return (
    <section className="nx:space-y-4" aria-labelledby={headingId}>
      <h4 id={headingId} className="nx:typography-heading-small">
        Contrast checks · {live.mode}
      </h4>
      {checks.length === 0 ? (
        <p className="nx:text-muted-foreground">
          This color is not part of a registered contrast pair.
        </p>
      ) : (
        <ul className="nx:space-y-3">
          {checks.map((check) => (
            <li
              key={`${check.fg}:${check.bg}`}
              className="nx:flex nx:flex-wrap nx:items-center nx:gap-x-3 nx:gap-y-1"
            >
              <span className="nx:typography-label-small nx:break-words">
                {check.fg} on {check.bg}
              </span>
              <span className="nx:typography-body-small nx:text-muted-foreground">
                APCA Lc {check.lc.toFixed(1)} · floor {check.floor}
              </span>
              <Badge variant={check.pass ? 'success' : 'error'} fill="light">
                {check.pass ? 'Meets floor' : 'Below floor'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Measured on the theme this page is showing, so the checks follow your
        appearance settings.
      </p>
    </section>
  );
}
