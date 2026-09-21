'use client';
import type * as React from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@nexus_ds/react';
const triggerClass =
  'nx:flex nx:h-24 nx:w-full nx:max-w-md nx:select-none nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:typography-body-default nx:text-muted-foreground';
function Example0() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Basic Menu
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Shortcuts
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="nx:w-48">
            <ContextMenuItem>
              Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Inspect
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Destructive
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Submenu
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item 1</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Sub Item 1</ContextMenuItem>
                <ContextMenuItem>Sub Item 2</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem>Item 2</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
