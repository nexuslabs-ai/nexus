import {
  composeStory as composeReactStory,
  type Meta as ReactMeta,
  type StoryObj as ReactStory,
} from '@storybook/react';
import {
  composeStory as composeVueStory,
  type Meta as VueMeta,
  type StoryObj as VueStory,
} from '@storybook/vue3';
import { computeAccessibleName } from 'dom-accessibility-api';
import { userEvent, waitFor, within } from 'storybook/test';
import { describe, expect, it } from 'vitest';

import reactPreview from '../../packages/react/.storybook/preview';
import vuePreview from '../../packages/vue/.storybook/preview';
import { renderedDifferences, shared } from '../parity.ts';

/** A stories file: its meta as `default`, and its stories. */
type StoryModule<TMeta, TStory> = { default: TMeta } & Partial<
  Record<string, TStory>
>;
type ReactModule = StoryModule<ReactMeta, ReactStory>;
type VueModule = StoryModule<VueMeta, VueStory>;

const reactModules = import.meta.glob<ReactModule>(
  '../../packages/react/src/components/*/*.stories.tsx'
);
const vueModules = import.meta.glob<VueModule>(
  '../../packages/vue/src/components/*/*.stories.ts'
);

/** Components whose content portals into `document.body` once opened. */
const OVERLAYS = new Set(['dialog']);

// Attributes that hold generated ids or inline styles, that Radix and Reka add
// for their own bookkeeping, or that `name` already covers (aria-label).
const SKIPPED_ATTRIBUTE =
  /^(?:id|style|aria-(?:controls|labelledby|describedby|owns|activedescendant|label)|data-(?:radix|reka)-.*|data-(?:active|dismissable-layer|slider-impl))$/;
// ARIA states where `"false"` means the same as leaving the attribute out.
const FALSE_IS_ABSENT =
  /^aria-(?:busy|disabled|hidden|invalid|readonly|required)$/;

function slugOf(file: string) {
  return file.split('/').at(-2) ?? '';
}

async function load<TModule>(
  modules: Record<string, () => Promise<TModule>>,
  slug: string
) {
  const entry = Object.entries(modules).find(([file]) => slugOf(file) === slug);
  if (!entry) throw new Error(`no story file for ${slug}`);
  return entry[1]();
}

function docsStories<TStory extends { tags?: string[] }>(
  module: Partial<Record<string, TStory>>
) {
  return Object.entries(module).flatMap(([name, story]) =>
    name !== 'default' && story?.tags?.includes('docs')
      ? [[name, story] as const]
      : []
  );
}

/** The shared component a part belongs to: the longest slug its `data-slot` starts with. */
function ownerOf(slot: string) {
  return shared
    .filter((slug) => slot === slug || slot.startsWith(`${slug}-`))
    .reduce<
      string | undefined
    >((longest, slug) => (!longest || slug.length > longest.length ? slug : longest), undefined);
}

function isOwnSlot(slot: string, slug: string) {
  return ownerOf(slot) === slug;
}

/** One element as a line, so a mismatch prints as a readable line diff. */
function describeElement(element: Element) {
  // Reka repeats a native `disabled` as `aria-disabled="true"`; Radix doesn't.
  const isNativelyDisabled = element.hasAttribute('disabled');
  const attributes = [...element.attributes]
    .filter(({ name }) => /^(?:data-|aria-|role$)/.test(name))
    .filter(({ name }) => !SKIPPED_ATTRIBUTE.test(name))
    .filter(
      ({ name, value }) => !(FALSE_IS_ABSENT.test(name) && value === 'false')
    )
    .filter(({ name }) => !(name === 'aria-disabled' && isNativelyDisabled))
    .map(({ name, value }) => `${name}="${value}"`)
    .sort();
  const classes = [...element.classList].sort().join(' ');
  const name = computeAccessibleName(element);
  // A textarea shows its value; its text content is only the default value.
  const content =
    element instanceof HTMLTextAreaElement
      ? element.value
      : element.textContent;
  const text = content?.replace(/\s+/g, ' ').trim() ?? '';
  return `<${element.tagName.toLowerCase()} ${attributes.join(' ')}> class="${classes}" name="${name}" text="${text}"`;
}

