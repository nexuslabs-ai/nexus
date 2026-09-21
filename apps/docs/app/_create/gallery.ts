export const GALLERY = [
  {
    id: 'accordion',
    label: 'Accordion',
    group: 'containers',
  },
  {
    id: 'alert',
    label: 'Alert',
    group: 'display',
  },
  {
    id: 'alert-dialog',
    label: 'AlertDialog',
    group: 'containers',
  },
  {
    id: 'aspect-ratio',
    label: 'AspectRatio',
    group: 'primitives',
  },
  {
    id: 'attachment',
    label: 'Attachment',
    group: 'display',
  },
  {
    id: 'avatar',
    label: 'Avatar',
    group: 'display',
  },
  {
    id: 'badge',
    label: 'Badge',
    group: 'display',
  },
  {
    id: 'breadcrumb',
    label: 'Breadcrumb',
    group: 'navigation',
  },
  {
    id: 'bubble',
    label: 'Bubble',
    group: 'display',
  },
  {
    id: 'button',
    label: 'Button',
    group: 'inputs',
  },
  {
    id: 'button-group',
    label: 'ButtonGroup',
    group: 'inputs',
  },
  {
    id: 'card',
    label: 'Card',
    group: 'containers',
  },
  {
    id: 'carousel',
    label: 'Carousel',
    group: 'display',
  },
  {
    id: 'chart',
    label: 'Chart',
    group: 'display',
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    group: 'inputs',
  },
  {
    id: 'choice-card',
    label: 'ChoiceCard',
    group: 'inputs',
  },
  {
    id: 'choice-row',
    label: 'ChoiceRow',
    group: 'inputs',
  },
  {
    id: 'collapsible',
    label: 'Collapsible',
    group: 'containers',
  },
  {
    id: 'combobox',
    label: 'Combobox',
    group: 'inputs',
  },
  {
    id: 'command',
    label: 'Command',
    group: 'navigation',
  },
  {
    id: 'context-menu',
    label: 'ContextMenu',
    group: 'navigation',
  },
  {
    id: 'date-picker',
    label: 'DatePicker',
    group: 'inputs',
  },
  {
    id: 'dialog',
    label: 'Dialog',
    group: 'containers',
  },
  {
    id: 'drawer',
    label: 'Drawer',
    group: 'containers',
  },
  {
    id: 'dropdown-menu',
    label: 'DropdownMenu',
    group: 'navigation',
  },
  {
    id: 'empty-state',
    label: 'EmptyState',
    group: 'display',
  },
  {
    id: 'field',
    label: 'Field',
    group: 'inputs',
  },
  {
    id: 'hide',
    label: 'Hide',
    group: 'primitives',
  },
  {
    id: 'hover-card',
    label: 'HoverCard',
    group: 'containers',
  },
  {
    id: 'input',
    label: 'Input',
    group: 'inputs',
  },
  {
    id: 'input-group',
    label: 'InputGroup',
    group: 'inputs',
  },
  {
    id: 'input-otp',
    label: 'InputOtp',
    group: 'inputs',
  },
  {
    id: 'item',
    label: 'Item',
    group: 'display',
  },
  {
    id: 'kbd',
    label: 'Kbd',
    group: 'display',
  },
  {
    id: 'label',
    label: 'Label',
    group: 'inputs',
  },
  {
    id: 'menubar',
    label: 'Menubar',
    group: 'navigation',
  },
  {
    id: 'multi-select',
    label: 'MultiSelect',
    group: 'inputs',
  },
  {
    id: 'native-select',
    label: 'NativeSelect',
    group: 'inputs',
  },
  {
    id: 'navigation-menu',
    label: 'NavigationMenu',
    group: 'navigation',
  },
  {
    id: 'pagination',
    label: 'Pagination',
    group: 'navigation',
  },
  {
    id: 'popover',
    label: 'Popover',
    group: 'containers',
  },
  {
    id: 'progress',
    label: 'Progress',
    group: 'display',
  },
  {
    id: 'radio-group',
    label: 'RadioGroup',
    group: 'inputs',
  },
  {
    id: 'resizable',
    label: 'Resizable',
    group: 'containers',
  },
  {
    id: 'scroll-area',
    label: 'ScrollArea',
    group: 'containers',
  },
  {
    id: 'select',
    label: 'Select',
    group: 'inputs',
  },
  {
    id: 'separator',
    label: 'Separator',
    group: 'primitives',
  },
  {
    id: 'sheet',
    label: 'Sheet',
    group: 'containers',
  },
  {
    id: 'show',
    label: 'Show',
    group: 'primitives',
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    group: 'navigation',
  },
  {
    id: 'skeleton',
    label: 'Skeleton',
    group: 'display',
  },
  {
    id: 'slider',
    label: 'Slider',
    group: 'inputs',
  },
  {
    id: 'sonner',
    label: 'Sonner',
    group: 'display',
  },
  {
    id: 'spinner',
    label: 'Spinner',
    group: 'display',
  },
  {
    id: 'switch',
    label: 'Switch',
    group: 'inputs',
  },
  {
    id: 'table',
    label: 'Table',
    group: 'display',
  },
  {
    id: 'tabs',
    label: 'Tabs',
    group: 'inputs',
  },
  {
    id: 'textarea',
    label: 'Textarea',
    group: 'inputs',
  },
  {
    id: 'toggle',
    label: 'Toggle',
    group: 'inputs',
  },
  {
    id: 'toggle-group',
    label: 'ToggleGroup',
    group: 'inputs',
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    group: 'display',
  },
  { id: 'appearance', label: 'Appearance', group: 'display' },
] as const;
export type ComponentId = (typeof GALLERY)[number]['id'];
export function isComponentId(value: unknown): value is ComponentId {
  return GALLERY.some((entry) => entry.id === value);
}
