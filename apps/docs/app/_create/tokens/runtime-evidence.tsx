'use client';
import { useState } from 'react';

import { Button } from '@nexus_ds/react';

import type { InspectionResult } from '../../../../../packages/core/scripts/token-catalog';
import payload from '../generated/inspection.json';
const result = payload as InspectionResult;

import type { TokenRecord } from './catalog';

export default function RuntimeEvidence({ record }: { record: TokenRecord }) {
  const [limit, setLimit] = useState(12);
  if (result.status === 'error')
    return <p role="alert">Engine evidence is unavailable: {result.message}</p>;
  const property = `--nx-color-${record.path[0]}`;
  const events = result.inspection.trace.filter(
    (event) => event.token === property && event.mode === record.mode
  );
  const diagnostics = result.inspection.diagnostics.filter(
    (diagnostic) =>
      diagnostic.mode === record.mode &&
      (diagnostic.pair.fg === record.path[0] ||
        diagnostic.pair.bg === record.path[0])
  );
  return (
    <section className="nx:space-y-4" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading" className="nx:typography-heading-small">
        Inside the engine
      </h2>
      <p className="nx:text-muted-foreground">
        {events.length} recorded events belong to this token in {record.mode}{' '}
        mode. These come from the inspection API using the build defaults.
        Playground appearance preferences do not change this result.
      </p>
      {diagnostics.length > 0 && (
        <details className="nx:space-y-4">
          <summary className="nx:typography-label-default nx:cursor-pointer nx:py-3 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)">
            Final contrast checks ({diagnostics.length})
          </summary>
          <div className="nx:space-y-4">
            {diagnostics.map((diagnostic) => (
              <div
                key={`${diagnostic.pair.fg}:${diagnostic.pair.bg}`}
                className="nx:space-y-2"
              >
                <p className="nx:typography-label-small nx:break-words">
                  {diagnostic.pair.fg} on {diagnostic.pair.bg}
                </p>
                <p className="nx:typography-body-small nx:text-muted-foreground">
                  APCA Lc {diagnostic.lc.toFixed(2)} · floor {diagnostic.floor}{' '}
                  · requested {diagnostic.requestedTarget.toFixed(2)} ·{' '}
                  {diagnostic.meetsFloor ? 'Meets floor' : 'Below floor'}
                </p>
              </div>
            ))}
          </div>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            Measured after derivation. These checks are separate from the
            executed solver trace.
          </p>
        </details>
      )}
      <details className="nx:space-y-4">
        <summary className="nx:typography-label-default nx:cursor-pointer nx:py-3 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)">
          Read the trace
        </summary>
        {events.length === 0 && (
          <p className="nx:text-muted-foreground">
            No token-specific events were recorded; this token is assigned
            during a shared engine stage.
          </p>
        )}
        <ol className="nx:space-y-4">
          {events.slice(0, limit).map((event) => (
            <li key={event.sequence} className="nx:space-y-2">
              <p className="nx:typography-label-small">
                #{event.sequence} · {event.stage} ·{' '}
                {event.kind === 'palette'
                  ? 'authored palette provenance'
                  : event.kind}
              </p>
              <pre className="nx:typography-code-inline nx:bg-muted nx:rounded-md nx:p-3 nx:whitespace-pre-wrap nx:break-words">
                {JSON.stringify(event, null, 2)}
              </pre>
            </li>
          ))}
        </ol>
        {events.length > limit && (
          <Button variant="outline" onClick={() => setLimit(limit + 12)}>
            Show more events
          </Button>
        )}
      </details>
    </section>
  );
}
