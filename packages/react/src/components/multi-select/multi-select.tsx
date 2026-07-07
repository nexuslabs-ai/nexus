import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronDown, IconX } from '../../lib/icons';
import type {
  SelectionOption,
  SelectionOptionGroup,
  SelectionOptionInput,
} from '../../lib/selection';
import { cn } from '../../lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command';
import {
  Popover,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
} from '../popover';

const multiSelectTriggerVariants = cva(
  [
    'nx:group/multi-select-trigger',
    'nx:flex',
    'nx:box-border',
    'nx:w-full',
    'nx:min-w-0',
    'nx:items-center',
    'nx:justify-between',
    'nx:gap-2',
    'nx:overflow-hidden',
    'nx:rounded-md',
    'nx:border-0',
    'nx:transition-colors',
    'nx:outline-none',
    'nx:focus-visible:outline-2',
    'nx:focus-visible:outline-focus-default',
    'nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error',
    'nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed',
    'nx:disabled:bg-disabled',
    'nx:disabled:text-disabled-foreground',
    'nx:data-[placeholder=true]:text-muted-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:min-h-8 nx:px-2 nx:py-1 nx:typography-body-small',
        default: 'nx:min-h-10 nx:px-2.5 nx:py-1.5 nx:typography-body-default',
        lg: 'nx:min-h-12 nx:px-3 nx:py-2 nx:typography-body-default',
      },
      variant: {
        default:
          'nx:border-border-default nx:bg-background nx:enabled:hover:bg-background-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const multiSelectValueChipClassName = [
  'nx:inline-flex',
  'nx:min-w-0',
  'nx:shrink-0',
  'nx:items-center',
  'nx:rounded-sm',
  'nx:bg-secondary-subtle',
  'nx:text-secondary-subtle-foreground',
  'nx:transition-colors',
  'nx:group-data-[size=sm]/multi-select-trigger:max-w-36',
  'nx:group-data-[size=sm]/multi-select-trigger:gap-1',
  'nx:group-data-[size=sm]/multi-select-trigger:px-1.5',
  'nx:group-data-[size=sm]/multi-select-trigger:py-0.5',
  'nx:group-data-[size=sm]/multi-select-trigger:typography-label-small',
  'nx:group-data-[size=default]/multi-select-trigger:max-w-40',
  'nx:group-data-[size=default]/multi-select-trigger:gap-1',
  'nx:group-data-[size=default]/multi-select-trigger:px-2',
  'nx:group-data-[size=default]/multi-select-trigger:py-1',
  'nx:group-data-[size=default]/multi-select-trigger:typography-label-default',
  'nx:group-data-[size=lg]/multi-select-trigger:max-w-48',
  'nx:group-data-[size=lg]/multi-select-trigger:gap-1.5',
  'nx:group-data-[size=lg]/multi-select-trigger:px-2.5',
  'nx:group-data-[size=lg]/multi-select-trigger:py-1',
  'nx:group-data-[size=lg]/multi-select-trigger:typography-label-default',
].join(' ');

type MultiSelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: readonly string[];
  selectedValueSet: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, React.ReactNode>;
  single: boolean;
  disabled: boolean;
  readOnly: boolean;
  onItemAdded: (value: string, label: React.ReactNode) => void;
};

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(
  null
);
const MultiSelectRegistrationContext = React.createContext(false);

function useMultiSelectContext(component: string) {
  const context = React.useContext(MultiSelectContext);

  if (!context) {
    throw new Error(`${component} must be used inside <MultiSelect>.`);
  }

  return context;
}

function useControllableArrayState({
  prop,
  defaultProp,
  onChange,
}: {
  prop: readonly string[] | undefined;
  defaultProp: readonly string[];
  onChange?: (value: string[]) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>([
    ...defaultProp,
  ]);
  const isControlled = prop !== undefined;
  const value = isControlled ? [...prop] : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: string[]) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue] as const;
}

function useControllableBooleanState({
  prop,
  defaultProp,
  onChange,
}: {
  prop: boolean | undefined;
  defaultProp: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: boolean) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue] as const;
}

/**
 * MultiSelectProps
 *
 * Props for the WDS-style MultiSelect root. Prefer the compositional API:
 * render `MultiSelectTrigger`, `MultiSelectValue`, `MultiSelectContent`,
 * `MultiSelectGroup`, and `MultiSelectItem` as children.
 */
