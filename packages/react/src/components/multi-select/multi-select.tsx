import * as React from 'react';

import { IconCheck, IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Badge } from '../badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

interface MultiSelectContextValue {
  open: boolean;
  selectedValues: Set<string>;
  labels: Map<string, React.ReactNode>;
  search: string;
  setSearch: (search: string) => void;
  toggle: (value: string) => void;
  registerLabel: (value: string, label: React.ReactNode) => void;
  unregisterLabel: (value: string) => void;
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(
  null
);

function useMultiSelect() {
  const context = React.useContext(MultiSelectContext);

  if (!context)
    throw new Error('MultiSelect parts must be used inside <MultiSelect>.');

  return context;
}

function toggleValue(values: Set<string>, value: string) {
  const next = new Set(values);

  // Set.delete returns true when the value was present (and removes it), so a
  // failed delete means it wasn't selected — add it instead.
  if (!next.delete(value)) next.add(value);

  return next;
}

function debounce<T extends (...args: never[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface MultiSelectProps {
  children: React.ReactNode;
  /**
   * Controlled selected values.
   */
  values?: string[];
  /**
   * Initial selected values for uncontrolled usage.
   */
  defaultValues?: string[];
  /**
   * Called with the next selected values whenever selection changes.
   */
  onValuesChange?: (values: string[]) => void;
}

/**
 * MultiSelect
 *
 * A searchable multiple-selection field. cmdk (via `Command`) owns filtering and
 * keyboard navigation; this component adds the selected-value model, the chip
 * trigger, and a label registry so the trigger can render chips for values whose
 * options are not on screen. For searchable single selection, use `Combobox`.
 *
 * @example
 * ```tsx
 * <MultiSelect defaultValues={['react']} onValuesChange={setValues}>
 *   <MultiSelectTrigger aria-label="Frameworks">
 *     <MultiSelectValue placeholder="Select frameworks" />
 *   </MultiSelectTrigger>
 *   <MultiSelectContent>
 *     <MultiSelectItem value="react">React</MultiSelectItem>
 *     <MultiSelectItem value="vue">Vue</MultiSelectItem>
 *   </MultiSelectContent>
 * </MultiSelect>
 * ```
 */
function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [uncontrolled, setUncontrolled] = React.useState(
    () => new Set(values ?? defaultValues)
  );
  const [labels, setLabels] = React.useState<Map<string, React.ReactNode>>(
    () => new Map()
  );

  const selectedValues = React.useMemo(
    () => (values ? new Set(values) : uncontrolled),
    [values, uncontrolled]
  );

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    // The list stays mounted (forceMount), so reset the query on close instead
    // of relying on unmount to clear cmdk's internal search state.
    if (!next) setSearch('');
  }, []);

  const toggle = React.useCallback(
    (next: string) => {
      const nextValues = toggleValue(selectedValues, next);

      if (values === undefined) setUncontrolled(nextValues);
      onValuesChange?.([...nextValues]);
    },
    [selectedValues, values, onValuesChange]
  );

  const registerLabel = React.useCallback(
    (key: string, label: React.ReactNode) => {
      setLabels((prev) =>
        prev.get(key) === label ? prev : new Map(prev).set(key, label)
      );
    },
    []
  );

  const unregisterLabel = React.useCallback((key: string) => {
    setLabels((prev) => {
      if (!prev.has(key)) return prev;

      const next = new Map(prev);
      next.delete(key);

      return next;
    });
  }, []);

  const context = React.useMemo<MultiSelectContextValue>(
    () => ({
      open,
      selectedValues,
      labels,
      search,
      setSearch,
      toggle,
      registerLabel,
      unregisterLabel,
    }),
    [
      open,
      selectedValues,
      labels,
      search,
      toggle,
      registerLabel,
      unregisterLabel,
    ]
  );

