'use client';

import { type CSSProperties, type ReactNode, useId } from 'react';

import type {
  CatalogueAlias,
  CatalogueToken,
  CatalogueVariant,
} from '@nexus_ds/core/catalogue';
import {
  Badge,
  Button,
  NativeSelect,
  NativeSelectOption,
  Separator,
} from '@nexus_ds/react';
import { IconExternalLink } from '@tabler/icons-react';

import { ContrastChecks } from './contrast-checks';
import {
  familyLabel,
  formatValue,
  isRuntime,
  layerLabel,
  sourceUrl,
  type TokenIndex,
  variantKey,
  variantLabel,
} from './token-index';
import {
  TokenLink as Link,
  useTokenNavigate,
  useTokenSearch,
} from './token-navigation';
import type { LiveTheme } from './use-live-theme';

const SAMPLE_CLASS =
  'nx:block nx:size-8 nx:shrink-0 nx:rounded-md nx:border-default nx:border-border-default';

const CODE_BLOCK_CLASS =
  'nx:typography-code-inline nx:bg-muted nx:rounded-md nx:p-3 nx:whitespace-pre-wrap nx:break-words';

const ALIAS_LABELS: Record<CatalogueAlias['kind'], string> = {
  'css-variable': 'Theme variables',
  utility: 'Utilities',
  reference: 'Reference paths',
};

/** A runtime colour's live value; otherwise the variant in the page's mode. */
function sampleValue(token: CatalogueToken, live: LiveTheme) {
  if (isRuntime(token)) return live.tokens[token.name];
  const variant =
    token.variants.find(({ mode }) => mode === live.mode) ?? token.variants[0];
  return variant?.declarations[0]?.value;
}

function sampleStyle(
  token: CatalogueToken,
  live: LiveTheme
): CSSProperties | null {
  const value = sampleValue(token, live);
  if (!value) return null;
  if (token.type === 'color') return { backgroundColor: value };
  if (token.type === 'shadow') return { boxShadow: value };
  if (token.family === 'radius') return { borderRadius: value };
  return null;
}

export function TokenSample({
  token,
  live,
}: {
  token: CatalogueToken;
  live: LiveTheme;
}) {
  const style = sampleStyle(token, live);
  if (style) {
    return <span aria-hidden="true" className={SAMPLE_CLASS} style={style} />;
  }
  return (
    <span
      aria-hidden="true"
      className="nx:typography-label-small nx:text-muted-foreground nx:flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center"
    >
      {token.family === 'typography' ? 'Aa' : '↳'}
    </span>
  );
}