interface MultiSelectProps {
  /**
   * MultiSelect subcomponents.
   */
  children: React.ReactNode;
  /**
   * Controlled selected values.
   */
  values?: readonly string[];
  /**
   * Controlled selected values. Alias kept for parity with Combobox.
   */
  value?: readonly string[];
  /**
   * Initial selected values for uncontrolled usage.
   */
  defaultValues?: readonly string[];
  /**
   * Initial selected values for uncontrolled usage. Alias kept for parity with
   * Combobox.
   */
  defaultValue?: readonly string[];
  /**
   * Called when selected values change.
   */
  onValuesChange?: (values: string[]) => void;
  /**
   * Called when selected values change. Alias kept for parity with Combobox.
   */
  onValueChange?: (values: string[]) => void;
  /**
   * Controlled popup state.
   */
  open?: boolean;
  /**
   * Initial popup state for uncontrolled usage.
   */
  defaultOpen?: boolean;
  /**
   * Called when the popup opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether selecting an item should replace the current value and close the
   * popup, matching single-select behavior.
   * @default false
   */
  single?: boolean;
  /**
   * Disables value changes and trigger interaction for the whole component.
   */
  disabled?: boolean;
  /**
   * Allows focus and reading selected values while preventing edits.
   */
  readOnly?: boolean;
  /**
   * Form field name. Each selected value is mirrored into a hidden input.
   */
  name?: string;
}

/**
 * MultiSelect
 *
 * Searchable multi-value selection primitive adapted from the WDS shadcn
 * registry pattern. It composes a Popover trigger/content with Command-powered
 * filtering and chip-style selected values.
 *
 * @example
 * ```tsx
 * <MultiSelect defaultValues={['next']}>
 *   <MultiSelectTrigger aria-label="Frameworks">
 *     <MultiSelectValue placeholder="Select frameworks..." />
 *   </MultiSelectTrigger>
 *   <MultiSelectContent>
 *     <MultiSelectGroup>
 *       <MultiSelectItem value="next">Next.js</MultiSelectItem>
 *       <MultiSelectItem value="remix">Remix</MultiSelectItem>
 *     </MultiSelectGroup>
 *   </MultiSelectContent>
 * </MultiSelect>
 * ```
 */
function MultiSelect({
  children,
  values,
  value,
  defaultValues,
  defaultValue,
  onValuesChange,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  single = false,
  disabled = false,
  readOnly = false,
  name,
}: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = useControllableArrayState({
    prop: values ?? value,
    defaultProp: defaultValues ?? defaultValue ?? [],
    onChange: onValuesChange ?? onValueChange,
  });
  const [open, setOpen] = useControllableBooleanState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });
  const selectedValueSet = React.useMemo(
    () => new Set(selectedValues),
    [selectedValues]
  );
  const [items, setItems] = React.useState<Map<string, React.ReactNode>>(
    () => new Map()
  );

  const toggleValue = React.useCallback(
    (nextValue: string) => {
      if (disabled || readOnly) return;

      const nextValues = single
        ? selectedValueSet.has(nextValue)
          ? []
          : [nextValue]
        : selectedValueSet.has(nextValue)
          ? selectedValues.filter((item) => item !== nextValue)
          : [...selectedValues, nextValue];

      setSelectedValues(nextValues);
      if (single) setOpen(false);
    },
    [
      disabled,
      readOnly,
      selectedValueSet,
      selectedValues,
      setOpen,
      setSelectedValues,
      single,
    ]
  );

  const onItemAdded = React.useCallback(
    (itemValue: string, label: React.ReactNode) => {
      setItems((currentItems) => {
        if (currentItems.get(itemValue) === label) return currentItems;

        const nextItems = new Map(currentItems);
        nextItems.set(itemValue, label);
        return nextItems;
      });
    },
    []
  );

  const contextValue = React.useMemo<MultiSelectContextValue>(
    () => ({
      open,
      setOpen,
      selectedValues,
      selectedValueSet,
      toggleValue,
      items,
      single,
      disabled,
      readOnly,
      onItemAdded,
    }),
    [
      disabled,
      items,
      onItemAdded,
      open,
      readOnly,
      selectedValueSet,
      selectedValues,
      setOpen,
      single,
      toggleValue,
    ]
  );

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen} modal>
        {children}
      </Popover>
      {name
        ? selectedValues.map((item) => (
            <input key={item} type="hidden" name={name} value={item} />
          ))
        : null}
    </MultiSelectContext.Provider>
  );
}