/**
 * Every element of `slug`'s own parts on the page, in document order, and the
 * `renderedDifferences` slots it skipped.
 */
function readTree(slug: string) {
  const own = [...document.body.querySelectorAll('[data-slot]')].filter(
    (element) => isOwnSlot(element.getAttribute('data-slot') ?? '', slug)
  );
  const differs = (element: Element) =>
    (element.getAttribute('data-slot') ?? '') in renderedDifferences;
  return {
    tree: own.filter((element) => !differs(element)).map(describeElement),
    skipped: own
      .filter(differs)
      .map((element) => element.getAttribute('data-slot') ?? ''),
  };
}

async function settle() {
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
}

// `run` mounts the story; without its play function both frameworks read the same initial state.
async function mountReact(
  module: ReactModule,
  name: string,
  story: ReactStory,
  canvasElement: HTMLElement
) {
  const composed = composeReactStory(
    { ...story, play: undefined },
    module.default,
    reactPreview,
    name
  );
  await composed.run({ canvasElement });
  return composed;
}

async function mountVue(
  module: VueModule,
  name: string,
  story: VueStory,
  canvasElement: HTMLElement
) {
  const composed = composeVueStory(
    { ...story, play: undefined },
    module.default,
    vuePreview,
    name
  );
  await composed.run({ canvasElement });
  return composed;
}

async function renderTree(
  mount: (canvasElement: HTMLElement) => Promise<{ load: () => Promise<void> }>,
  slug: string
) {
  const root = document.documentElement;
  const rootAttributes = [...root.attributes].map(({ name, value }) => [
    name,
    value,
  ]);
  const canvasElement = document.createElement('div');
  document.body.append(canvasElement);

  const composed = await mount(canvasElement);
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
    const count = (modules: Record<string, unknown>, slug: string) =>
      Object.keys(modules).filter((file) => slugOf(file) === slug).length;
    const unread = shared.filter(
      (slug) => count(reactModules, slug) !== 1 || count(vueModules, slug) !== 1
    );
    expect(unread).toEqual([]);
  });

  it('allows only rendered differences that belong to a shared component', () => {
    const unowned = Object.keys(renderedDifferences).filter(
      (slot) => !shared.some((slug) => isOwnSlot(slot, slug))
    );
    expect(unowned).toEqual([]);
  });

  it.each(shared)(
    '%s renders the same parts in React and Vue',
    async (slug) => {
      const react = await load(reactModules, slug);
      const vue = await load(vueModules, slug);
      const vueStories = new Map(docsStories(vue));
      const skipped = new Set<string>();

      for (const [name, story] of docsStories(react)) {
        const vueStory = vueStories.get(name);
        if (!vueStory)
          throw new Error(`${slug}/${name} has no Vue docs story.`);

        const reactTree = await renderTree(
          (canvasElement) => mountReact(react, name, story, canvasElement),
          slug
        );
        const vueTree = await renderTree(
          (canvasElement) => mountVue(vue, name, vueStory, canvasElement),
          slug
        );
        for (const slot of [...reactTree.skipped, ...vueTree.skipped]) {
          skipped.add(slot);
        }

        expect(
          reactTree.tree.length,
          `${slug}/${name} renders no ${slug} part`
        ).toBeGreaterThan(0);
        expect(vueTree.tree, `${slug}/${name}`).toEqual(reactTree.tree);
      }

      const stale = Object.keys(renderedDifferences).filter(
        (slot) => isOwnSlot(slot, slug) && !skipped.has(slot)
      );
      expect(stale, 'rendered differences that no longer render').toEqual([]);
    },
    60_000
  );
});
