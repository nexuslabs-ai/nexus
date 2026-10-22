// What may differ between @nxds/react and @nxds/vue. React is the reference:
// anything not listed here is drift. Every entry must still match something,
// so a fixed difference fails until its entry is deleted.

/** React components Vue doesn't ship yet. */
export const planned = [
  'accordion',
  'alert-dialog',
  'appearance-settings',
  'aspect-ratio',
  'attachment',
  'avatar',
  'brand-color-field',
  'breadcrumb',
  'bubble',
  'button-group',
  'carousel',
  'chart',
  'checkbox',
  'choice-card',
  'choice-row',
  'collapsible',
  'color-field',
  'combobox',
  'command',
  'config-preview',
  'context-menu',
  'date-picker',
  'description-list',
  'drawer',
  'dropdown-menu',
  'empty-state',
  'field',
  'filter-builder',
  'filter-chip',
  'filter-condition',
  'hide',
  'hover-card',
  'input',
  'input-group',
  'input-otp',
  'item',
  'kbd',
  'label',
  'marker',
  'menubar',
  'message',
  'message-scroller',
  'multi-select',
  'native-select',
  'navigation-menu',
  'page-header',
  'pagination',
  'popover',
  'progress',
  'radio-group',
  'resizable',
  'scroll-area',
  'select',
  'separator',
  'setting-row',
  'sheet',
  'show',
  'sidebar',
  'skeleton',
  'slider',
  'sonner',
  'table',
  'textarea',
  'theme-quick-control',
  'toggle',
  'toggle-group',
  'toolbar',
  'tooltip',
];

/** Components both packages ship, appearance aside: it has its own contract. */
export const shared = [
  'alert',
  'badge',
  'button',
  'card',
  'dialog',
  'spinner',
  'switch',
  'tabs',
];

/**
 * Props, slots and events only the Vue part declares, as `{Part}.{name}`.
 * React's `ReactNode` props map to kebab-case slots, own `on*` props to own
 * emits, and `asChild` to Reka's inherited `PrimitiveProps`.
 */
export const vueOnlyApi: Record<string, string> = {
  'Button.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it so the spinner state can read it',
  'Button.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'Switch.thumb':
    'slot for custom thumb content; React renders the thumb itself with no way to compose it',
};

/** Parts whose rendered element differs by design, by `data-slot`; the rendered check skips them. */
export const renderedDifferences: Record<string, string> = {
  'tabs-indicator':
    "Radix has no indicator, so React measures the active tab and moves a span; Vue renders Reka's TabsIndicator, which reads Reka's CSS variables",
};

/** Top-level values a Vue recipe file declares that React has no twin for, as `{file}#{name}`. */
export const vueOnlyDeclarations: Record<string, string> = {
  'tabs/index.ts#TabsListKey':
    'Vue injection key the list provides to its triggers; React passes the same state through context',
};

/** Files Vue copies from React byte for byte, as `[react, vue]` repo paths. */
export const copies: [react: string, vue: string][] = [
  ['packages/react/src/lib/utils.ts', 'packages/vue/src/lib/utils.ts'],
];

/** Dependencies both packages declare, as `[react, vue]` names, which must take the same range. */
export const dependencies: [react: string, vue: string][] = [
  ['@nxds/core', '@nxds/core'],
  ['@nxds/tailwind', '@nxds/tailwind'],
  ['@tabler/icons-react', '@tabler/icons-vue'],
  ['class-variance-authority', 'class-variance-authority'],
  ['clsx', 'clsx'],
  ['tailwind-merge', 'tailwind-merge'],
];
