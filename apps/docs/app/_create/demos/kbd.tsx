'use client';
import type * as React from 'react';

import { Kbd, KbdGroup } from '@nexus_ds/react';

function Example0() {
  return (
    <div className="nx:flex nx:items-center nx:gap-4">
      <Kbd>⌘</Kbd>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
        <Kbd>↵</Kbd>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Space</Kbd>
      </div>
      <div className="nx:flex nx:items-center nx:gap-4">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
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
