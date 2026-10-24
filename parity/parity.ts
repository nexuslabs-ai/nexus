// What may differ between @nxds/react and @nxds/vue. React is the reference:
// anything not listed here is drift. Every entry must still match something,
// so a fixed difference fails until its entry is deleted.

/** React components Vue doesn't ship yet. */
export const planned = [
  'accordion',
  'alert-dialog',
  'appearance-settings',
  'attachment',
  'avatar',
  'brand-color-field',
  'breadcrumb',
  'bubble',
  'carousel',
  'chart',
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
  'filter-builder',
  'filter-chip',
  'filter-condition',
  'hover-card',
  'input-otp',
  'item',
  'marker',
  'menubar',
  'message',
  'message-scroller',
  'multi-select',
  'navigation-menu',
  'page-header',
  'pagination',
  'popover',
  'resizable',
  'scroll-area',
  'select',
  'setting-row',
  'sheet',
  'sidebar',
  'slider',
  'sonner',
  'table',
  'theme-quick-control',
  'toggle-group',
  'toolbar',
  'tooltip',
];

/** Components both packages ship, appearance aside: it has its own contract. */
export const shared = [
  'alert',
  'aspect-ratio',
  'badge',
  'button',
  'button-group',
  'card',
  'checkbox',
  'choice-card',
  'choice-row',
  'dialog',
  'field',
  'hide',
  'input',
  'input-group',
  'kbd',
  'label',
  'native-select',
  'progress',
  'radio-group',
  'separator',
  'show',
  'skeleton',
  'spinner',
  'switch',
  'tabs',
  'textarea',
  'toggle',
];

const NATIVE_MODEL_VALUE =
  "v-model value; React's native value prop is inherited from its props type";
const NATIVE_DEFAULT_VALUE =
  "starting value without v-model; React's native defaultValue is inherited from its props type";

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
  'Input.defaultValue': NATIVE_DEFAULT_VALUE,
  'Input.modelValue': NATIVE_MODEL_VALUE,
  'InputGroupButton.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it to pass on to Button',
  'InputGroupButton.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'InputGroupInput.defaultValue': NATIVE_DEFAULT_VALUE,
  'InputGroupInput.modelValue': NATIVE_MODEL_VALUE,
  'InputGroupTextarea.defaultValue': NATIVE_DEFAULT_VALUE,
  'InputGroupTextarea.modelValue': NATIVE_MODEL_VALUE,
  'NativeSelect.defaultValue': NATIVE_DEFAULT_VALUE,
  'NativeSelect.modelValue': NATIVE_MODEL_VALUE,
  'Switch.thumb':
    'slot for custom thumb content; React renders the thumb itself with no way to compose it',
  'Textarea.defaultValue': NATIVE_DEFAULT_VALUE,
  'Textarea.modelValue': NATIVE_MODEL_VALUE,
};

const V_MODEL = 'v-model binding, a Vue idiom with no React counterpart';

/** Play stories only one framework has, as `{slug}/{Story}`. */
export const behaviourOnlyIn: Record<
  'react' | 'vue',
  Record<string, string>
> = {
  react: {
    'button-group/SplitButton':
      'joins a DropdownMenu trigger to the group, and DropdownMenu is planned for Vue',
    'button-group/WithSelectTrigger':
      'joins a Select trigger to the group, and Select is planned for Vue',
    'dialog/NestedOverlayStacking':
      'opens a DropdownMenu inside the dialog, and DropdownMenu is planned for Vue',
  },
  vue: {
    'checkbox/VModel': V_MODEL,
    'input/VModel': V_MODEL,
    'native-select/VModel': V_MODEL,
    'radio-group/VModel': V_MODEL,
    'switch/VModel': V_MODEL,
    'textarea/VModel': V_MODEL,
    'switch/ThumbSlot': 'the #thumb slot is Vue-only API (see vueOnlyApi)',
    'tabs/IndicatorFollowsActiveTab':
      "pins Reka's horizontal indicator geometry; React's measured indicator is pinned by UnderlineVariant",
  },
};

const TABS_INDICATOR =
  "React waits for its measured indicator's opacity and transform; Reka's indicator has neither, so Vue checks only the geometry";

/** Paired play stories whose steps differ by design, as `{slug}/{Story}`. */
export const behaviourDifferences: Record<string, string> = {
  'tabs/DisabledTabInteraction': TABS_INDICATOR,
  'tabs/UnderlineVariant': TABS_INDICATOR,
  'tabs/VerticalIndicatorFollowsActiveTab': TABS_INDICATOR,
};

/** Parts whose rendered element differs by design, by `data-slot`; the rendered check skips them. */
export const renderedDifferences: Record<string, string> = {
  'tabs-indicator':
    "Radix has no indicator, so React measures the active tab and moves a span; Vue renders Reka's TabsIndicator, which reads Reka's CSS variables",
};

/** Top-level values a Vue recipe file declares that React has no twin for, as `{file}#{name}`. */
export const vueOnlyDeclarations: Record<string, string> = {
  'button/index.ts#ButtonGroupKey':
    'Vue injection key ButtonGroup provides to its Buttons and ButtonGroupText; React passes the same size through context',
  'tabs/index.ts#TabsListKey':
    'Vue injection key the list provides to its triggers; React passes the same state through context',
};

/** Files Vue copies from React byte for byte, as `[react, vue]` repo paths. */
export const copies: [react: string, vue: string][] = [
  ['packages/react/src/lib/utils.ts', 'packages/vue/src/lib/utils.ts'],
  ['packages/react/src/lib/motion.ts', 'packages/vue/src/lib/motion.ts'],
  [
    'packages/react/src/lib/field-size.ts',
    'packages/vue/src/lib/field-size.ts',
  ],
  [
    'packages/react/src/lib/responsive-visibility.ts',
    'packages/vue/src/lib/responsive-visibility.ts',
  ],
  [
    'packages/react/src/components/progress/progress.css',
    'packages/vue/src/components/progress/progress.css',
  ],
  [
    'packages/react/src/stories/support/autofill-pairing.ts',
    'packages/vue/src/stories/support/autofill-pairing.ts',
  ],
  [
    'packages/react/src/stories/support/story-height-test-utils.ts',
    'packages/vue/src/stories/support/story-height-test-utils.ts',
  ],
  [
    'packages/react/src/stories/support/overlay-motion-test-utils.ts',
    'packages/vue/src/stories/support/overlay-motion-test-utils.ts',
  ],
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