function TokenNames({ token }: { token: CatalogueToken }) {
  const kinds = (Object.keys(ALIAS_LABELS) as CatalogueAlias['kind'][]).filter(
    (kind) => token.aliases.some((alias) => alias.kind === kind)
  );
  if (kinds.length === 0) return null;
  return (
    <dl className="nx:space-y-3">
      {kinds.map((kind) => (
        <div key={kind} className="nx:space-y-2">
          <dt className="nx:typography-label-small nx:text-muted-foreground">
            {ALIAS_LABELS[kind]}
          </dt>
          <dd className="nx:flex nx:flex-wrap nx:gap-2">
            {token.aliases
              .filter((alias) => alias.kind === kind)
              .map((alias) => (
                <Badge
                  key={alias.name}
                  variant="secondary"
                  fill="outline"
                  className="nx:typography-code-inline nx:normal-case"
                >
                  {alias.name}
                </Badge>
              ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LiveValue({
  token,
  live,
}: {
  token: CatalogueToken;
  live: LiveTheme;
}) {
  const value = live.tokens[token.name];
  if (!value) return null;
  return (
    <section
      className="nx:space-y-2 nx:rounded-base nx:border-default nx:border-border-default nx:p-4"
      aria-label="Value on this page"
    >
      <p className="nx:typography-label-default">On this page · {live.mode}</p>
      <div className="nx:flex nx:items-center nx:gap-3">
        <span
          aria-hidden="true"
          className={SAMPLE_CLASS}
          style={{ backgroundColor: value }}
        />
        <code className="nx:typography-code-inline nx:break-all">{value}</code>
      </div>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Derived from your current appearance. The values below are the build
        defaults.
      </p>
    </section>
  );
}

function TokenLinks({
  headingId,
  heading,
  children,
}: {
  headingId: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="nx:space-y-4" aria-labelledby={headingId}>
      <h4 id={headingId} className="nx:typography-heading-small">
        {heading}
      </h4>
      <ul className="nx:space-y-3">{children}</ul>
    </section>
  );
}

function TokenNameLink({ name }: { name: string }) {
  return (
    <Button
      asChild
      variant="link"
      size="sm"
      className="nx:h-auto nx:whitespace-normal nx:break-all"
    >
      <Link search={{ token: name }}>{name}</Link>
    </Button>
  );
}

function VariantSource({ variant }: { variant: CatalogueVariant }) {
  const { source } = variant;
  if (!source) {
    return (
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Derived by the theme engine; it has no token file.
      </p>
    );
  }
  return (
    <>
      <p className="nx:typography-code-inline nx:break-all">
        {source.file} · {source.path.join('.')}
      </p>
      <Button variant="link" asChild>
        <a href={sourceUrl(source)} target="_blank" rel="noreferrer">
          View on GitHub
          <IconExternalLink aria-hidden="true" />
          <span className="nx:sr-only"> (opens in a new tab)</span>
        </a>
      </Button>
    </>
  );
}

export function TokenDetail({
  index,
  token,
  live,
}: {
  index: TokenIndex;
  token: CatalogueToken;
  live: LiveTheme;
}) {
  const id = useId();
  const search = useTokenSearch();
  const navigate = useTokenNavigate();
  const variant =
    token.variants.find((item) => variantKey(item) === search.variant) ??
    token.variants.find(
      (item) =>
        (!search.preset || item.preset === search.preset) &&
        (!search.mode || item.mode === search.mode)
    ) ??
    token.variants[0];
  if (!variant) return null;

  const runtime = isRuntime(token);
  const readers = index.referencedBy.get(token.name) ?? [];

  return (
    <article className="nx:@container nx:space-y-8" data-slot="token-detail">
      <header className="nx:space-y-4">
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
          <Badge variant="secondary">{layerLabel(token)}</Badge>
          <span className="nx:typography-label-small nx:text-muted-foreground">
            {familyLabel(token.family)} · {token.group} · {token.type}
          </span>
        </div>
        <p className="nx:text-muted-foreground nx:max-w-2xl">
          {token.description ??
            (runtime
              ? 'A semantic color calculated by the theme engine.'
              : 'An authored value in the Nexus system. Follow it from its source to the CSS that makes it usable.')}
        </p>
        {token.variants.length > 1 && (
          <div className="nx:max-w-sm nx:space-y-2">
            <label
              htmlFor={`${id}-variant`}
              className="nx:typography-label-small"
            >
              Variant
            </label>
            <NativeSelect
              id={`${id}-variant`}
              value={variantKey(variant)}
              onChange={(event) =>
                navigate({ ...search, variant: event.target.value }, true)
              }
            >
              {token.variants.map((item) => (
                <NativeSelectOption
                  key={variantKey(item)}
                  value={variantKey(item)}
                >
                  {variantLabel(item)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
        <TokenNames token={token} />
      </header>
      {runtime && <LiveValue token={token} live={live} />}
      <Separator />
      <section
        className="nx:grid nx:gap-8 nx:@2xl:grid-cols-2"
        aria-label="Token values"
      >
        <div className="nx:min-w-0 nx:space-y-3">
          <h4 className="nx:typography-label-default">
            {runtime ? 'Derived from' : 'Authored value'}
          </h4>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            {runtime
              ? `The appearance deriveTheme ran with for the ${variantLabel(variant)} value. Runtime colors have no authored $value.`
              : 'The original value, exactly as it appears in the token source.'}
          </p>
          <pre className={CODE_BLOCK_CLASS}>
            {runtime
              ? JSON.stringify(variant.appearance, null, 2)
              : formatValue(variant.authoredValue)}
          </pre>
        </div>
        <div className="nx:min-w-0 nx:space-y-3">
          <h4 className="nx:typography-label-default">Declared CSS</h4>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            What the generated Nexus Tailwind package declares for{' '}
            {variantLabel(variant)}.
          </p>
          <pre className={CODE_BLOCK_CLASS}>
            {variant.declarations
              .map(({ property, value }) => `${property}: ${value};`)
              .join('\n')}
          </pre>
        </div>
      </section>
      {variant.references.length > 0 && (
        <TokenLinks
          headingId={`${id}-references`}
          heading="Follow the references"
        >
          {variant.references.map((reference) => (
            <li
              key={`${reference.field}:${reference.target}`}
              className="nx:typography-body-small nx:flex nx:flex-wrap nx:items-center nx:gap-2"
            >
              <span className="nx:text-muted-foreground">
                {reference.field || '$value'} · {`{${reference.reference}}`}
              </span>
              <span aria-hidden="true">→</span>
              <TokenNameLink name={reference.target} />
            </li>
          ))}
        </TokenLinks>
      )}
      {readers.length > 0 && (
        <TokenLinks headingId={`${id}-readers`} heading="Referenced by">
          {readers.map((reader) => (
            <li key={reader.name}>
              <TokenNameLink name={reader.name} />
            </li>
          ))}
        </TokenLinks>
      )}
      {runtime && <ContrastChecks token={token} live={live} />}
      <Separator />
      <section className="nx:space-y-3" aria-labelledby={`${id}-source`}>
        <h4 id={`${id}-source`} className="nx:typography-label-default">
          Source
        </h4>
        <VariantSource variant={variant} />
      </section>
    </article>
  );
}