/**
 * MultiSelectTriggerProps
 *
 * Props for the MultiSelect trigger button.
 */
interface MultiSelectTriggerProps
  extends
    React.ComponentProps<'button'>,
    VariantProps<typeof multiSelectTriggerVariants> {}

/**
 * MultiSelectTrigger
 *
 * Button-like field surface that opens the multi-select popover. It mirrors the
 * Select trigger's default and borderless field treatments.
 */
function MultiSelectTrigger({
  className,
  children,
  variant,
  size,
  disabled,
  type = 'button',
  role = 'combobox',
  ...props
}: MultiSelectTriggerProps) {
  const {
    open,
    selectedValues,
    disabled: contextDisabled,
  } = useMultiSelectContext('MultiSelectTrigger');
  const semanticSize = size ?? 'default';
  const isDisabled = contextDisabled || disabled;

  return (
    <PopoverTrigger asChild>
      <button
        data-slot="multi-select-trigger"
        data-state={open ? 'open' : 'closed'}
        data-empty={selectedValues.length === 0 ? 'true' : undefined}
        data-placeholder={selectedValues.length === 0 ? 'true' : undefined}
        data-size={semanticSize}
        data-variant={variant ?? 'default'}
        type={type}
        role={role}
        aria-expanded={open}
        disabled={isDisabled}
        className={cn(
          multiSelectTriggerVariants({
            size: semanticSize,
            variant,
            className,
          })
        )}
        {...props}
      >
        {children}
        <IconChevronDown
          data-slot="multi-select-trigger-icon"
          aria-hidden="true"
          className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:transition-transform nx:group-data-[state=open]/multi-select-trigger:rotate-180 nx:group-disabled/multi-select-trigger:text-disabled-foreground"
        />
      </button>
    </PopoverTrigger>
  );
}

/**
 * MultiSelectValueProps
 *
 * Props for the selected-value renderer.
 */
interface MultiSelectValueProps extends Omit<
  React.ComponentProps<'span'>,
  'children'
> {
  /**
   * Placeholder shown when no values are selected.
   */
  placeholder?: React.ReactNode;
  /**
   * Whether clicking a selected chip removes it.
   * @default true
   */
  clickToRemove?: boolean;
  /**
   * How selected chips behave when they exceed the trigger width.
   * @default 'wrap-when-open'
   */
  overflowBehavior?: 'wrap' | 'wrap-when-open' | 'cutoff';
}

/**
 * MultiSelectValue
 *
 * Displays selected values as chips. In the default `wrap-when-open` mode,
 * chips collapse into a `+N` counter while closed and wrap when the popup opens.
 */
