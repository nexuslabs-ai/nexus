'use client';

import { type ReactNode, useSyncExternalStore } from 'react';

import {
  DEFAULT_FRAMEWORK,
  type Framework,
  FRAMEWORK_ATTRIBUTE,
  FRAMEWORK_PARAM,
  FRAMEWORK_STORAGE_KEY,
  frameworkLabel,
  FRAMEWORKS,
  isFramework,
} from '../_lib/frameworks';

import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './nxds';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readFramework(): Framework {
  const value = document.documentElement.getAttribute(FRAMEWORK_ATTRIBUTE);
  return isFramework(value) ? value : DEFAULT_FRAMEWORK;
}

/** The reader's framework. The head script sets it before hydration. */
export function useFramework(): Framework {
  return useSyncExternalStore(
    subscribe,
    readFramework,
    () => DEFAULT_FRAMEWORK
  );
}

/** Switches every framework tab on the page, and remembers the choice. */
export function setFramework(framework: Framework) {
  document.documentElement.setAttribute(FRAMEWORK_ATTRIBUTE, framework);
  try {
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, framework);
  } catch {
    // Storage can be off; the choice still holds for this page.
  }

  // Keep a shared link true to what the reader sees.
  const url = new URL(window.location.href);
  if (url.searchParams.has(FRAMEWORK_PARAM)) {
    url.searchParams.set(FRAMEWORK_PARAM, framework);
    window.history.replaceState(window.history.state, '', url);
  }

  for (const listener of listeners) listener();
}

function onTabChange(value: string) {
  if (isFramework(value)) setFramework(value);
}

/**
 * One tab per framework, above the panels in `children`. Every instance on the
 * page shows the same framework.
 */
export function FrameworkTabs({
  unavailable = [],
  children,
}: {
  /** Frameworks this page has no version for. Their tab reads "Coming soon". */
  unavailable?: readonly Framework[];
  children: ReactNode;
}) {
  const framework = useFramework();

  return (
    <Tabs value={framework} onValueChange={onTabChange}>
      <TabsList aria-label="Framework" className="nx:mb-2">
        {FRAMEWORKS.map(({ id, label }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="nx:flex-col nx:gap-0 nx:self-stretch"
          >
            {label}
            {unavailable.includes(id) && (
              <span className="nx:typography-label-small nx:font-normal nx:text-muted-foreground">
                Coming soon
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

/** One framework's content. Stays in the HTML, so search and Markdown see every framework. */
export function FrameworkPanel({
  framework,
  children,
  'data-md-skip': mdSkip,
}: {
  framework: Framework;
  children: ReactNode;
  /** Leaves the panel, and its framework heading, out of the Markdown. */
  'data-md-skip'?: boolean;
}) {
  // A force-mounted Radix panel never hides itself, so hide the others here.
  // The server can't know the reader's framework; CSS hides panels until then.
  const current = useSyncExternalStore(subscribe, readFramework, () => null);
  const hidden = current !== null && current !== framework;

  return (
    <TabsContent
      value={framework}
      forceMount
      hidden={hidden}
      data-framework-panel={framework}
      data-md-skip={mdSkip}
      className="nx:mt-0"
    >
      {children}
    </TabsContent>
  );
}

function showDefaultFramework() {
  setFramework(DEFAULT_FRAMEWORK);
}

/** The panel for a framework that doesn't have this component yet. The Markdown leaves it out. */
export function FrameworkComingSoon({
  framework,
  name,
}: {
  framework: Framework;
  name: string;
}) {
  const label = frameworkLabel(framework);
  const fallback = frameworkLabel(DEFAULT_FRAMEWORK);

  return (
    <FrameworkPanel framework={framework} data-md-skip>
      <EmptyState bordered className="nx:my-6 nx:min-h-56">
        <EmptyStateHeader>
          <EmptyStateTitle>
            {label} {name} is coming soon
          </EmptyStateTitle>
          <EmptyStateDescription>
            {name} isn&apos;t in the {label} package yet. The {fallback} version
            is ready to use today.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button variant="outline" onClick={showDefaultFramework}>
            View the {fallback} version
          </Button>
        </EmptyStateContent>
      </EmptyState>
    </FrameworkPanel>
  );
}