  return (
    <MultiSelectContext.Provider value={context}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
}

interface MultiSelectTriggerProps extends React.ComponentProps<'button'> {}

/**
 * MultiSelectTrigger
 *
 * The field surface. Renders the selected value(s) plus a chevron and toggles
 * the popover. Pass an `aria-label` (or a visible label via `Field`) so the
 * combobox has an accessible name. Backspace / Delete removes the last selected
 * value, so keyboard users can clear chips without reopening the list.
 */
function MultiSelectTrigger({
  className,
  children,
  ...props
}: MultiSelectTriggerProps) {
  const { open, selectedValues, toggle } = useMultiSelect();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    if (selectedValues.size === 0) return;

    const values = [...selectedValues];
    toggle(values[values.length - 1] as string);
  };

  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-slot="multi-select-trigger"
        className={cn(
          'nx:group/multi-select nx:flex nx:h-auto nx:min-h-10 nx:w-full nx:items-center nx:justify-between nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-background nx:px-3 nx:py-1.5 nx:typography-body-default nx:whitespace-nowrap nx:transition-colors',
          'nx:enabled:hover:bg-background-hover',
          'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
          'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
          'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        <IconChevronDown
          aria-hidden="true"
          className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:group-disabled/multi-select:text-disabled-foreground"
        />
      </button>
    </PopoverTrigger>
  );
}

interface MultiSelectValueProps extends Omit<
  React.ComponentProps<'div'>,
  'children'
> {
  /**
   * Shown when nothing is selected.
   * @default 'Select options'
   */
  placeholder?: React.ReactNode;
  /**
   * Render each selected value as a removable chip.
   * @default true
   */
  clickToRemove?: boolean;
  /**
   * How chips behave when they exceed the field width:
   * - `wrap` — always wrap onto multiple lines.
   * - `wrap-when-open` — wrap while the popover is open, collapse to `+N` when closed.
   * - `cutoff` — always collapse overflow into a `+N` badge.
   * @default 'wrap-when-open'
   */
  overflowBehavior?: 'wrap' | 'wrap-when-open' | 'cutoff';
}

/**
 * MultiSelectValue
 *
 * Renders the selected values inside the trigger as removable chips. When chips
 * exceed the field width they collapse into a measured `+N` badge (unless
 * wrapping). A selected value with no registered label falls back to its raw
 * value so a non-empty selection never shows the placeholder.
 */
function MultiSelectValue({
  className,
  placeholder = 'Select options',
  clickToRemove = true,
  overflowBehavior = 'wrap-when-open',
  ...props
}: MultiSelectValueProps) {
  const { selectedValues, labels, open, toggle } = useMultiSelect();
  const [overflowAmount, setOverflowAmount] = React.useState(0);
  const valueRef = React.useRef<HTMLDivElement>(null);

  const shouldWrap =
    overflowBehavior === 'wrap' ||
    (overflowBehavior === 'wrap-when-open' && open);

  const checkOverflow = React.useCallback(() => {
    const container = valueRef.current;

    if (!container) return;

    const chips = container.querySelectorAll<HTMLElement>(
      '[data-selected-item]'
    );

    // Reset to the fully-expanded state, then hide chips from the end until the
    // row stops overflowing — the count of hidden chips becomes the `+N` badge,
    // whose visibility is driven from that count in render (single source).
    chips.forEach((chip) => chip.style.removeProperty('display'));

    let amount = 0;

    for (let i = chips.length - 1; i >= 0; i--) {
      const chip = chips[i];

      if (!chip) continue;
      if (container.scrollWidth <= container.clientWidth) break;

      amount = chips.length - i;
      chip.style.display = 'none';
    }

    setOverflowAmount(amount);
  }, []);

  const handleResize = React.useCallback(
    (node: HTMLDivElement) => {
      valueRef.current = node;

      const mutationObserver = new MutationObserver(checkOverflow);
      const resizeObserver = new ResizeObserver(debounce(checkOverflow, 100));

      mutationObserver.observe(node, {
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
      resizeObserver.observe(node);

      return () => {
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        valueRef.current = null;
      };
    },
    [checkOverflow]
  );

  if (selectedValues.size === 0)
    return (
      <span
        data-slot="multi-select-placeholder"
        className="nx:truncate nx:text-muted-foreground"
      >
        {placeholder}
      </span>
    );

  const removeChip = (event: React.MouseEvent, value: string) => {
    event.stopPropagation();
    toggle(value);
  };

  return (
    <div
      data-slot="multi-select-value"
      ref={handleResize}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:items-center nx:gap-1.5 nx:overflow-hidden',
        shouldWrap && 'nx:h-full nx:flex-wrap',
        className
      )}
      {...props}
    >
      {[...selectedValues].map((value) => (
        <Badge
          key={value}
          data-slot="multi-select-chip"
          data-selected-item
          variant="secondary"
          fill="outline"
          isCaps={false}
          className={cn(
            'nx:group/chip nx:max-w-40 nx:gap-1',
            clickToRemove && 'nx:cursor-pointer'
          )}
          onClick={
            clickToRemove ? (event) => removeChip(event, value) : undefined
          }
        >
          <span className="nx:truncate">{labels.get(value) ?? value}</span>
          {clickToRemove && (
            <IconX
              aria-hidden="true"
              className="nx:size-3 nx:text-muted-foreground nx:transition-colors nx:group-hover/chip:text-error-subtle-foreground"
            />
          )}
        </Badge>
      ))}
      <Badge
        data-slot="multi-select-overflow"
        variant="secondary"
        fill="light"
        isCaps={false}
        style={{
          display: overflowAmount > 0 && !shouldWrap ? 'block' : 'none',
        }}
      >
        +{overflowAmount}
      </Badge>
    </div>
  );
}

interface MultiSelectContentProps extends Omit<
  React.ComponentProps<typeof PopoverContent>,
  'children'
> {
  children: React.ReactNode;
  /**
   * Placeholder for the search input.
   * @default 'Search…'
   */
  searchPlaceholder?: string;
  /**
   * Shown when the search matches no options.
   * @default 'No results found.'
   */
  emptyMessage?: React.ReactNode;
}

/**
 * MultiSelectContent
 *
 * The searchable option list. The popover content stays mounted (`forceMount`)
 * and is hidden with CSS while closed, so each option's label-registration
 * effect keeps preselected chips labeled without a second, shadow option tree.
 */
function MultiSelectContent({
  children,
  className,
  align = 'start',
  sideOffset = 6,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  ...props
}: MultiSelectContentProps) {
  const { search, setSearch } = useMultiSelect();

  return (
    <PopoverContent
      forceMount
      data-slot="multi-select-content"
      aria-label="Options"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'nx:w-(--radix-popover-trigger-width) nx:min-w-56 nx:p-0',
        'nx:data-[state=closed]:hidden',
        className
      )}
      {...props}
    >
      <Command>
        <CommandInput
          placeholder={searchPlaceholder}
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {children}
        </CommandList>
      </Command>
    </PopoverContent>
  );
}