function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  overflowBehavior = 'wrap-when-open',
  className,
  ...props
}: MultiSelectValueProps) {
  const {
    open,
    selectedValues,
    items,
    toggleValue,
    disabled,
    readOnly,
    selectedValueSet,
  } = useMultiSelectContext('MultiSelectValue');
  const [overflowAmount, setOverflowAmount] = React.useState(0);
  const valueRef = React.useRef<HTMLSpanElement>(null);
  const overflowRef = React.useRef<HTMLSpanElement>(null);
  const shouldWrap =
    overflowBehavior === 'wrap' ||
    (overflowBehavior === 'wrap-when-open' && open);

  const checkOverflow = React.useCallback(() => {
    const containerElement = valueRef.current;
    if (!containerElement) return;

    const overflowElement = overflowRef.current;
    const selectedItems = containerElement.querySelectorAll<HTMLElement>(
      '[data-selected-item]'
    );

    selectedItems.forEach((item) => item.style.removeProperty('display'));
    overflowElement?.style.setProperty('display', 'none');

    if (shouldWrap) {
      setOverflowAmount(0);
      return;
    }

    let nextOverflowAmount = 0;

    for (let index = selectedItems.length - 1; index >= 0; index -= 1) {
      if (containerElement.scrollWidth <= containerElement.clientWidth) break;

      selectedItems[index]?.style.setProperty('display', 'none');
      overflowElement?.style.removeProperty('display');
      nextOverflowAmount = selectedItems.length - index;
    }

    setOverflowAmount(nextOverflowAmount);
  }, [shouldWrap]);

  React.useLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow, items, open, selectedValueSet, selectedValues]);

  React.useLayoutEffect(() => {
    const containerElement = valueRef.current;
    if (!containerElement) return;

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(containerElement);

    return () => observer.disconnect();
  }, [checkOverflow]);

  const handleChipPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLSpanElement>, selectedValue: string) => {
      if (!clickToRemove || disabled || readOnly) return;

      event.preventDefault();
      event.stopPropagation();
      toggleValue(selectedValue);
    },
    [clickToRemove, disabled, readOnly, toggleValue]
  );

  if (selectedValues.length === 0) {
    return (
      <span
        data-slot="multi-select-value"
        data-placeholder="true"
        className={cn(
          'nx:min-w-0 nx:flex-1 nx:truncate nx:text-left nx:text-muted-foreground',
          className
        )}
        {...props}
      >
        {placeholder}
      </span>
    );
  }

  return (
    <span
      ref={valueRef}
      data-slot="multi-select-value"
      data-overflow-behavior={overflowBehavior}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:items-center nx:gap-1 nx:text-left',
        shouldWrap
          ? 'nx:flex-wrap nx:overflow-visible'
          : 'nx:flex-nowrap nx:overflow-hidden',
        className
      )}
      {...props}
    >
      {selectedValues.map((selectedValue) => {
        const label = items.get(selectedValue) ?? selectedValue;

        return (
          <span
            key={selectedValue}
            data-slot="multi-select-value-chip"
            data-selected-item=""
            className={multiSelectValueChipClassName}
            onPointerDown={(event) =>
              handleChipPointerDown(event, selectedValue)
            }
          >
            <span
              data-slot="multi-select-value-chip-label"
              className="nx:min-w-0 nx:truncate"
            >
              {label}
            </span>
            {clickToRemove ? (
              <IconX
                data-slot="multi-select-value-chip-remove-icon"
                aria-hidden="true"
                className="nx:size-3 nx:shrink-0 nx:text-muted-foreground"
              />
            ) : null}
          </span>
        );
      })}
      <span
        ref={overflowRef}
        data-slot="multi-select-value-overflow"
        className={cn(multiSelectValueChipClassName, 'nx:hidden')}
      >
        +{overflowAmount}
      </span>
    </span>
  );
}

/**
 * MultiSelectContentProps
 *
 * Props for the MultiSelect popover content.
 */
interface MultiSelectContentProps extends Omit<
  PopoverContentProps,
  'children'
> {
  /**
   * Whether to render the Command search input, or search copy overrides.
   * @default true
   */
  search?: boolean | { placeholder?: string; emptyMessage?: React.ReactNode };
  /**
   * MultiSelect groups and items.
   */
  children: React.ReactNode;
}

/**
 * MultiSelectContent
 *
 * Popover content with a Command-powered searchable list.
 */
function MultiSelectContent({
  search = true,
  children,
  className,
  align = 'start',
  sideOffset = 4,
  'aria-label': ariaLabel,
  ...props
}: MultiSelectContentProps) {
  const canSearch = typeof search === 'object' ? true : search;
  const searchPlaceholder =
    typeof search === 'object' ? search.placeholder : undefined;
  const emptyMessage =
    typeof search === 'object' ? search.emptyMessage : 'No options found.';

  return (
    <>
      <MultiSelectRegistrationContext.Provider value>
        {children}
      </MultiSelectRegistrationContext.Provider>
      <PopoverContent
        data-slot="multi-select-content"
        aria-label={ariaLabel ?? 'Multi-select options'}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'nx:w-(--radix-popover-trigger-width) nx:min-w-(--radix-popover-trigger-width) nx:overflow-hidden nx:p-0',
          className
        )}
        {...props}
      >
        <Command label={searchPlaceholder ?? 'Multi-select options'}>
          {canSearch ? (
            <CommandInput
              data-slot="multi-select-search"
              placeholder={searchPlaceholder}
            />
          ) : null}
          <CommandList data-slot="multi-select-list">
            {canSearch ? (
              <CommandEmpty
                data-slot="multi-select-empty"
                role="option"
                aria-disabled="true"
              >
                {emptyMessage}
              </CommandEmpty>
            ) : null}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  );
}

