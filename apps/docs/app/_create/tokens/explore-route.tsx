'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Input,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  Separator,
} from '@nexus_ds/react';

import type { CatalogResult } from '../../../../../packages/core/scripts/token-catalog';
import payload from '../generated/catalog.json';
import type { AcceptedPreview } from '../preview/accepted-result';

import {
  TokenLink as Link,
  useTokenNavigate,
  useTokenSearch,
} from './token-navigation';
const result = payload as CatalogResult;

import { PageHeading } from '../page-heading';

import {
  type ExploreSearch,
  filterTokens,
  type TokenCatalog,
  tokenFilterOptions,
  tokenName,
  updateExploreFilters,
} from './catalog';
import { TokenDetail, TokenSample } from './token-detail';

const PAGE_SIZE = 24;
const NAMESPACE_LABELS: Record<string, string> = {
  primitives: 'Primitives',
  semantic: 'Authored semantics',
  styles: 'Composite styles',
  runtime: 'Runtime semantics',
};

export function TokenFilters() {
  const search = useTokenSearch();
  const navigate = useTokenNavigate();
  if (result.status === 'error') return null;
  return (
    <CatalogFilters
      catalog={result.catalog}
      search={search}
      navigate={navigate}
    />
  );
}
function CatalogFilters({
  catalog,
  search,
  navigate,
}: {
  catalog: TokenCatalog;
  search: ExploreSearch;
  navigate: ReturnType<typeof useTokenNavigate>;
}) {
  const {
    groups: filterGroups,
    types,
    modes,
  } = tokenFilterOptions(catalog, search);
  const groupSections = [
    ...new Set(filterGroups.map((group) => group.section)),
  ];
  const changeFilter = (patch: Partial<ExploreSearch>) =>
    navigate({
      search: {
        ...updateExploreFilters(catalog, search, patch),
        token: undefined,
        variant: undefined,
      },
      replace: true,
      resetScroll: false,
    });
  return (
    <section aria-label="Find tokens" className="nx:space-y-4">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <label htmlFor="token-search" className="nx:typography-label-small">
          Find a token
        </label>
        <Input
          id="token-search"
          type="search"
          placeholder="Try primary-background, spacing.4, or typography…"
          value={search.q ?? ''}
          onChange={(event) =>
            changeFilter({ q: event.target.value || undefined })
          }
        />
      </div>
      <p
        id="token-filter-help"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        Browse a design group. Value types and modes follow your selection.
      </p>
      <div className="nx:grid nx:gap-4">
        <div className="nx:flex nx:flex-col nx:gap-2">
          <label htmlFor="token-group" className="nx:typography-label-small">
            Token group
          </label>
          <NativeSelect
            id="token-group"
            aria-describedby="token-filter-help"
            value={search.group ?? ''}
            onChange={(event) =>
              changeFilter({ group: event.target.value || undefined })
            }
          >
            <NativeSelectOption value="">All tokens</NativeSelectOption>
            {search.group &&
              !filterGroups.some((group) => group.value === search.group) && (
                <NativeSelectOption value={search.group}>
                  Unavailable group
                </NativeSelectOption>
              )}
            {groupSections.map((section) => (
              <NativeSelectOptGroup key={section} label={section}>
                {filterGroups
                  .filter((group) => group.section === section)
                  .map((group) => (
                    <NativeSelectOption
                      value={group.value}
                      key={group.value}
                      disabled={group.count === 0}
                    >
                      {group.label} ({group.count})
                    </NativeSelectOption>
                  ))}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
        </div>
        <div className="nx:flex nx:flex-col nx:gap-2">
          <label htmlFor="token-type" className="nx:typography-label-small">
            Value type
          </label>
          <NativeSelect
            id="token-type"
            disabled={types.length <= 1 && !search.type}
            value={search.type ?? ''}
            onChange={(event) =>
              changeFilter({ type: event.target.value || undefined })
            }
          >
            <NativeSelectOption value="">
              {types.length === 1 ? `${types[0]} only` : 'All types'}
            </NativeSelectOption>
            {search.type && !types.includes(search.type) && (
              <NativeSelectOption value={search.type}>
                Unavailable type: {search.type}
              </NativeSelectOption>
            )}
            {types.map((type) => (
              <NativeSelectOption value={type} key={type}>
                {type}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="nx:flex nx:flex-col nx:gap-2">
          <label htmlFor="token-mode" className="nx:typography-label-small">
            Mode
          </label>
          <NativeSelect
            id="token-mode"
            disabled={modes.length === 0 && !search.mode}
            value={search.mode ?? ''}
            onChange={(event) =>
              changeFilter({ mode: event.target.value || undefined })
            }
          >
            <NativeSelectOption value="">
              {modes.length === 0 ? 'Shared across modes' : 'All modes'}
            </NativeSelectOption>
            {search.mode && !modes.includes(search.mode) && (
              <NativeSelectOption value={search.mode}>
                Unavailable mode: {search.mode}
              </NativeSelectOption>
            )}
            {modes.map((mode) => (
              <NativeSelectOption value={mode} key={mode}>
                {mode}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      <Button asChild variant="ghost" size="sm">
        <Link search={{}}>Clear filters</Link>
      </Button>
    </section>
  );
}

function CatalogBrowser({
  catalog,
  accepted,
}: {
  catalog: TokenCatalog;
  accepted: AcceptedPreview;
}) {
  const search = useTokenSearch();
  const navigate = useTokenNavigate();
  const groups = filterTokens(catalog, search);
  const selectedRecords = catalog.records.filter(
    (record) => record.logicalId === search.token
  );
  if (
    selectedRecords.length &&
    !groups.some((records) => records[0]?.logicalId === search.token)
  )
    groups.push(selectedRecords);
  const selectedIndex = groups.findIndex(
    (records) => records[0]?.logicalId === search.token
  );
  const pageCount = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const page =
    selectedIndex >= 0
      ? Math.floor(selectedIndex / PAGE_SIZE) + 1
      : Math.min(search.page ?? 1, pageCount);
  const visible = groups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changePage = (nextPage: number) =>
    navigate({
      search: {
        ...search,
        page: nextPage,
        token: undefined,
        variant: undefined,
      },
      resetScroll: false,
    });

  return (
    <div className="nx:space-y-8" data-slot="token-explorer">
      <header className="nx:space-y-4">
        <p className="nx:typography-label-small nx:text-muted-foreground">
          EXPLORE THE SYSTEM
        </p>
        <PageHeading title="Every token has a story." />
        <p className="nx:text-muted-foreground nx:max-w-2xl">
          Start with a color, a space, or a type style. Follow its value, its
          modes, and the CSS that connects it to your interface.
        </p>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          {catalog.counts.authoredLeaves.toLocaleString()} authored values ·{' '}
          {catalog.counts.authoredFiles} source files ·{' '}
          {catalog.counts.runtimeTokens} runtime colors
        </p>
      </header>
      <section aria-label="Token results" className="nx:space-y-4">
        <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3">
          <p
            role="status"
            className="nx:typography-label-small nx:text-muted-foreground"
          >
            {groups.length} tokens
            {groups.length > PAGE_SIZE
              ? ` · ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, groups.length)}`
              : ''}
          </p>
        </div>
        <Separator />
        {visible.length === 0 ? (
          <div className="nx:space-y-3 nx:py-12">
            <h2 className="nx:typography-heading-small">
              No tokens match these filters.
            </h2>
            <p className="nx:text-muted-foreground">
              Try a shorter name or clear a filter to see more of the system.
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={search.token ?? ''}
            onValueChange={(token) =>
              navigate({
                search: {
                  ...search,
                  page,
                  token: token || undefined,
                  variant: undefined,
                },
                resetScroll: false,
              })
            }
          >
            {visible.map((variants) => {
              const record = variants[0];
              if (!record) return null;
              return (
                <AccordionItem key={record.logicalId} value={record.logicalId}>
                  <AccordionTrigger>
                    <span className="nx:flex nx:items-center nx:gap-4 nx:min-w-0">
                      <TokenSample record={record} catalog={catalog} />
                      <span className="nx:flex nx:flex-col nx:gap-2 nx:min-w-0">
                        <span className="nx:break-all">
                          {tokenName(record)}
                        </span>
                        <span className="nx:typography-body-small nx:text-muted-foreground">
                          {NAMESPACE_LABELS[record.namespace] ??
                            record.namespace}{' '}
                          · {record.family} ·{' '}
                          {variants.length > 1
                            ? `${variants.length} variants`
                            : record.type}
                        </span>
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <TokenDetail
                      embedded
                      catalog={catalog}
                      records={catalog.records.filter(
                        (item) => item.logicalId === record.logicalId
                      )}
                      accepted={accepted}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
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
      <details className="nx:space-y-4">
        <summary className="nx:typography-label-small nx:cursor-pointer nx:py-3 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)">
          About this catalog
        </summary>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          All authored leaves and mode variants are included. Runtime semantics
          come from the engine’s registry. The catalog uses build defaults;
          these values remain the build defaults. Expanded token details show
          your active appearance separately.
        </p>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          {catalog.build.boundary}
        </p>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          {Object.entries(catalog.build.config)
            .filter(([, value]) => value)
            .map(([key, value]) => (
              <Badge variant="secondary" key={key}>
                {key}: {value}
              </Badge>
            ))}
        </div>
        <p className="nx:typography-code-inline nx:text-muted-foreground nx:break-all">
          Catalog {catalog.build.contentHash.slice(0, 12)} · base{' '}
          {catalog.build.revision?.slice(0, 8) ?? 'unversioned'}
        </p>
      </details>
    </div>
  );
}

export function ExploreRoute({ accepted }: { accepted: AcceptedPreview }) {
  const search = useTokenSearch();
  if (result.status === 'error')
    return (
      <div role="alert" className="nx:space-y-4">
        <PageHeading title="The catalog needs attention." />
        <p>
          A source could not be read or resolved. No stale catalog is displayed.
          Correct the source and the development server will refresh this page.
        </p>
        <pre className="nx:typography-code-inline nx:whitespace-pre-wrap nx:break-words">
          {result.message}
        </pre>
      </div>
    );
  const catalog = result.catalog;
  if (!search.token)
    return <CatalogBrowser catalog={catalog} accepted={accepted} />;
  const records = catalog.records.filter(
    (record) => record.logicalId === search.token
  );
  if (records.length === 0)
    return (
      <div className="nx:space-y-4">
        <PageHeading title="This token was not found." />
        <p className="nx:text-muted-foreground">
          The source may have been renamed or removed.
        </p>
        <Button asChild>
          <Link search={{}}>Explore all tokens</Link>
        </Button>
      </div>
    );
  if (search.variant && !records.some((record) => record.id === search.variant))
    return (
      <div className="nx:space-y-4">
        <PageHeading title="This token variant was not found." />
        <p className="nx:text-muted-foreground">
          The mode may have been renamed or removed.
        </p>
        <Button asChild>
          <Link search={{ ...search, variant: undefined }}>
            View available variants
          </Link>
        </Button>
      </div>
    );
  return <CatalogBrowser catalog={catalog} accepted={accepted} />;
}
