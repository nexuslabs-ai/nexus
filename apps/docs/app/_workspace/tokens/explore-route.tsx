'use client';

import { useId } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Input,
  NativeSelect,
  NativeSelectOption,
  Separator,
} from '@nexus_ds/react';

import { PageHeading } from '../page-heading';

import { TokenDetail, TokenSample } from './token-detail';
import {
  type ExploreSearch,
  familyLabel,
  filterTokens,
  isRuntime,
  layerLabel,
  tokenFilterOptions,
  type TokenIndex,
  updateExploreFilters,
  variantKey,
  variantSummary,
} from './token-index';
import {
  TokenLink as Link,
  useTokenNavigate,
  useTokenSearch,
} from './token-navigation';
import type { LiveTheme } from './use-live-theme';

const PAGE_SIZE = 24;

const FIELD_CLASS = 'nx:flex nx:flex-col nx:gap-2';
const LABEL_CLASS = 'nx:typography-label-small';

/** A preset or theme-mode filter; its options follow the filters above it. */
function VariantAxisFilter({
  id,
  label,
  plural,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  plural: string;
  value: string | undefined;
  options: readonly string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className={FIELD_CLASS}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <NativeSelect
        id={id}
        disabled={options.length === 0 && !value}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <NativeSelectOption value="">
          {options.length === 0 ? `No ${plural}` : `All ${plural}`}
        </NativeSelectOption>
        {value && !options.includes(value) && (
          <NativeSelectOption value={value}>
            Unavailable {label.toLowerCase()}: {value}
          </NativeSelectOption>
        )}
        {options.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {option}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

export function TokenFilters({ index }: { index: TokenIndex }) {
  const id = useId();
  const search = useTokenSearch();
  const navigate = useTokenNavigate();
  const { families, groups, presets, modes } = tokenFilterOptions(
    index,
    search
  );
  const changeFilter = (patch: Partial<ExploreSearch>) =>
    navigate(
      {
        ...updateExploreFilters(index, search, patch),
        token: undefined,
        variant: undefined,
      },
      true
    );
  return (
    <section aria-label="Find tokens" className="nx:space-y-4">
      <div className={FIELD_CLASS}>
        <label htmlFor={`${id}-search`} className={LABEL_CLASS}>
          Find a token
        </label>
        <Input
          id={`${id}-search`}
          type="search"
          placeholder="Try primary-background, spacing-4, or heading…"
          value={search.q ?? ''}
          onChange={(event) =>
            changeFilter({ q: event.target.value || undefined })
          }
        />
      </div>
      <p
        id={`${id}-help`}
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        Pick a family, then narrow it to a group. Presets and modes follow your
        selection.
      </p>
      <div className="nx:grid nx:gap-4">
        <div className={FIELD_CLASS}>
          <label htmlFor={`${id}-family`} className={LABEL_CLASS}>
            Family
          </label>
          <NativeSelect
            id={`${id}-family`}
            aria-describedby={`${id}-help`}
            value={search.family ?? ''}
            onChange={(event) =>
              changeFilter({ family: event.target.value || undefined })
            }
          >
            <NativeSelectOption value="">All families</NativeSelectOption>
            {search.family &&
              !families.some((family) => family.value === search.family) && (
                <NativeSelectOption value={search.family}>
                  Unavailable family: {search.family}
                </NativeSelectOption>
              )}
            {families.map((family) => (
              <NativeSelectOption
                key={family.value}
                value={family.value}
                disabled={family.count === 0}
              >
                {family.label} ({family.count})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className={FIELD_CLASS}>
          <label htmlFor={`${id}-group`} className={LABEL_CLASS}>
            Group
          </label>
          <NativeSelect
            id={`${id}-group`}
            disabled={groups.length <= 1 && !search.group}
            value={search.group ?? ''}
            onChange={(event) =>
              changeFilter({ group: event.target.value || undefined })
            }
          >
            <NativeSelectOption value="">
              {search.family ? 'All groups' : 'Pick a family first'}
            </NativeSelectOption>
            {search.group &&
              !groups.some((group) => group.value === search.group) && (
                <NativeSelectOption value={search.group}>
                  Unavailable group: {search.group}
                </NativeSelectOption>
              )}
            {groups.map((group) => (
              <NativeSelectOption
                key={group.value}
                value={group.value}
                disabled={group.count === 0}
              >
                {group.label} ({group.count})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <VariantAxisFilter
          id={`${id}-preset`}
          label="Preset"
          plural="presets"
          value={search.preset}
          options={presets}
          onChange={(preset) => changeFilter({ preset })}
        />
        <VariantAxisFilter
          id={`${id}-mode`}
          label="Mode"
          plural="modes"
          value={search.mode}
          options={modes}
          onChange={(mode) => changeFilter({ mode })}
        />
      </div>
      <Button asChild variant="ghost" size="sm">
        <Link search={{}}>Clear filters</Link>
      </Button>
    </section>
  );
}

function AboutCatalogue({ index }: { index: TokenIndex }) {
  const appearance = index.tokens
    .flatMap((token) => token.variants)
    .find((variant) => variant.appearance)?.appearance;
  return (
    <details className="nx:space-y-4">
      <summary className="nx:typography-label-small nx:cursor-pointer nx:py-3 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)">
        About this catalogue
      </summary>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        The page calls <code>createTokenCatalogue()</code> from{' '}
        <code>@nexus_ds/core/catalogue</code> when the docs build. Every
        authored leaf is listed in each of its presets and modes, with the CSS
        the generated Tailwind package declares for it. Runtime colors are
        derived from the default appearance below, in light and dark; expanded
        runtime colors also show the value and contrast for your current
        appearance.
      </p>
      {appearance && (
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          {(
            [
              'brandColor',
              'surfaceTone',
              'lightContrast',
              'darkContrast',
            ] as const
          ).map((key) => (
            <Badge variant="secondary" key={key}>
              {key}: {appearance[key]}
            </Badge>
          ))}
        </div>
      )}
    </details>
  );
}

function CatalogueBrowser({
  index,
  live,
}: {
  index: TokenIndex;
  live: LiveTheme;
}) {
  const resultsHeadingId = useId();
  const search = useTokenSearch();
  const navigate = useTokenNavigate();
  const matches = filterTokens(index, search);
  const selected = search.token ? index.byName.get(search.token) : undefined;
  const results =
    selected && !matches.includes(selected) ? [...matches, selected] : matches;
  const selectedIndex = selected ? results.indexOf(selected) : -1;
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page =
    selectedIndex >= 0
      ? Math.floor(selectedIndex / PAGE_SIZE) + 1
      : Math.min(search.page ?? 1, pageCount);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstShown = (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, matches.length);
  const runtimeCount = index.tokens.filter(isRuntime).length;
  const familyCount = new Set(index.tokens.map((token) => token.family)).size;
  const changePage = (nextPage: number) =>
    navigate({
      ...search,
      page: nextPage,
      token: undefined,
      variant: undefined,
    });
  const selectToken = (token: string) =>
    navigate({
      ...search,
      page: page > 1 ? page : undefined,
      token: token || undefined,
      variant: undefined,
    });

  return (
    <div className="nx:space-y-8" data-slot="token-explorer">
      <header className="nx:space-y-4">
        <p className="nx:typography-label-small nx:text-muted-foreground">
          EXPLORE THE SYSTEM
        </p>
        <PageHeading>Every token has a story.</PageHeading>
        <p className="nx:text-muted-foreground nx:max-w-2xl">
          Start with a color, a space, or a type style. Follow its value, its
          modes, and the CSS that connects it to your interface.
        </p>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          {index.tokens.length} tokens · {familyCount} families · {runtimeCount}{' '}
          runtime colors
        </p>
      </header>
      <section aria-labelledby={resultsHeadingId} className="nx:space-y-4">
        <h2 id={resultsHeadingId} className="nx:sr-only">
          Token results
        </h2>
        <p
          role="status"
          className="nx:typography-label-small nx:text-muted-foreground"
        >
          {matches.length} {matches.length === 1 ? 'token' : 'tokens'}
          {matches.length > PAGE_SIZE && firstShown <= lastShown
            ? ` · ${firstShown}–${lastShown}`
            : ''}
        </p>
        <Separator />
        {visible.length === 0 ? (
          <div className="nx:space-y-3 nx:py-12">
            <p className="nx:typography-heading-small">
              No tokens match these filters.
            </p>
            <p className="nx:text-muted-foreground">
              Try a shorter name or clear a filter to see more of the system.
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={search.token ?? ''}
            onValueChange={selectToken}
          >
            {visible.map((token) => (
              <AccordionItem key={token.name} value={token.name}>
                <AccordionTrigger>
                  <span className="nx:flex nx:items-center nx:gap-4 nx:min-w-0">
                    <TokenSample token={token} live={live} />
                    <span className="nx:flex nx:flex-col nx:gap-2 nx:min-w-0">
                      <span className="nx:break-all">{token.name}</span>
                      <span className="nx:typography-body-small nx:text-muted-foreground">
                        {layerLabel(token)} · {familyLabel(token.family)} ·{' '}
                        {token.group} · {variantSummary(token) ?? token.type}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <TokenDetail index={index} token={token} live={live} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {pageCount > 1 && (
          <nav
            aria-label="Token result pages"
            className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-4"
          >
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              Previous
            </Button>
            <span className="nx:typography-body-small nx:text-muted-foreground">
              Page {page} of {pageCount}
            </span>
            <Button
              variant="outline"
              disabled={page === pageCount}
              onClick={() => changePage(page + 1)}
            >
              Next
            </Button>
          </nav>
        )}
      </section>
      <Separator />
      <AboutCatalogue index={index} />
    </div>
  );
}

function MissingToken({
  title,
  description,
  action,
  search,
}: {
  title: string;
  description: string;
  action: string;
  search: ExploreSearch;
}) {
  return (
    <div className="nx:space-y-4">
      <PageHeading>{title}</PageHeading>
      <p className="nx:text-muted-foreground">{description}</p>
      <Button asChild>
        <Link search={search}>{action}</Link>
      </Button>
    </div>
  );
}

export function ExploreRoute({
  index,
  live,
}: {
  index: TokenIndex;
  live: LiveTheme;
}) {
  const search = useTokenSearch();
  if (!search.token) return <CatalogueBrowser index={index} live={live} />;

  const token = index.byName.get(search.token);
  if (!token)
    return (
      <MissingToken
        title="This token was not found."
        description="The source may have been renamed or removed."
        action="Explore all tokens"
        search={{}}
      />
    );
  if (
    search.variant &&
    !token.variants.some((variant) => variantKey(variant) === search.variant)
  )
    return (
      <MissingToken
        title="This token variant was not found."
        description="The preset or mode may have been renamed or removed."
        action="View available variants"
        search={{ ...search, variant: undefined }}
      />
    );
  return <CatalogueBrowser index={index} live={live} />;
}
