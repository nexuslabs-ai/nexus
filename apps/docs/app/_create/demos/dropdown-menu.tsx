'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@nexus_ds/react';

function Example0() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Basic Menu
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Basic Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>New File</DropdownMenuItem>
            <DropdownMenuItem>Open File</DropdownMenuItem>
            <DropdownMenuItem>Save</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Shortcuts
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">With Shortcuts</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="nx:w-48">
            <DropdownMenuItem>
              New File
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Close
              <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Destructive
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">With Destructive</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Submenu
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">With Submenu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