/**
 * MultiSelectGroupProps
 *
 * Props for a group of related MultiSelect items.
 */
interface MultiSelectGroupProps extends React.ComponentProps<
  typeof CommandGroup
> {}

/**
 * MultiSelectGroup
 *
 * Groups related MultiSelect items. Items should be wrapped in a group for
 * consistent Command list spacing.
 */
function MultiSelectGroup({ className, ...props }: MultiSelectGroupProps) {
  const registrationOnly = React.useContext(MultiSelectRegistrationContext);

  if (registrationOnly) return <>{props.children}</>;

  return (
    <CommandGroup
      data-slot="multi-select-group"
      className={cn('nx:p-1', className)}
      {...props}
    />
  );
}

/**
 * MultiSelectSeparatorProps
 *
 * Props for the decorative separator between groups.
 */
interface MultiSelectSeparatorProps extends React.ComponentProps<
  typeof CommandSeparator
> {}

/**
 * MultiSelectSeparator
 *
 * Decorative separator between MultiSelect groups.
 */
function MultiSelectSeparator({
  className,
  ...props
}: MultiSelectSeparatorProps) {
  const registrationOnly = React.useContext(MultiSelectRegistrationContext);

  if (registrationOnly) return null;

  return (
    <CommandSeparator
      data-slot="multi-select-separator"
      className={className}
      {...props}
    />
  );
}

/**
 * MultiSelectItemProps
 *
 * Props for a selectable MultiSelect option.
 */
interface MultiSelectItemProps extends Omit<
  React.ComponentProps<typeof CommandItem>,
  'value' | 'onSelect'
> {
  /**
   * Submitted value for this option.
   */
  value: string;
  /**
   * Optional label rendered in the selected-value chip. Defaults to children.
   */
  badgeLabel?: React.ReactNode;
  /**
   * Called after the item is selected.
   */
  onSelect?: (value: string) => void;
}

/**
 * MultiSelectItem
 *
 * Selectable Command item with a persistent check indicator.
 */
function MultiSelectItem({
  value,
  children,
  badgeLabel,
  className,
  onSelect,
  disabled,
  keywords,
  ...props
}: MultiSelectItemProps) {
  const { selectedValueSet, toggleValue, onItemAdded } =
    useMultiSelectContext('MultiSelectItem');
  const registrationOnly = React.useContext(MultiSelectRegistrationContext);
  const isSelected = selectedValueSet.has(value);
  const textLabel = typeof children === 'string' ? children : undefined;

  React.useEffect(() => {
    onItemAdded(value, badgeLabel ?? children);
  }, [badgeLabel, children, onItemAdded, value]);

  if (registrationOnly) return null;

  return (
    <CommandItem
      data-slot="multi-select-item"
      data-selected={isSelected ? 'true' : undefined}
      aria-selected={isSelected}
      value={value}
      disabled={disabled}
      keywords={keywords ?? (textLabel ? [textLabel] : undefined)}
      className={cn('nx:data-[selected=true]:bg-popover-hover', className)}
      onSelect={(selectedValue) => {
        onSelect?.(selectedValue);
        if (!disabled) toggleValue(value);
      }}
      {...props}
    >
      <span
        data-slot="multi-select-item-indicator"
        aria-hidden="true"
        className={cn(
          'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default',
          isSelected &&
            'nx:border-primary-background nx:bg-primary-background nx:text-primary-foreground'
        )}
      >
        {isSelected ? (
          <IconCheck
            data-slot="multi-select-item-indicator-icon"
            className="nx:size-3.5"
          />
        ) : null}
      </span>
      <span
        data-slot="multi-select-item-label"
        className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5"
      >
        {children}
      </span>
    </CommandItem>
  );
}

export {
  MultiSelect,
  MultiSelectContent,
  type MultiSelectContentProps,
  MultiSelectGroup,
  type MultiSelectGroupProps,
  MultiSelectItem,
  type MultiSelectItemProps,
  type SelectionOption as MultiSelectOption,
  type SelectionOptionGroup as MultiSelectOptionGroup,
  type SelectionOptionInput as MultiSelectOptionInput,
  type MultiSelectProps,
  MultiSelectSeparator,
  type MultiSelectSeparatorProps,
  MultiSelectTrigger,
  type MultiSelectTriggerProps,
  MultiSelectValue,
  type MultiSelectValueProps,
};