interface MultiSelectItemProps extends Omit<
  React.ComponentProps<typeof CommandItem>,
  'value' | 'onSelect'
> {
  value: string;
  /**
   * Label for the trigger chip when it differs from the option content (e.g. the
   * option renders an icon + text but the chip should show text only).
   */
  badgeLabel?: React.ReactNode;
  /**
   * Called with the value after it is toggled.
   */
  onSelect?: (value: string) => void;
}

/**
 * MultiSelectItem
 *
 * A selectable option with a checkbox indicator. cmdk filters on `value` +
 * `keywords`, so `value` is forwarded to disambiguate duplicate labels and
 * icon-only content, and string children seed `keywords` so typing the label
 * matches. cmdk owns `aria-selected` for the active descendant; a visually
 * hidden "selected" note gives assistive tech the checked-state signal.
 */
function MultiSelectItem({
  value,
  children,
  badgeLabel,
  keywords,
  onSelect,
  className,
  ...props
}: MultiSelectItemProps) {
  const { selectedValues, toggle, registerLabel, unregisterLabel } =
    useMultiSelect();
  const selected = selectedValues.has(value);

  React.useEffect(() => {
    registerLabel(value, badgeLabel ?? children);

    return () => unregisterLabel(value);
  }, [value, badgeLabel, children, registerLabel, unregisterLabel]);

  const handleSelect = () => {
    toggle(value);
    onSelect?.(value);
  };

  const searchKeywords =
    keywords ?? (typeof children === 'string' ? [children] : undefined);

  return (
    <CommandItem
      data-slot="multi-select-item"
      data-checked={selected || undefined}
      value={value}
      keywords={searchKeywords}
      className={cn('nx:gap-2', className)}
      onSelect={handleSelect}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="multi-select-indicator"
        className={cn(
          'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:transition-colors',
          selected
            ? 'nx:border-transparent nx:bg-primary-background nx:text-primary-foreground'
            : 'nx:border-border-default nx:bg-background'
        )}
      >
        {selected && <IconCheck className="nx:size-3" />}
      </span>
      <span className="nx:min-w-0 nx:flex-1">{children}</span>
      {selected && <span className="nx:sr-only">selected</span>}
    </CommandItem>
  );
}

interface MultiSelectGroupProps extends React.ComponentProps<
  typeof CommandGroup
> {}

/**
 * MultiSelectGroup
 *
 * Groups related options under an optional `heading`.
 */
function MultiSelectGroup(props: MultiSelectGroupProps) {
  return <CommandGroup data-slot="multi-select-group" {...props} />;
}

interface MultiSelectSeparatorProps extends React.ComponentProps<
  typeof CommandSeparator
> {}

/**
 * MultiSelectSeparator
 *
 * A visual divider between groups or options.
 */
function MultiSelectSeparator(props: MultiSelectSeparatorProps) {
  return <CommandSeparator data-slot="multi-select-separator" {...props} />;
}

export {
  MultiSelect,
  MultiSelectContent,
  type MultiSelectContentProps,
  MultiSelectGroup,
  type MultiSelectGroupProps,
  MultiSelectItem,
  type MultiSelectItemProps,
  type MultiSelectProps,
  MultiSelectSeparator,
  type MultiSelectSeparatorProps,
  MultiSelectTrigger,
  type MultiSelectTriggerProps,
  MultiSelectValue,
  type MultiSelectValueProps,
};
