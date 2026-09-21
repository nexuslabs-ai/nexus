'use client';
import type * as React from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@nexus_ds/react';
import { IconSearch, IconX } from '@tabler/icons-react';

function Example0() {
  return (
    <InputGroup className="nx:w-full nx:max-w-md">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
    </InputGroup>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:w-80 nx:max-w-full nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search…" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="URL" placeholder="nexus.dev" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>0 / 200</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup variant="borderless">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Borderless search"
          placeholder="Borderless search…"
        />
      </InputGroup>
    </div>
  );
}
function Example2() {
  return (
    <InputGroup className="nx:w-full nx:max-w-md" data-disabled="true">
      <InputGroupInput
        aria-label="Email"
        placeholder="you@example.com"
        disabled
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton disabled>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
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
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
