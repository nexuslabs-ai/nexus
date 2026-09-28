'use client';

import type { ReactElement, ReactNode } from 'react';

import {
  Hide,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Show,
} from '@nexus_ds/react';

export interface WorkspaceLayoutProps {
  /** Names the side-panel landmark and titles the narrow-screen sheet. */
  panelTitle: string;
  /** Describes the panel inside the narrow-screen sheet. */
  panelDescription: string;
  /**
   * Side-panel content. It renders in the wide aside and again in the narrow
   * sheet, so it must derive element ids from `useId` rather than hard-code them.
   */
  aside: ReactNode;
  /** The button that opens the narrow-screen sheet. */
  sheetTrigger: ReactElement;
  /** The workspace canvas. */
  children: ReactNode;
}

/** Full-height workspace: a side panel on wide screens, a sheet below `lg`. */
export function WorkspaceLayout({
  panelTitle,
  panelDescription,
  aside,
  sheetTrigger,
  children,
}: WorkspaceLayoutProps) {
  return (
    <div
      data-slot="workspace-layout"
      className="nx:flex nx:flex-col nx:lg:flex-row nx:h-[calc(100svh-var(--docs-header-h))] nx:min-h-0"
    >
      <Show above="lg" as="div">
        <aside
          aria-label={panelTitle}
          className="nx:w-64 nx:shrink-0 nx:overflow-y-auto nx:p-4 nx:border-r-default nx:border-border-default"
        >
          {aside}
        </aside>
      </Show>
      <Hide above="lg" as="div">
        <div className="nx:shrink-0 nx:p-3 nx:border-b-default nx:border-border-default">
          <Sheet>
            <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{panelTitle}</SheetTitle>
                <SheetDescription>{panelDescription}</SheetDescription>
              </SheetHeader>
              <SheetBody>{aside}</SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </Hide>
      <div className="nx:min-w-0 nx:min-h-0 nx:flex-1 nx:overflow-y-auto nx:p-4 nx:lg:p-6">
        {children}
      </div>
    </div>
  );
}
