'use client';

import * as React from 'react';

import { useComposedRefs } from '@radix-ui/react-compose-refs';

import { IconCheck, IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Badge } from '../badge/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command/command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';

interface MultiSelectContextValue {
  open: boolean;
  selectedValues: Set<string>;
  labels: Map<string, React.ReactNode>;
  toggle: (value: string) => void;
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

/**
 * Walk the composed children and map each option's `value` to the label the
 * trigger chip should show — `badgeLabel`, falling back to the option content.
 */
function collectLabels(
  children: React.ReactNode,
  labels: Map<string, React.ReactNode> = new Map()
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === MultiSelectItem) {
      const {
        value,
        badgeLabel,
        children: content,
      } = child.props as MultiSelectItemProps;
      labels.set(value, badgeLabel ?? content);

      return;
    }

    // Recurse through groups, fragments, and any wrapper that carries options
    // as children (e.g. MultiSelectGroup).
    const { children: nested } = child.props as {
      children?: React.ReactNode;
    };
    if (nested) collectLabels(nested, labels);
  });

  return labels;
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
   * Called with the new selected values when the selection changes.
   */
  onValuesChange?: (values: string[]) => void;
}

/**
 * Searchable field for picking several options, shown as chips. For
 * searchable single selection, use `Combobox`.
 */
function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(
    () => new Set(values ?? defaultValues)
  );

  const selectedValues = React.useMemo(
    () => (values ? new Set(values) : uncontrolled),
    [values, uncontrolled]
  );

  const labels = React.useMemo(() => collectLabels(children), [children]);

  const toggle = React.useCallback(
    (value: string) => {
      const nextValues = toggleValue(selectedValues, value);

      if (values === undefined) setUncontrolled(nextValues);
      onValuesChange?.([...nextValues]);
    },
    [selectedValues, values, onValuesChange]
  );

  const context = React.useMemo<MultiSelectContextValue>(
    () => ({ open, selectedValues, labels, toggle }),
    [open, selectedValues, labels, toggle]
  );

  return (
    <MultiSelectContext.Provider value={context}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
}

type MultiSelectTriggerProps = React.ComponentProps<'button'>;

/**
 * Field that shows the selected values, opens the list, and removes the last
 * value on Backspace or Delete. Needs an `aria-label` or a visible label from
 * `Field`.
 */
const MultiSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<MultiSelectTriggerProps>
>(function MultiSelectTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<MultiSelectTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { open, selectedValues, toggle } = useMultiSelect();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;

    const values = [...selectedValues];
    const last = values[values.length - 1];
    if (last !== undefined) toggle(last);
  };

  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-slot="multi-select-trigger"
        className={cn(
          'nx:group/multi-select nx:flex nx:h-auto nx:min-h-10 nx:w-full nx:items-center nx:justify-between nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:text-inherit nx:px-3 nx:py-1.5 nx:typography-body-default nx:whitespace-nowrap nx:transition-field',
          'nx:enabled:hover:bg-container-hover',
          'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
          'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
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
});

/**
 * Hides chips from the end of `container` until the row stops overflowing,
 * and returns how many it hid.
 */
function hideOverflowingChips(container: HTMLDivElement) {
  const chips = container.querySelectorAll<HTMLElement>('[data-selected-item]');

  // Reset to the fully-expanded state first; the count becomes the `+N` badge,
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

  return amount;
}

interface MultiSelectValueProps extends Omit<
  React.ComponentProps<'div'>,
  'children'
> {
  /**
   * Shown when nothing is selected.
   */
  placeholder?: React.ReactNode;
  /**
   * Shows each selected value as a removable chip.
   */
  clickToRemove?: boolean;
  /**
   * What chips do when they overflow the field:
   * - `wrap`: wrap onto more lines.
   * - `wrap-when-open`: wrap while the list is open, show `+N` when closed.
   * - `cutoff`: always show the extra chips as a `+N` badge.
   */
  overflowBehavior?: 'wrap' | 'wrap-when-open' | 'cutoff';
}

