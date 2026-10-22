import { composeStory as composeReactStory } from '@storybook/react';
import { composeStory as composeVueStory } from '@storybook/vue3';
import { computeAccessibleName } from 'dom-accessibility-api';
import { userEvent, waitFor, within } from 'storybook/test';
import { describe, expect, it } from 'vitest';

import reactPreview from '../../packages/react/.storybook/preview';
import vuePreview from '../../packages/vue/.storybook/preview';
import { renderedDifferences, shared } from '../parity.ts';

type StoryModule = Record<string, unknown> & { default: object };
type Story = { tags?: string[]; play?: unknown };

const reactModules = import.meta.glob<StoryModule>(
  '../../packages/react/src/components/{alert,badge,button,card,dialog,spinner,switch,tabs}/*.stories.tsx'
);
const vueModules = import.meta.glob<StoryModule>(
  '../../packages/vue/src/components/{alert,badge,button,card,dialog,spinner,switch,tabs}/*.stories.ts'
);

/** Components whose content portals into `document.body` once opened. */
const OVERLAYS = new Set(['dialog']);

// Attributes that hold generated ids or inline styles, that Radix and Reka add
// for their own bookkeeping, or that `name` already covers (aria-label).
const SKIPPED_ATTRIBUTE =
  /^(?:id|style|aria-(?:controls|labelledby|describedby|owns|activedescendant|label)|data-(?:radix|reka)-.*|data-(?:active|dismissable-layer))$/;
// ARIA states where `"false"` means the same as leaving the attribute out.
const FALSE_IS_ABSENT =
  /^aria-(?:busy|disabled|hidden|invalid|readonly|required)$/;

function slugOf(file: string) {
  return file.split('/').at(-2) ?? '';
}

async function load(
  modules: Record<string, () => Promise<StoryModule>>,
  slug: string
) {
  const entry = Object.entries(modules).find(([file]) => slugOf(file) === slug);
  if (!entry) throw new Error(`no story file for ${slug}`);
  return entry[1]();
}

function docsStories(module: StoryModule) {
  return Object.entries(module).filter(
    ([name, story]) =>
      name !== 'default' && (story as Story).tags?.includes('docs')
  ) as [string, Story][];
}

function isOwnSlot(slot: string, slug: string) {
  return slot === slug || slot.startsWith(`${slug}-`);
}

/** One element as a line, so a mismatch prints as a readable line diff. */
function describeElement(element: Element) {
  const attributes = [...element.attributes]
    .filter(({ name }) => /^(?:data-|aria-|role$)/.test(name))
    .filter(({ name }) => !SKIPPED_ATTRIBUTE.test(name))
    .filter(
      ({ name, value }) => !(FALSE_IS_ABSENT.test(name) && value === 'false')
    )
    .map(({ name, value }) => `${name}="${value}"`)
    .sort();
  const classes = [...element.classList].sort().join(' ');
  const name = computeAccessibleName(element);
  const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return `<${element.tagName.toLowerCase()} ${attributes.join(' ')}> class="${classes}" name="${name}" text="${text}"`;
}

const skippedSlots = new Set<string>();

/** Every element of `slug`'s own parts on the page, in document order. */
function readTree(slug: string) {
  return [...document.body.querySelectorAll('[data-slot]')]
    .filter((element) => {
      const slot = element.getAttribute('data-slot') ?? '';
      if (!isOwnSlot(slot, slug)) return false;
      if (!(slot in renderedDifferences)) return true;
      skippedSlots.add(slot);
      return false;
    })
    .map(describeElement);
}

async function settle() {
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
}

type Compose = typeof composeReactStory | typeof composeVueStory;

async function renderTree(
  compose: Compose,
  module: StoryModule,
  name: string,
  story: Story,
  preview: object,
  slug: string
) {
  const root = document.documentElement;
  const rootAttributes = [...root.attributes].map(({ name, value }) => [
    name,
    value,
  ]);
  const canvasElement = document.createElement('div');
  document.body.append(canvasElement);

  // `run` mounts the story; without its play function both frameworks read the same initial state.
  const composed = (compose as typeof composeVueStory)(
    { ...story, play: undefined } as never,
    module.default as never,
    preview as never,
    name
  );
  await composed.run({ canvasElement } as never);
  await settle();

  if (OVERLAYS.has(slug)) {
    const triggers = within(canvasElement).getAllByRole('button');
    expect(triggers).toHaveLength(1);
    await userEvent.click(triggers[0]!);
    await waitFor(() =>
      expect(
        document.querySelector(`[data-slot="${slug}-content"]`)
      ).not.toBeNull()
    );
    await settle();
  }

  const tree = readTree(slug);

  // A composed story queues its unmount; the next `load` runs it.
  await composed.load();
  canvasElement.remove();
  await waitFor(() => expect(document.querySelector('[data-slot]')).toBeNull());
  for (const { name: attribute } of [...root.attributes])
    root.removeAttribute(attribute);
  for (const [attribute, value] of rootAttributes)
    root.setAttribute(attribute!, value!);

  return tree;
}

describe('rendered docs stories', () => {
  it('reads one story file per shared component in each framework', () => {
    expect(Object.keys(reactModules).map(slugOf).sort()).toEqual(
      [...shared].sort()
    );
    expect(Object.keys(vueModules).map(slugOf).sort()).toEqual(
      [...shared].sort()
    );
  });

  it.each(shared)(
    '%s renders the same parts in React and Vue',
    async (slug) => {
      const react = await load(reactModules, slug);
      const vue = await load(vueModules, slug);
      const vueStories = new Map(docsStories(vue));

      for (const [name, story] of docsStories(react)) {
        const vueStory = vueStories.get(name);
        if (!vueStory)
          throw new Error(`${slug}/${name} has no Vue docs story.`);

        const reactTree = await renderTree(
          composeReactStory,
          react,
          name,
          story,
          reactPreview,
          slug
        );
        const vueTree = await renderTree(
          composeVueStory,
          vue,
          name,
          vueStory,
          vuePreview,
          slug
        );

        expect(
          reactTree.length,
          `${slug}/${name} renders no ${slug} part`
        ).toBeGreaterThan(0);
        expect(vueTree, `${slug}/${name}`).toEqual(reactTree);
      }
    },
    60_000
  );

  it('allows only rendered differences that still render', () => {
    const stale = Object.keys(renderedDifferences).filter(
      (slot) => !skippedSlots.has(slot)
    );
    expect(stale).toEqual([]);
  });
});
