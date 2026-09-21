'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@nexus_ds/react';
import { IconFile } from '@tabler/icons-react';
const THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='currentColor'/%3E%3C/svg%3E";
function Example0() {
  return (
    <Item variant="outline" className="nx:w-full nx:max-w-md">
      <ItemMedia variant="icon">
        <IconFile />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Report.pdf</ItemTitle>
        <ItemDescription>2.4 MB · edited 3 days ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Open
        </Button>
      </ItemActions>
    </Item>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:w-96 nx:max-w-full nx:flex-col nx:gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <IconFile />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Report.pdf</ItemTitle>
          <ItemDescription>Outline · icon media · action</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted" size="sm">
        <ItemMedia variant="image">
          <img src={THUMB} alt="" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Cover.png</ItemTitle>
          <ItemDescription>Muted · sm · image media</ItemDescription>
        </ItemContent>
      </Item>
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Grouped row one</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Grouped row two</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
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
