'use client';
import { lazy, Suspense } from 'react';

import {
  Badge,
  Button,
  NativeSelect,
  NativeSelectOption,
  Separator,
} from '@nexus_ds/react';
import { IconArrowLeft, IconExternalLink } from '@tabler/icons-react';

import { PageHeading } from '../page-heading';
import type { AcceptedPreview } from '../preview/accepted-result';

import {
  formatValue,
  type TokenCatalog,
  type TokenEmission,
  tokenName,
  type TokenRecord,
  variantName,
} from './catalog';
import {
  TokenLink as Link,
  useTokenNavigate,
  useTokenSearch,
} from './token-navigation';

const RuntimeEvidence = lazy(() => import('./runtime-evidence'));

export function TokenSample({
  record,
  catalog,
}: {
  record: TokenRecord;
  catalog: TokenCatalog;
}) {
  const emitted = catalog.emissions.find(
    (emission) =>
      record.emissions.includes(emission.id) &&
      /^(oklch|rgb|#)/.test(emission.value)
  );
  const color =
    emitted?.value ??
    (typeof record.resolvedValue === 'string'
      ? record.resolvedValue
      : undefined);
  if (record.type === 'color' && color) {
    return (
      <span
        aria-hidden="true"
        className="nx:block nx:size-8 nx:shrink-0 nx:rounded-md nx:border-default nx:border-border-default"
        style={{ backgroundColor: color }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="nx:typography-label-small nx:text-muted-foreground nx:flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center"
    >
      {record.type === 'typography' || record.family === 'typography'
        ? 'Aa'
        : '↳'}
    </span>
  );
}

function EmissionList({ emissions }: { emissions: TokenEmission[] }) {
  return (
    <div className="nx:space-y-4">
      {emissions.map((emission) => (
        <div key={emission.id} className="nx:space-y-2">
          <p className="nx:typography-label-small nx:text-muted-foreground nx:break-words">
            {emission.file}:{emission.line} · {emission.context}
          </p>
          <pre className="nx:typography-code-inline nx:bg-muted nx:rounded-md nx:p-3 nx:whitespace-pre-wrap nx:break-words">
            {emission.property}: {emission.value}
            {emission.important ? ' !important' : ''};
          </pre>
        </div>
      ))}
    </div>
  );
}

export function TokenDetail({
  catalog,
  records,
  accepted,
}: {
  catalog: TokenCatalog;
  records: TokenRecord[];
  accepted: AcceptedPreview;
}) {
  const search = useTokenSearch();
  const navigate = useTokenNavigate();
  const record =
    records.find((item) => item.id === search.variant) ??
    records.find(
      (item) => item.mode === search.mode || item.variant === search.mode
    ) ??
    records[0];
  if (!record) return null;
  const source = catalog.sources.find((item) => item.path === record.source);
  const own = catalog.emissions.filter((emission) =>
    record.emissions.includes(emission.id)
  );
  const consumers = catalog.emissions.filter((emission) =>
    record.consumerEmissions.includes(emission.id)
  );
  const utilities = [...record.utilityDefinitions, ...record.themeExamples];
  const engineMode = record.mode === 'dark' ? 'dark' : 'light';
  const engineInput = {
    surfaceTone: catalog.build.input.surfaceTone,
    seeds: catalog.build.input[engineMode],
    contrast: catalog.build.input.contrast[engineMode],
  };
  const activeMode = accepted.state.mode === 'dark' ? 'dark' : 'light';
  const activeTheme = accepted.inspection.theme[activeMode];
  const activeColor =
    record.namespace === 'runtime'
      ? activeTheme[`--nx-color-${record.path[0]}` as keyof typeof activeTheme]
      : undefined;
  const returnSearch = { ...search, token: undefined, variant: undefined };
  const selectVariant = (value: string) =>
    navigate({
      search: { ...search, variant: value },
      replace: true,
      resetScroll: false,
    });

  return (
    <article className="nx:space-y-8" data-slot="token-detail">
      <Button variant="ghost" asChild>
        <Link search={returnSearch}>
          <IconArrowLeft aria-hidden="true" />
          All tokens
        </Link>
      </Button>
      {activeColor && (
        <section
          className="nx:space-y-2 nx:rounded-base nx:border-default nx:border-border-default nx:p-4"
          aria-label="Active preview value"
        >
          <h2 className="nx:typography-heading-small">
            Active preview · {activeMode}
          </h2>
          <div className="nx:flex nx:items-center nx:gap-3">
            <span
              aria-hidden="true"
              className="nx:size-8 nx:rounded-md nx:border-default nx:border-border-default"
              style={{ backgroundColor: activeColor }}
            />
            <code className="nx:typography-code-inline nx:break-all">
              {activeColor}
            </code>
          </div>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            Resolved from your accepted playground appearance. The authored
            values and build-default provenance below remain unchanged.
          </p>
        </section>
      )}
      <header className="nx:space-y-4">
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
          <TokenSample record={record} catalog={catalog} />
          <Badge variant="secondary">
            {record.namespace === 'runtime'
              ? 'Runtime semantic'
              : record.namespace}
          </Badge>
          <span className="nx:typography-label-small nx:text-muted-foreground">
            {record.type}
          </span>
        </div>
        <PageHeading title={tokenName(record)}>
          <span className="nx:break-words">{tokenName(record)}</span>
        </PageHeading>
        <p className="nx:text-muted-foreground nx:max-w-2xl">
          {record.description ??
            (record.namespace === 'runtime'
              ? 'A semantic color calculated by the theme engine. Inspect the build-default result and the decisions behind it.'
              : 'An authored value in the Nexus system. Follow it from its source to the CSS that makes it usable.')}{' '}
        </p>
        {records.length > 1 && (
          <div className="nx:max-w-sm nx:space-y-2">
            <label
              htmlFor="token-variant"
              className="nx:typography-label-small"
            >
              Mode / variant
            </label>
            <NativeSelect
              id="token-variant"
              value={record.id}
              onChange={(event) => selectVariant(event.target.value)}
            >
              {records.map((variant) => (
                <NativeSelectOption key={variant.id} value={variant.id}>
                  {variantName(variant)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
      </header>
      <Separator />
      <section
        className="nx:grid nx:gap-8 nx:lg:grid-cols-2"
        aria-label="Token values"
      >
        <div className="nx:min-w-0 nx:space-y-3">
          <h2 className="nx:typography-label-default">
            {record.namespace === 'runtime' ? 'Engine input' : 'Authored value'}
          </h2>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            {record.namespace === 'runtime'
              ? 'This value comes from the runtime registry. It has no authored $value.'
              : 'The original value, exactly as it appears in the token source.'}
          </p>
          <pre className="nx:typography-code-inline nx:bg-muted nx:rounded-md nx:p-4 nx:whitespace-pre-wrap nx:break-words">
            {record.namespace === 'runtime'
              ? JSON.stringify(engineInput, null, 2)
              : formatValue(record.rawValue)}
          </pre>
        </div>
        <div className="nx:min-w-0 nx:space-y-3">
          <h2 className="nx:typography-label-default">
            {record.namespace === 'runtime'
              ? 'Derived value'
              : 'Resolved value'}
          </h2>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            {record.namespace === 'runtime'
              ? `The ${record.mode} result from inspectTheme for the build defaults.`
              : `References resolved as typed values. Context: ${variantName(record)}; other families use the build defaults.`}
          </p>
          <pre className="nx:typography-code-inline nx:bg-muted nx:rounded-md nx:p-4 nx:whitespace-pre-wrap nx:break-words">
            {formatValue(record.resolvedValue)}
          </pre>
        </div>
      </section>
      {record.references.length > 0 && (
        <section className="nx:space-y-4" aria-labelledby="references-heading">
          <h2 id="references-heading" className="nx:typography-heading-small">
            Follow the references
          </h2>
          <ol className="nx:space-y-3">
            {record.references.map((reference, index) => {
              const target = catalog.records.find(
                (item) => item.id === reference.targetId
              );
              if (!target) return null;
              return (
                <li
                  key={`${index}:${reference.targetId}`}
                  className="nx:typography-body-small nx:flex nx:flex-wrap nx:items-center nx:gap-2"
                >
                  <span className="nx:text-muted-foreground">
                    {reference.field || '$value'} · step {reference.depth}
                  </span>
                  <span aria-hidden="true">→</span>
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="nx:h-auto nx:whitespace-normal nx:break-all"
                  >
                    <Link
                      search={{ token: target.logicalId, variant: target.id }}
                    >{`{${reference.reference}}`}</Link>
                  </Button>
                </li>
              );
            })}
          </ol>
        </section>
      )}
      <section className="nx:space-y-4" aria-labelledby="css-heading">
        <h2 id="css-heading" className="nx:typography-heading-small">
          How it reaches the interface
        </h2>
        {record.notEmittedReason ? (
          <p className="nx:text-muted-foreground">{record.notEmittedReason}</p>
        ) : (
          <p className="nx:text-muted-foreground">
            {own.length} declarations in the generated Nexus Tailwind package.
            These are build outputs; your application includes utilities as it
            uses them.
          </p>
        )}
        {record.notes.map((note) => (
          <p
            key={note}
            className="nx:typography-body-small nx:text-muted-foreground"
          >
            {note}
          </p>
        ))}
        {utilities.length > 0 && (
          <div
            className="nx:flex nx:flex-wrap nx:gap-2"
            aria-label="Available utility examples"
          >
            {utilities.map((utility) => (
              <Badge
                key={utility}
                variant="secondary"
                fill="outline"
                className="nx:typography-code-inline nx:normal-case"
              >
                {utility}
              </Badge>
            ))}
          </div>
        )}
        {own.length > 0 && (
          <details className="nx:space-y-4">
            <summary className="nx:typography-label-default nx:cursor-pointer nx:py-3 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)">
              View emitted CSS
            </summary>
            <EmissionList emissions={own} />
          </details>
        )}
        {consumers.length > 0 && (
          <details className="nx:space-y-4">
            <summary className="nx:typography-label-default nx:cursor-pointer nx:py-3 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)">
              Utilities and theme variables that read this value
            </summary>
            <EmissionList emissions={consumers} />
          </details>
        )}
      </section>
      {record.namespace === 'runtime' && (
        <Suspense fallback={<p role="status">Loading engine evidence…</p>}>
          <RuntimeEvidence key={record.id} record={record} />
        </Suspense>
      )}
      <Separator />
      <section className="nx:space-y-3" aria-labelledby="source-heading">
        <h2 id="source-heading" className="nx:typography-label-default">
          Source & provenance
        </h2>
        <p className="nx:typography-code-inline nx:break-all">
          {record.source}
        </p>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          {source?.committed
            ? `Source matches revision ${catalog.build.revision?.slice(0, 8)}.`
            : 'Local source differs from the committed revision. No revision link is shown for this file.'}{' '}
          Catalog {catalog.build.contentHash.slice(0, 12)}.
        </p>
        {catalog.build.hasLocalChanges && (
          <p className="nx:typography-body-small nx:text-muted-foreground">
            This catalog includes local source changes. Revision links are shown
            only for files that match the recorded base.
          </p>
        )}
        {source?.url && (
          <Button variant="link" asChild>
            <a href={source.url} target="_blank" rel="noreferrer">
              Open this source revision
              <IconExternalLink aria-hidden="true" />
              <span className="nx:sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        )}
      </section>
    </article>
  );
}