/**
 * Selected values inside the trigger, shown as removable chips. Chips that
 * don't fit become a `+N` badge unless they wrap.
 */
const MultiSelectValue = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MultiSelectValueProps>
>(function MultiSelectValue(propsWithoutRef, forwardedRef) {
  const {
    className,
    placeholder = 'Select options',
    clickToRemove = true,
    overflowBehavior = 'wrap-when-open',
    ref,
    ...props
  }: React.PropsWithoutRef<MultiSelectValueProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const { selectedValues, labels, open, toggle } = useMultiSelect();
  const [overflowAmount, setOverflowAmount] = React.useState(0);
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, setContainer);

  const shouldWrap =
    overflowBehavior === 'wrap' ||
    (overflowBehavior === 'wrap-when-open' && open);

  React.useEffect(() => {
    if (!container) return;

    const check = () => setOverflowAmount(hideOverflowingChips(container));
    const mutationObserver = new MutationObserver(check);
    const resizeObserver = new ResizeObserver(debounce(check, 100));

    mutationObserver.observe(container, {
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    resizeObserver.observe(container);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [container]);

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

  const isChipHidden = shouldWrap || overflowAmount === 0;

  return (
    <div
      data-slot="multi-select-value"
      ref={composedRef}
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
        style={{ display: isChipHidden ? 'none' : undefined }}
      >
        +{overflowAmount}
      </Badge>
    </div>
  );
});

interface MultiSelectContentProps extends Omit<
  React.ComponentProps<typeof PopoverContent>,
  'children'
> {
  children: React.ReactNode;
  /**
   * Placeholder for the search input.
   */
  searchPlaceholder?: string;
  /**
   * Shown when the search matches no options.
   */
  emptyMessage?: React.ReactNode;
}

/**
 * Searchable list of options, shown in a popover.
 */
const MultiSelectContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MultiSelectContentProps>
>(function MultiSelectContent(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    align = 'start',
    sideOffset = 6,
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found.',
    ...props
  }: React.PropsWithoutRef<MultiSelectContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <PopoverContent
      data-slot="multi-select-content"
      aria-label="Options"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'nx:w-(--radix-popover-trigger-width) nx:min-w-56 nx:p-0',
        className
      )}
      {...props}
    >
      <Command>
        <CommandInput placeholder={searchPlaceholder} />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {children}
        </CommandList>
      </Command>
    </PopoverContent>
  );
});

interface MultiSelectItemProps extends Omit<
  React.ComponentProps<typeof CommandItem>,
  'value' | 'onSelect'
> {
  value: string;
  /**
   * Chip text when it differs from the option content, such as an icon option.
   */
  badgeLabel?: React.ReactNode;
  /**
   * Called with the option's value after it is toggled.
   */
  onSelect?: (value: string) => void;
}

/**
 * Option with a checkbox, found by its `value`, `keywords` or plain-text
 * label. Give each option a unique `value`.
 */
const MultiSelectItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MultiSelectItemProps>
>(function MultiSelectItem(propsWithoutRef, forwardedRef) {
  const {
    value,
    children,
    badgeLabel,
    keywords,
    onSelect,
    className,
    ...props
  }: React.PropsWithoutRef<MultiSelectItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  // MultiSelect reads `badgeLabel` from its children; it isn't a DOM prop.
  void badgeLabel;
  const { selectedValues, toggle } = useMultiSelect();
  const selected = selectedValues.has(value);

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
    </CommandItem>
  );
});

type MultiSelectGroupProps = React.ComponentProps<typeof CommandGroup>;

/**
 * Groups related options under an optional `heading`.
 */
const MultiSelectGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MultiSelectGroupProps>
>(function MultiSelectGroup(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<MultiSelectGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <CommandGroup data-slot="multi-select-group" {...props} />;
});

type MultiSelectSeparatorProps = React.ComponentProps<typeof CommandSeparator>;

/**
 * Divider between groups or options.
 */
const MultiSelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MultiSelectSeparatorProps>
>(function MultiSelectSeparator(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<MultiSelectSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <CommandSeparator data-slot="multi-select-separator" {...props} />;
});

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
